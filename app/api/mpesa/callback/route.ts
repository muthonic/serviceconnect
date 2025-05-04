import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment';

/**
 * M-PESA STK push callback handler
 * This endpoint receives callbacks from Safaricom after STK push payments
 */
export async function POST(request: Request) {
  try {
    console.log('M-PESA callback received');
    
    // Parse the callback data
    const callbackData = await request.json();
    console.log('M-PESA callback data:', JSON.stringify(callbackData, null, 2));

    // In sandbox, you might want to simulate a successful payment
    // In production, extract data from the callback
    
    // The callback structure from M-PESA is complex - here's what we need
    const Body = callbackData.Body || {};
    const stkCallback = Body.stkCallback || {};
    
    const CheckoutRequestID = stkCallback.CheckoutRequestID;
    const ResultCode = stkCallback.ResultCode?.toString();
    const ResultDesc = stkCallback.ResultDesc;
    
    if (!CheckoutRequestID) {
      console.error('Invalid M-PESA callback: missing CheckoutRequestID');
      return NextResponse.json({ success: false, error: 'Invalid callback data' }, { status: 400 });
    }
    
    if (ResultCode === undefined) {
      console.error('Invalid M-PESA callback: missing ResultCode');
      return NextResponse.json({ success: false, error: 'Invalid callback data' }, { status: 400 });
    }
    
    // Handle the payment
    const payment = await PaymentService.handleMPESACallback(
      CheckoutRequestID,
      ResultCode,
      ResultDesc || 'No description provided'
    );
    
    console.log(`M-PESA payment ${payment.id} updated to ${payment.status}`);
    
    // Return a success response to Safaricom
    return NextResponse.json({ 
      success: true, 
      message: 'Callback processed successfully' 
    });
    
  } catch (error) {
    console.error('M-PESA callback error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 