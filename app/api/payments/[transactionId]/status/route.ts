import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentService } from '@/lib/payment';

export async function GET(
  request: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payment = await PaymentService.checkPaymentStatus(params.transactionId);

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { message: 'Failed to check payment status' },
      { status: 500 }
    );
  }
} 