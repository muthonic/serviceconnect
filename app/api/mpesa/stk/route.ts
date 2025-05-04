import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DarajaAPI } from '@/lib/daraja';
import prisma from '@/lib/prisma';

/**
 * API endpoint to initiate M-PESA STK push directly
 * This can be used for testing or for custom payment flows
 */
export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const { phoneNumber, amount, bookingId } = await request.json();

    // Validate the request
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Check if the booking exists and belongs to the user
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

    // Format account reference (shortened booking ID)
    const accountReference = `SC-${bookingId.slice(0, 8)}`;
    const transactionDesc = `Payment for ${booking.service.name}`;

    try {
      // Initiate STK push
      const stkResponse = await DarajaAPI.initiateSTKPush(
        phoneNumber,
        amount,
        accountReference,
        transactionDesc
      );

      // Create a payment record
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: Number(amount),
          method: 'MPESA',
          status: 'PENDING',
          transactionId: stkResponse.CheckoutRequestID,
          merchantRequestId: stkResponse.MerchantRequestID,
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'STK push initiated successfully',
        data: {
          paymentId: payment.id,
          checkoutRequestId: stkResponse.CheckoutRequestID,
          customerMessage: stkResponse.CustomerMessage
        } 
      });
    } catch (error) {
      console.error('M-PESA STK push error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to initiate payment' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('M-PESA STK push request error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 