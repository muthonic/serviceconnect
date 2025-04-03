import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentService } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, method, amount, phoneNumber, cardDetails } = body;

    // Validate required fields
    if (!bookingId || !method || !amount) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate M-PESA specific fields
    if (method === 'MPESA' && !phoneNumber) {
      return NextResponse.json(
        { message: 'Phone number is required for M-PESA payments' },
        { status: 400 }
      );
    }

    // Validate card payment specific fields
    if ((method === 'CREDIT_CARD' || method === 'DEBIT_CARD') && !cardDetails) {
      return NextResponse.json(
        { message: 'Card details are required for card payments' },
        { status: 400 }
      );
    }

    // Process the payment
    const payment = await PaymentService.processPayment({
      bookingId,
      method,
      amount,
      phoneNumber,
      cardDetails,
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { message: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 