import { PaymentStatus, PaymentMethod, BookingStatus } from '@prisma/client';
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface EmailJSParams {
  [key: string]: any;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private static async sendEmail(options: EmailOptions) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        ...options,
      });
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  private static async sendEmailJS(templateParams: EmailJSParams) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: templateParams.template_id,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          accessToken: process.env.EMAILJS_PRIVATE_KEY,
          template_params: templateParams
        }),
      });

      if (!response.ok) {
        throw new Error(`EmailJS responded with ${response.status}: ${await response.text()}`);
      }

      return await response.text();
    } catch (error) {
      console.error('EmailJS sending error:', error);
      throw error;
    }
  }

  static async sendBookingConfirmationToCustomer(
    to_email: string,
    to_name: string,
    service_name: string,
    date: Date,
    time: string,
    amount: number,
    technician_name: string,
    booking_id: string,
    booking_status: BookingStatus,
    action_url: string
  ) {
    console.log(`Sending customer email to: ${to_email} with status: ${booking_status}`);
    
    // Customize the message based on booking status
    let statusMessage = '';
    let headerText = '';
    
    if (booking_status === 'CONFIRMED') {
      headerText = 'Booking Confirmed';
      statusMessage = `Your booking for ${service_name} has been confirmed! The technician will arrive at the scheduled date and time.`;
      console.log('Using CONFIRMED template');
    } else if (booking_status === 'CANCELLED') {
      headerText = 'Booking Cancelled';
      statusMessage = `Unfortunately, your booking request for ${service_name} could not be accommodated at this time.`;
      console.log('Using CANCELLED template');
    } else if (booking_status === 'COMPLETED') {
      headerText = 'Service Completed';
      statusMessage = `Your service booking for ${service_name} has been marked as completed. Thank you for using our service!`;
      console.log('Using COMPLETED template');
    } else {
      headerText = `Booking ${booking_status}`;
      statusMessage = `Your booking for ${service_name} has been updated to ${booking_status.toLowerCase()}.`;
      console.log('Using default template for status:', booking_status);
    }
    
    const templateParams = {
      template_id: process.env.EMAILJS_CUSTOMER_TEMPLATE_ID,
      to_email,
      to_name,
      from_name: 'ServiceConnect',
      subject: `Booking ${booking_status}`,
      header: headerText,
      message: statusMessage,
      action_text: 'View Booking Details',
      action_url,
      booking_id,
      service_name,
      date,
      time: time || 'N/A',
      amount,
      customer_name: to_name,
      customer_email: to_email,
      technician_name,
      booking_status
    };
    
    console.log('Template params:', templateParams);
    return this.sendEmailJS(templateParams);
  }

  static async sendBookingNotificationToTechnician(
    to_email: string,
    to_name: string,
    service_name: string,
    date: Date,
    time: string,
    amount: number,
    customer_name: string,
    booking_id: string,
    action_url: string
  ) {
    console.log(`Sending technician email to: ${to_email}`);
    
    const templateParams = {
      template_id: process.env.EMAILJS_TECHNICIAN_TEMPLATE_ID,
      to_email,
      to_name,
      from_name: 'ServiceConnect',
      subject: 'New Booking Request',
      header: 'New Booking Request',
      message: `You have a new booking request for ${service_name} on ${date.toDateString()} at ${time || 'a time'}.`,
      action_text: 'Review Booking',
      action_url,
      booking_id,
      service_name,
      date,
      time: time || 'N/A',
      amount,
      customer_name,
      technician_name: to_name,
      booking_status: 'PENDING'
    };
    
    console.log('Template params:', templateParams);
    return this.sendEmailJS(templateParams);
  }

  static async sendPaymentNotification(
    to: string,
    paymentStatus: PaymentStatus,
    paymentMethod: PaymentMethod,
    amount: number,
    transactionId: string,
    bookingId: string
  ) {
    const subject = `Payment ${paymentStatus.toLowerCase()} for booking ${bookingId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment ${paymentStatus}</h2>
        <p>Dear customer,</p>
        <p>Your payment for booking ${bookingId} has been ${paymentStatus.toLowerCase()}.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Transaction Details:</strong></p>
          <p>Amount: Ksh${amount}</p>
          <p>Method: ${paymentMethod.replace('_', ' ')}</p>
          <p>Transaction ID: ${transactionId}</p>
        </div>
        <p>Thank you for choosing our service!</p>
        <p>Best regards,<br>ServiceConnect Team</p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }

  static async sendMPESAPrompt(
    to: string,
    phoneNumber: string,
    amount: number,
    transactionId: string
  ) {
    const subject = 'M-PESA Payment Prompt';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>M-PESA Payment Prompt</h2>
        <p>Dear customer,</p>
        <p>You have received an M-PESA payment prompt on your phone number ${phoneNumber}.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Payment Details:</strong></p>
          <p>Amount: Ksh${amount}</p>
          <p>Transaction ID: ${transactionId}</p>
        </div>
        <p>Please complete the payment on your phone to confirm your booking.</p>
        <p>Thank you for choosing our service!</p>
        <p>Best regards,<br>ServiceConnect Team</p>
      </div>
    `;

    await this.sendEmail({ to, subject, html });
  }
} 