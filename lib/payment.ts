import { PaymentMethod, PaymentStatus } from '@prisma/client';
import prisma from './prisma';
import { EmailService } from './email';

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

export class PaymentService {
  private static validateMPESAPhoneNumber(phoneNumber: string): boolean {
    // M-PESA phone numbers should be 10 digits starting with 254
    const phoneRegex = /^254[0-9]{9}$/;
    return phoneRegex.test(phoneNumber);
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
          service: true
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
            throw new Error('Invalid M-PESA phone number format. Must be 10 digits starting with 254');
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

      switch (method) {
        case 'MPESA':
          // Here you would integrate with M-PESA API
          // For now, we'll simulate a successful payment
          paymentStatus = 'COMPLETED';
          transactionId = `MPESA_${Date.now()}`;
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
          transactionId
        );
      } else {
        await EmailService.sendPaymentNotification(
          booking.customer.email,
          paymentStatus,
          method,
          details.amount,
          transactionId,
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
    transactionId: string,
    status: 'SUCCESS' | 'FAILED'
  ) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { transactionId },
        include: { 
          booking: {
            include: {
              customer: true,
              service: true
            }
          }
        },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      const newStatus: PaymentStatus = status === 'SUCCESS' ? 'COMPLETED' : 'FAILED';

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: newStatus },
      });

      // Update booking status if payment is successful
      if (newStatus === 'COMPLETED') {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' },
        });
      }

      // Send email notification for status change
      await EmailService.sendPaymentNotification(
        payment.booking.customer.email,
        newStatus,
        payment.method,
        payment.amount,
        transactionId,
        payment.bookingId
      );

      return payment;
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