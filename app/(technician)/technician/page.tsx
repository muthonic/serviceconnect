'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCalendarAlt, FaMoneyBillWave, FaStar, FaClock, FaCheckCircle, FaExclamationCircle, FaSync, FaUser, FaCog, FaList } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalEarnings: number;
  averageRating: number;
  upcomingBookings: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    serviceName: string;
    customerName: string;
    status: string;
  }[];
  recentReviews: {
    id: string;
    rating: number;
    comment: string;
    customerName: string;
    date: string;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching dashboard stats...');
      const response = await fetch('/api/technician/dashboard');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        if (response.status === 401) {
          setError('You are not authorized. Please log in again.');
          router.push('/login');
          return;
        }
        
        if (response.status === 404) {
          setError('Technician profile not found. Please complete your profile setup.');
          return;
        }
        
        throw new Error(errorData.error || 'Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      console.log('Dashboard data:', data);
      
      if (!data) {
        throw new Error('No data received from API');
      }
      
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard statistics');
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
  return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <FaExclamationCircle className="text-red-500 text-5xl mb-4" />
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FaSync className="mr-2" /> Try Again
            </button>
                  </div>
                </div>
              </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-center">No data available. Start by adding services and accepting bookings.</p>
          <div className="mt-4 flex justify-center space-x-4">
            <Link href="/technician/services" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Add Services
            </Link>
            <Link href="/technician/profile" className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50">
              Complete Profile
              </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex space-x-2">
          <button 
            onClick={fetchDashboardStats}
            className="bg-white text-blue-600 border border-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 flex items-center"
            title="Refresh dashboard data"
          >
            <FaSync className="mr-1" /> Refresh
          </button>
          <Link 
            href="/technician/profile" 
            className="bg-white text-blue-600 border border-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 flex items-center"
            title="View profile"
          >
            <FaUser className="mr-1" /> Profile
          </Link>
          <Link 
            href="/technician/services" 
            className="bg-white text-blue-600 border border-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 flex items-center"
            title="Manage services"
          >
            <FaCog className="mr-1" /> Services
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/technician/bookings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaCalendarAlt className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Total Bookings
              </h2>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalBookings}
              </p>
            </div>
          </div>
              </Link>

        <Link href="/technician/earnings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FaMoneyBillWave className="text-2xl text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Total Earnings
              </h2>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.totalEarnings)}
                  </p>
                </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaStar className="text-2xl text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Average Rating
              </h2>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <Link href="/technician/bookings?status=pending" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaClock className="text-2xl text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Pending Bookings
            </h2>
              <p className="text-3xl font-bold text-purple-600">
                {stats.pendingBookings}
              </p>
            </div>
          </div>
        </Link>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Upcoming Bookings
            </h2>
            <Link href="/technician/bookings" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
              <FaList className="mr-1" /> View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingBookings.length > 0 ? (
              stats.upcomingBookings.map((booking) => (
              <Link
                  href={`/technician/bookings`} 
                  key={booking.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors block"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {booking.serviceName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {booking.customerName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCalendarAlt className="mr-2" />
                    <span>{formatDate(booking.date)}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </span>
                  </div>
              </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No upcoming bookings
              </p>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Reviews
          </h2>
          <div className="space-y-4">
            {stats.recentReviews.length > 0 ? (
              stats.recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {review.customerName}
                      </h3>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`${
                              i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.date)}
                    </span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
            </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent reviews
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
