'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaFilter, FaMoneyBillWave, FaCalendarAlt, FaUser, FaCreditCard, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Earnings {
  totalEarnings: number;
  totalBookings: number;
  averageEarningPerBooking: number;
  totalPendingPayments: number;
  totalCompletedPayments: number;
  bookings: {
    id: string;
    date: string;
    serviceName: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    customerName: string;
    customerEmail: string;
  }[];
  monthlyBreakdown: {
    month: string;
    earnings: number;
    bookings: number;
  }[];
}

export default function EarningsPage() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentStatus: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, [filters]);

  const fetchEarnings = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.paymentStatus !== 'all') queryParams.append('paymentStatus', filters.paymentStatus);

      const response = await fetch(`/api/technician/earnings?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch earnings');
      const data = await response.json();
      setEarnings(data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Earnings</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
          aria-label="Toggle filters"
        >
          <FaFilter /> Filter
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="payment-status" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                id="payment-status"
                value={filters.paymentStatus}
                onChange={(e) =>
                  setFilters({ ...filters, paymentStatus: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {earnings && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <FaMoneyBillWave className="text-2xl text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Total Earnings
                  </h2>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(earnings.totalEarnings)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaCalendarAlt className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Total Bookings
                  </h2>
                  <p className="text-3xl font-bold text-blue-600">
                    {earnings.totalBookings}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <FaChartLine className="text-2xl text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Average per Booking
                  </h2>
                  <p className="text-3xl font-bold text-yellow-600">
                    {formatCurrency(earnings.averageEarningPerBooking)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaCreditCard className="text-2xl text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Pending Payments
                  </h2>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(earnings.totalPendingPayments)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {earnings.monthlyBreakdown.map((month, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{month.month}</h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatCurrency(month.earnings)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {month.bookings} bookings
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Booking Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service & Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {earnings.bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.serviceName}
                        </div>
                        <div className="text-sm text-gray-500">
                          <FaUser className="inline mr-1" />
                          {booking.customerName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {booking.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(booking.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <FaCreditCard className="inline mr-1" />
                          {booking.paymentMethod}
                        </div>
                        <div className={`text-xs font-medium ${
                          booking.paymentStatus === 'COMPLETED' 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }`}>
                          {booking.paymentStatus}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 