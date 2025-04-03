import { PaymentStatus, PaymentMethod } from '@prisma/client';
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
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
          <p>Amount: $${amount}</p>
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
          <p>Amount: $${amount}</p>
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