'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Service } from '@prisma/client';

interface ServiceBookingProps {
  service: Service & {
    technician: {
      id: string;
      name: string;
    };
  };
  onClose: () => void;
}

export default function ServiceBooking({ service, onClose }: ServiceBookingProps) {
  const { data: session } = useSession();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error('Please sign in to book a service');
      return;
    }

    if (!date || !startTime || !endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          date,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      toast.success('Booking created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Book {service.name}</h2>
        <p className="text-gray-600 mb-4">
          Technician: {service.technician.name}
        </p>
        <p className="text-gray-600 mb-4">Price: ${service.price}</p>
        <p className="text-gray-600 mb-4">Duration: {service.duration} minutes</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="booking-date" className="block text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded"
              min={new Date().toISOString().split('T')[0]}
              required
              aria-label="Booking date"
              id="booking-date"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="start-time" className="block text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border rounded"
              required
              aria-label="Start time"
              id="start-time"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="end-time" className="block text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border rounded"
              required
              aria-label="End time"
              id="end-time"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              aria-label="Cancel booking"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              aria-label="Confirm booking"
            >
              {loading ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 