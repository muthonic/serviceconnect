import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface MPESAPaymentFormProps {
  bookingId: string;
  amount: number;
  onPaymentInitiated?: () => void;
}

export default function MPESAPaymentForm({ bookingId, amount, onPaymentInitiated }: MPESAPaymentFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/mpesa/stk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          amount,
          bookingId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      toast.success('Payment initiated! Check your phone for the M-PESA prompt');
      
      // Call the callback if provided
      if (onPaymentInitiated) {
        onPaymentInitiated();
      }

      // Redirect to payment confirmation page
      const checkoutRequestId = data.data?.checkoutRequestId;
      if (checkoutRequestId) {
        router.push(`/dashboard/customer/payment-confirmation?checkout_request_id=${checkoutRequestId}&booking_id=${bookingId}`);
      } else {
        // Fallback to bookings page if no checkout request ID
        router.push('/dashboard/customer/bookings');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process payment');
      toast.error(error instanceof Error ? error.message : 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value);
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Pay with M-PESA</h3>
      
      <div className="mb-4">
        <p className="text-gray-600">
          Enter your phone number to receive an M-PESA payment prompt.
        </p>
      </div>

      <div className="mb-2">
        <p className="font-medium text-gray-900">Amount: <span className="font-semibold">Ksh{amount.toFixed(2)}</span></p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-gray-700">
            M-PESA Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="e.g. 0712345678"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: 07XXXXXXXX, 7XXXXXXXX, or 254XXXXXXXXX
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !phoneNumber}
          className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isLoading ? 'Processing...' : 'Pay with M-PESA'}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          By clicking &quot;Pay with M-PESA&quot;, you will receive a prompt on your phone to enter your M-PESA PIN.
        </p>
      </div>
    </div>
  );
} 