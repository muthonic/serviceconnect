import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * API endpoint to check the status of an M-PESA payment
 */
export async function GET(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the query parameters
    const url = new URL(request.url);
    const checkoutRequestId = url.searchParams.get('checkout_request_id');

    // Validate the request
    if (!checkoutRequestId) {
      return NextResponse.json({ error: 'Checkout request ID is required' }, { status: 400 });
    }

    // Find the payment by transactionId (which is the checkoutRequestId for M-PESA)
    const payment = await prisma.payment.findFirst({
      where: { 
        transactionId: checkoutRequestId,
      },
      include: {
        booking: {
          include: {
            customer: true,
            service: true
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Check if the user is the customer who made the booking or is a technician
    if (
      payment.booking.customerId !== session.user.id && 
      session.user.role !== 'TECHNICIAN' &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Not authorized to view this payment' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      resultCode: payment.resultCode,
      resultDescription: payment.resultDescription
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 