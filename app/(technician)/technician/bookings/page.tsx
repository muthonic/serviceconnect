'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Booking, BookingStatus } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendar, FaClock } from 'react-icons/fa';

interface BookingWithDetails extends Booking {
  service: {
    name: string;
    description: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    image: string | null;
  };
  technician: {
    name: string;
    phone: string;
    email: string;
    experience: number;
    specialties: string[];
  };
}

export default function TechnicianBookings() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Only fetch bookings when session is loaded
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings for technician...');
      const response = await fetch('/api/bookings?role=technician');
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }
      const data = await response.json();
      console.log('Fetched bookings:', data);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update booking status');

      toast.success('Booking status updated successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
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

  // Handle loading state
  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If no bookings found
  if (bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Bookings</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-lg text-gray-600">You don't have any bookings yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Bookings</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service & Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{booking.service.name}</div>
                  <div className="text-sm text-gray-500">{booking.customer.name}</div>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetails(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <FaCalendar className="mr-2" />
                    {new Date(booking.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="mr-2" />
                    {booking.startTime} - {booking.endTime}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <span className="mr-1">Ksh</span>
                    {booking.amount}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium space-y-1">
                  {booking.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                        className="text-green-600 hover:text-green-900 block"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                        className="text-red-600 hover:text-red-900 block"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                      className="text-blue-600 hover:text-blue-900 block"
                    >
                      Mark as Completed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Service Information</h3>
                <p className="text-gray-900 font-medium">{selectedBooking.service.name}</p>
                <p className="text-gray-600">{selectedBooking.service.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                <div className="space-y-2">
                  <p className="text-gray-900">{selectedBooking.customer.name}</p>
                  <div className="flex items-center text-gray-600">
                    <FaPhone className="mr-2" />
                    <a href={`tel:${selectedBooking.customer.phone}`} className="hover:text-blue-600">
                      {selectedBooking.customer.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaEnvelope className="mr-2" />
                    <a href={`mailto:${selectedBooking.customer.email}`} className="hover:text-blue-600">
                      {selectedBooking.customer.email}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Booking Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaCalendar className="mr-2" />
                    <span>{new Date(selectedBooking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaClock className="mr-2" />
                    <span>{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">Ksh</span>
                    <span>{selectedBooking.amount}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{selectedBooking.address || 'No address provided'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedBooking.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'CONFIRMED');
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Accept Booking
                    </button>
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'CANCELLED');
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Reject Booking
                    </button>
                  </>
                )}
                {selectedBooking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'COMPLETED');
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 