'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaStar, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import RatingModal from '@/components/RatingModal';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  service: {
    name: string;
    description: string;
  };
  technician: {
    name: string;
  };
  review?: {
    rating: number;
    comment: string;
  };
}

export default function BookingHistory() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/user/bookings/history');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load booking history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateBooking = async (rating: number, comment: string) => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      // Update the local state to reflect the new review
      setBookings(bookings.map(booking => 
        booking.id === selectedBooking.id
          ? { ...booking, review: { rating, comment } }
          : booking
      ));

      toast.success('Thank you for your review!');
      setIsRatingModalOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Booking History</h1>

      <div className="space-y-6">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white shadow rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {booking.service.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    with {booking.technician.name}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  booking.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-500">
                <FaCalendarAlt className="mr-2" />
                <span>{new Date(booking.date).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <FaClock className="mr-2" />
                <span>{booking.startTime} - {booking.endTime}</span>
              </div>

              {booking.status === 'COMPLETED' && !booking.review && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setIsRatingModalOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaStar className="mr-2" />
                    Rate Service
                  </button>
                </div>
              )}

              {booking.review && (
                <div className="mt-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < booking.review!.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{booking.review.comment}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No booking history found</p>
          </div>
        )}
      </div>

      {selectedBooking && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedBooking(null);
          }}
          onSubmit={handleRateBooking}
          bookingId={selectedBooking.id}
          serviceName={selectedBooking.service.name}
          technicianName={selectedBooking.technician.name}
        />
      )}
    </div>
  );
} 