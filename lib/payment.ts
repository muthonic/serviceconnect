import { PaymentMethod, PaymentStatus } from '@prisma/client';
import prisma from './prisma';
import { EmailService } from './email';
import { DarajaAPI } from './daraja';

interface PaymentDetails {
  amount: number;
  phoneNumber?: string; // For M-PESA
  email?: string; // For other payment methods
  cardDetails?: {
    number: string;
    expiry: string;
    cvv: string;
  };
}

interface STKPushResult {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export class PaymentService {
  private static validateMPESAPhoneNumber(phoneNumber: string): boolean {
    try {
      // Just validate if we can format it
      DarajaAPI.formatPhoneNumber(phoneNumber);
      return true;
    } catch (error) {
      return false;
    }
  }

  private static validateCardDetails(cardDetails: { number: string; expiry: string; cvv: string }): boolean {
    // Basic card validation
    const cardNumberRegex = /^[0-9]{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    const cvvRegex = /^[0-9]{3,4}$/;

    return (
      cardNumberRegex.test(cardDetails.number.replace(/\s/g, '')) &&
      expiryRegex.test(cardDetails.expiry) &&
      cvvRegex.test(cardDetails.cvv)
    );
  }

  static async processPayment(
    bookingId: string,
    method: PaymentMethod,
    details: PaymentDetails
  ) {
    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { 
          payment: true,
          customer: true,
          service: {
            include: {
              technician: {
                include: {
                  user: true
                }
              }
            }
          }
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.payment) {
        throw new Error('Payment already exists for this booking');
      }

      // Validate payment details based on method
      switch (method) {
        case 'MPESA':
          if (!details.phoneNumber) {
            throw new Error('Phone number is required for M-PESA payments');
          }
          if (!this.validateMPESAPhoneNumber(details.phoneNumber)) {
            throw new Error('Invalid M-PESA phone number format');
          }
          break;

        case 'CREDIT_CARD':
        case 'DEBIT_CARD':
          if (!details.cardDetails) {
            throw new Error('Card details are required');
          }
          if (!this.validateCardDetails(details.cardDetails)) {
            throw new Error('Invalid card details');
          }
          break;
      }

      // Process payment based on method
      let paymentStatus: PaymentStatus = 'PENDING';
      let transactionId: string | null = null;
      let mpesaRequestId: string | null = null;

      switch (method) {
        case 'MPESA':
          // Integrate with M-PESA API to send STK push
          try {
            const accountReference = `SC-${bookingId.slice(0, 8)}`; // Short reference for M-PESA
            const transactionDesc = `Payment for ${booking.service.name}`;
            
            const stkResult = await DarajaAPI.initiateSTKPush(
              details.phoneNumber!,
              details.amount,
              accountReference,
              transactionDesc
            );
            
            // Save the M-PESA request IDs for future reference
            transactionId = stkResult.CheckoutRequestID;
            mpesaRequestId = stkResult.MerchantRequestID;
            
            // Payment remains pending until callback is received
            paymentStatus = 'PENDING';
            
            console.log(`STK push sent to ${details.phoneNumber} for booking ${bookingId}`);
          } catch (error) {
            console.error('M-PESA payment error:', error);
            throw new Error(`Failed to process M-PESA payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'CREDIT_CARD':
        case 'DEBIT_CARD':
          // Here you would integrate with a payment gateway (e.g., Stripe)
          // For now, we'll simulate a successful payment
          paymentStatus = 'COMPLETED';
          transactionId = `CARD_${Date.now()}`;
          break;

        case 'BANK_TRANSFER':
          // Here you would integrate with bank transfer API
          // For now, we'll simulate a pending payment
          paymentStatus = 'PENDING';
          transactionId = `BANK_${Date.now()}`;
          break;

        case 'CASH':
          paymentStatus = 'PENDING';
          transactionId = `CASH_${Date.now()}`;
          break;
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          bookingId,
          amount: details.amount,
          method,
          status: paymentStatus,
          transactionId,
          merchantRequestId: mpesaRequestId,
        },
      });

      // Update booking status based on payment status
      if (paymentStatus === 'COMPLETED') {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });
      }

      // Send email notifications
      if (method === 'MPESA' && details.phoneNumber) {
        await EmailService.sendMPESAPrompt(
          booking.customer.email,
          details.phoneNumber,
          details.amount,
          transactionId || 'MPESA_PENDING'
        );
      } else {
        await EmailService.sendPaymentNotification(
          booking.customer.email,
          paymentStatus,
          method,
          details.amount,
          transactionId || 'PAYMENT_PENDING',
          bookingId
        );
      }

      return payment;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  static async handleMPESACallback(
    checkoutRequestId: string,
    resultCode: string,
    resultDesc: string
  ) {
    try {
      // Find the payment by transactionId (which is the checkoutRequestId)
      const payment = await prisma.payment.findFirst({
        where: { transactionId: checkoutRequestId },
        include: { 
          booking: {
            include: {
              customer: true,
              service: {
                include: {
                  technician: true
                }
              }
            }
          }
        },
      });

      if (!payment) {
        throw new Error(`Payment not found for checkoutRequestId: ${checkoutRequestId}`);
      }

      // ResultCode 0 means success in M-PESA
      const success = resultCode === '0';
      const newStatus: PaymentStatus = success ? 'COMPLETED' : 'FAILED';

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: newStatus,
          resultCode: resultCode,
          resultDescription: resultDesc
        },
      });

      // Update booking status if payment is successful
      if (newStatus === 'COMPLETED') {
        const updatedBooking = await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' },
        });
        
        // Send booking confirmation email to customer
        try {
          await EmailService.sendBookingConfirmationToCustomer(
            payment.booking.customer.email,
            payment.booking.customer.name || '',
            payment.booking.service.name,
            payment.booking.date,
            payment.booking.startTime,
            payment.booking.amount,
            payment.booking.service.technician.name,
            payment.booking.id,
            'CONFIRMED',
            `${process.env.NEXT_PUBLIC_APP_URL}/user/bookings/${payment.booking.id}`
          );
          console.log('Sending booking confirmation email to customer:', payment.booking.customer.email);
        } catch (emailError) {
          console.error('Failed to send booking confirmation email:', emailError);
        }
      }

      // Send email notification for status change
      await EmailService.sendPaymentNotification(
        payment.booking.customer.email,
        newStatus,
        payment.method,
        payment.amount,
        checkoutRequestId,
        payment.bookingId
      );

      return updatedPayment;
    } catch (error) {
      console.error('M-PESA callback error:', error);
      throw error;
    }
  }

  static async checkPaymentStatus(transactionId: string) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { transactionId },
        include: { booking: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }
} 