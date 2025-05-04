import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PaymentService } from '@/lib/payment';
import { PaymentMethod } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.id;
    const { method, amount, phoneNumber, cardDetails } = await request.json();

    // Validate payment method
    if (!method || !Object.values(PaymentMethod).includes(method as PaymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Verify booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: { 
        id: bookingId,
        customerId: session.user.id 
      },
      include: {
        service: true,
        payment: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.payment) {
      return NextResponse.json({ error: 'Payment already exists for this booking' }, { status: 400 });
    }

    // Process the payment
    const paymentDetails = {
      amount: amount || booking.amount,
      phoneNumber,
      cardDetails
    };

    const payment = await PaymentService.processPayment(
      bookingId,
      method as PaymentMethod,
      paymentDetails
    );

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        method: payment.method,
        amount: payment.amount
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process payment' 
    }, { status: 500 });
  }
} 