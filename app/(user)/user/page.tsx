'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaHistory, FaStar, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface DashboardData {
  upcomingBookings: number;
  completedBookings: number;
  savedServices: number;
  profileCompletion: number;
  recentBookings: {
    id: string;
    serviceName: string;
    technicianName: string;
    date: string;
    status: string;
  }[];
}

export default function UserDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/customer/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your account
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Bookings Card */}
        <Link href="/user/bookings" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Upcoming Bookings</h3>
                <p className="mt-1 text-3xl font-bold text-blue-600">{data.upcomingBookings}</p>
                <p className="mt-1 text-sm text-gray-500">View and manage your upcoming appointments</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FaCalendarAlt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Link>

        {/* Booking History Card */}
        <Link href="/user/bookings/history" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Booking History</h3>
                <p className="mt-1 text-3xl font-bold text-green-600">{data.completedBookings}</p>
                <p className="mt-1 text-sm text-gray-500">View your past service bookings</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <FaHistory className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </Link>

        {/* Saved Services Card */}
        <Link href="/user/saved-services" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Saved Services</h3>
                <p className="mt-1 text-3xl font-bold text-purple-600">{data.savedServices}</p>
                <p className="mt-1 text-sm text-gray-500">View your favorite services</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <FaStar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Link>

        {/* Profile Card */}
        <Link href="/user/profile" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Profile Completion</h3>
                <p className="mt-1 text-3xl font-bold text-orange-600">{data.profileCompletion}%</p>
                <p className="mt-1 text-sm text-gray-500">Complete your profile for better service</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <FaUser className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Bookings */}
      {data.recentBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="space-y-4">
            {data.recentBookings.map((booking) => (
              <div key={booking.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{booking.serviceName}</h3>
                    <p className="text-sm text-gray-500">Technician: {booking.technicianName}</p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(booking.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    booking.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 