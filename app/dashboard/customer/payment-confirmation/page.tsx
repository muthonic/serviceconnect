'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentStatus } from '@prisma/client';
import Link from 'next/link';

export default function PaymentConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkoutRequestId = searchParams.get('checkout_request_id');
    const booking = searchParams.get('booking_id');

    if (booking) {
      setBookingId(booking);
    }

    if (!checkoutRequestId) {
      setError('Missing payment information');
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/mpesa/status?checkout_request_id=${checkoutRequestId}`);
        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }

        const data = await response.json();
        setStatus(data.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check payment status');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
    
    // Poll for payment status updates
    const interval = setInterval(async () => {
      if (status !== 'COMPLETED' && status !== 'FAILED') {
        await checkPaymentStatus();
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [searchParams, status]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Checking Payment Status</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-center">Payment Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <Link
              href="/user/bookings"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-white shadow rounded-lg p-6">
        {status === 'COMPLETED' ? (
          <>
            <div className="text-center text-green-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-center">Payment Successful!</h2>
            <p className="text-gray-600 text-center mb-6">
              Your payment has been processed successfully. Your booking is now confirmed.
            </p>
          </>
        ) : status === 'FAILED' ? (
          <>
            <div className="text-center text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-center">Payment Failed</h2>
            <p className="text-gray-600 text-center mb-6">
              Your payment could not be processed. Please try again or choose a different payment method.
            </p>
          </>
        ) : (
          <>
            <div className="text-center text-yellow-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-center">Payment Pending</h2>
            <p className="text-gray-600 text-center mb-6">
              Your payment is being processed. Please check your phone for the M-PESA prompt and enter your PIN to complete the payment.
            </p>
          </>
        )}

        <div className="flex justify-center space-x-4">
          <Link
            href="/user/bookings"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View My Bookings
          </Link>
          {(status === 'FAILED' || status === 'PENDING') && bookingId && (
            <Link
              href={`/dashboard/customer/payment?booking_id=${bookingId}`}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            >
              Try Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 