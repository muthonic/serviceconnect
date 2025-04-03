import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, status } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['SUCCESS', 'FAILED'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    const payment = await PaymentService.handleMPESACallback(
      transactionId,
      status as 'SUCCESS' | 'FAILED'
    );

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error processing M-PESA callback:', error);
    return NextResponse.json(
      { message: 'Failed to process callback' },
      { status: 500 }
    );
  }
} 