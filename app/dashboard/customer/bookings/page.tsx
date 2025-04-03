'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Booking, BookingStatus } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaStar, FaCalendar, FaClock, FaDollarSign } from 'react-icons/fa';

interface BookingWithDetails extends Booking {
  service: {
    name: string;
    description: string;
  };
  technician: {
    name: string;
    phone: string;
    email: string;
    experience: number;
    specialties: string[];
  };
  review?: {
    rating: number;
    comment: string;
  };
}

export default function CustomerBookings() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          rating,
          comment,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      toast.success('Review submitted successfully');
      setReviewModalOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Waiting for technician confirmation';
      case 'CONFIRMED':
        return 'Booking confirmed! Prepare for the service';
      case 'COMPLETED':
        return 'Service completed successfully';
      case 'CANCELLED':
        return 'Booking was cancelled';
      default:
        return '';
    }
  };

  const filteredBookings = statusFilter === 'ALL' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'ALL')}
            className="px-3 py-2 border rounded-md"
            aria-label="Filter bookings by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="grid gap-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{booking.service.name}</h2>
                <p className="text-gray-600">{booking.service.description}</p>
                
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900">Technician Details</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-600">{booking.technician.name}</p>
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="mr-2" />
                      <a href={`tel:${booking.technician.phone}`} className="hover:text-blue-600">
                        {booking.technician.phone}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="mr-2" />
                      <a href={`mailto:${booking.technician.email}`} className="hover:text-blue-600">
                        {booking.technician.email}
                      </a>
                    </div>
                    <p className="text-sm text-gray-600">
                      {booking.technician.experience} years of experience
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {booking.technician.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center text-gray-600">
                    <FaCalendar className="mr-2" />
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaClock className="mr-2" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaDollarSign className="mr-2" />
                    <span>{booking.amount}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{getStatusMessage(booking.status)}</p>
                </div>
                {booking.status === 'COMPLETED' && !booking.review && (
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setReviewModalOpen(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Leave Review
                  </button>
                )}
                {booking.status === 'CONFIRMED' && (
                  <div className="text-sm text-green-600">
                    Please be ready at the scheduled time
                  </div>
                )}
                {booking.status === 'CANCELLED' && (
                  <button
                    onClick={() => {
                      // Add rebooking functionality here
                      toast.info('Re-booking feature coming soon');
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Book Again
                  </button>
                )}
              </div>
            </div>
            {booking.review && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < booking.review!.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{booking.review.comment}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating</label>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className="focus:outline-none"
                    title={`${i + 1} star${i === 0 ? '' : 's'}`}
                  >
                    <FaStar
                      className={`w-8 h-8 ${
                        i < rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Share your experience..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 