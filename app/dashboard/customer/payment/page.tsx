'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MPESAPaymentForm from '@/components/MPESAPaymentForm';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FaCreditCard } from 'react-icons/fa';

interface Booking {
  id: string;
  amount: number;
  service: {
    name: string;
  };
}

interface PendingBooking {
  id: string;
  amount: number;
  date: string;
  service: {
    name: string;
  };
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bookingId = searchParams.get('booking_id');
    
    if (!bookingId) {
      // No booking ID, fetch all pending bookings that need payment
      fetchPendingBookings();
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }

        const data = await response.json();
        setBooking(data);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [searchParams]);

  const fetchPendingBookings = async () => {
    try {
      // Fetch all pending bookings that need payment
      const response = await fetch('/api/bookings?status=PENDING&needsPayment=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending bookings');
      }

      const data = await response.json();
      setPendingBookings(data);
    } catch (err) {
      console.error('Error fetching pending bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pending bookings');
      toast.error('Failed to load pending bookings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Payment Details</h2>
          <p className="text-gray-600">Please wait while we retrieve your booking information...</p>
        </div>
      </div>
    );
  }

  // If no booking ID was provided, show the list of pending bookings
  if (!searchParams.get('booking_id')) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-6">Pending Payments</h1>
        
        {pendingBookings.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-blue-500 mb-4">
              <FaCreditCard className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Pending Payments</h2>
            <p className="text-gray-600 mb-6">You don't have any bookings that need payment at this time.</p>
            <Link 
              href="/user/bookings"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View My Bookings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">{booking.service.name}</h2>
                    <p className="text-gray-600">Date: {new Date(booking.date).toLocaleDateString()}</p>
                    <p className="text-gray-600">Amount: Ksh{booking.amount}</p>
                  </div>
                  <Link
                    href={`/dashboard/customer/payment?booking_id=${booking.id}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <FaCreditCard className="mr-2" />
                    Pay Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-center">Payment Error</h2>
          <p className="text-gray-600 text-center mb-6">{error || 'Booking not found'}</p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/user/bookings')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
        <p className="text-gray-600">
          Pay for your booking of <span className="font-semibold">{booking.service.name}</span> using M-PESA.
        </p>
      </div>
      
      <MPESAPaymentForm 
        bookingId={booking.id} 
        amount={booking.amount} 
        onPaymentInitiated={() => {
          toast.success('M-PESA payment initiated successfully!');
        }}
      />
      
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/user/bookings')}
          className="text-blue-600 hover:text-blue-800"
        >
          Cancel and return to bookings
        </button>
      </div>
    </div>
  );
} 