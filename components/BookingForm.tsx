'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendar, FaClock, FaCreditCard, FaMapMarkerAlt, FaMobileAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import MPESAPaymentForm from './MPESAPaymentForm';
import { toast } from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  basePrice: number;
  duration: number;
  technician: {
    availability: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    workingHours: {
      start: string;
      end: string;
    };
  };
}

interface Availability {
  date: string;
  timeSlots: string[];
}

interface BookingFormProps {
  service: Service;
  onClose: () => void;
}

export default function BookingForm({ service, onClose }: BookingFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'MPESA'>('MPESA'); // Default to M-PESA
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  // New state for the two-step booking process
  const [step, setStep] = useState<'booking' | 'payment'>('booking');
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`/api/services/${service.id}/availability?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      setAvailableSlots(data.timeSlots || []);
    } catch (err) {
      setError('Failed to load available time slots');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          date: selectedDate,
          startTime: selectedTime,
          endTime: calculateEndTime(selectedTime, service.duration),
          address
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const booking = await response.json();
      setCreatedBookingId(booking.id);
      
      toast.success('Booking created successfully!');
      
      // Redirect to payment page with the booking ID
      router.push(`/dashboard/customer/payment?booking_id=${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      toast.error(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };
  
  const processOtherPayment = async (bookingId: string) => {
    try {
      setLoading(true);
      const paymentDetails = {
        phoneNumber: phoneNumber || undefined,
        cardDetails: (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') ? cardDetails : undefined
      };
      
      const response = await fetch(`/api/bookings/${bookingId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: paymentMethod,
          amount: service.basePrice,
          ...paymentDetails
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }
      
      toast.success('Payment processed successfully');
      router.push('/dashboard/customer/bookings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      toast.error(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const isDateAvailable = (date: string): boolean => {
    const selectedDay = new Date(date).getDay();
    const dayMap = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };
    return service.technician.availability[dayMap[selectedDay as keyof typeof dayMap]];
  };

  const goBackToBookingStep = () => {
    setStep('booking');
    setCreatedBookingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'booking' ? `Book ${service.name}` : 'Payment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close booking form"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'booking' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendar className="inline-block mr-2" />
                Select Date
              </label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                aria-label="Select booking date"
              />
              {selectedDate && !isDateAvailable(selectedDate) && (
                <p className="mt-1 text-sm text-red-600">
                  Technician is not available on this day. Please select another date.
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                <FaClock className="inline-block mr-2" />
                Select Time
              </label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!selectedDate || !isDateAvailable(selectedDate)}
                aria-label="Select booking time"
              >
                <option value="">Select a time</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline-block mr-2" />
                Service Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
                placeholder="Enter your complete address"
                aria-label="Enter service address"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                <FaCreditCard className="inline-block mr-2" />
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                aria-label="Select payment method"
              >
                <option value="MPESA">M-PESA</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
              </select>
            </div>

            {/* Card Details */}
            {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="1234 5678 9012 3456"
                    aria-label="Enter card number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      id="cardExpiry"
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="MM/YY"
                      aria-label="Enter card expiry date"
                    />
                  </div>
                  <div>
                    <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      id="cardCvv"
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="123"
                      aria-label="Enter card CVV"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Price Summary</h3>
              <div className="flex justify-between text-sm">
                <span>Service Price:</span>
                <span>Ksh{service.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Duration:</span>
                <span>{service.duration} minutes</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>Ksh{service.basePrice}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* M-PESA Payment Form */}
            {createdBookingId && (
              <MPESAPaymentForm 
                bookingId={createdBookingId} 
                amount={service.basePrice}
                onPaymentInitiated={() => {
                  toast.success('M-PESA payment initiated successfully!');
                }}
              />
            )}
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={goBackToBookingStep}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 