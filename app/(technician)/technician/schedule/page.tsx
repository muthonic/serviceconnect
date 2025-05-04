'use client';

import { useState } from 'react';
import { FaCalendar, FaClock, FaUser, FaPhone, FaMapMarkerAlt, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

interface Appointment {
  id: string;
  serviceName: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: string;
  notes?: string;
}

interface Availability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Mock data - replace with actual data from your backend
const mockAppointments: Appointment[] = [
  {
    id: '1',
    serviceName: 'Emergency Plumbing Repair',
    clientName: 'John Smith',
    clientPhone: '(555) 123-4567',
    date: '2024-03-20',
    time: '14:00',
    location: '123 Main St, City, State',
    status: 'confirmed',
    price: 'Ksh150',
    notes: 'Leaking faucet in kitchen',
  },
  {
    id: '2',
    serviceName: 'Bathroom Renovation',
    clientName: 'Sarah Johnson',
    clientPhone: '(555) 987-6543',
    date: '2024-03-22',
    time: '09:00',
    location: '456 Oak Ave, City, State',
    status: 'pending',
    price: 'Ksh5000',
    notes: 'Complete bathroom remodel',
  },
];

const mockAvailability: Availability[] = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Saturday', startTime: '10:00', endTime: '15:00', isAvailable: true },
  { day: 'Sunday', startTime: '', endTime: '', isAvailable: false },
];

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<Availability[]>(mockAvailability);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);

  const handleAvailabilityChange = (day: string, field: keyof Availability, value: string | boolean) => {
    setAvailability(prev => prev.map(item => 
      item.day === day ? { ...item, [field]: value } : item
    ));
  };

  const handleSaveAvailability = () => {
    // TODO: Implement API call to save availability
    setIsEditingAvailability(false);
    console.log('Saving availability:', availability);
  };

  const filteredAppointments = mockAppointments.filter(
    appointment => appointment.date === selectedDate
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <p className="mt-2 text-gray-600">
          Manage your availability and view upcoming appointments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                aria-label="Select date"
              />
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.serviceName}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <FaClock className="mr-2" />
                        {appointment.time}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-3" />
                      <span>{appointment.clientName}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="mr-3" />
                      <span>{appointment.clientPhone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-3" />
                      <span>{appointment.location}</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-3 text-gray-600">
                      <p className="font-medium">Notes:</p>
                      <p>{appointment.notes}</p>
                    </div>
                  )}
                </div>
              ))}

              {filteredAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No appointments scheduled for this date
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Availability</h2>
              {!isEditingAvailability ? (
                <button
                  onClick={() => setIsEditingAvailability(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditingAvailability(false)}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAvailability}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {availability.map((day) => (
                <div key={day.day} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{day.day}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.isAvailable}
                        onChange={(e) => handleAvailabilityChange(day.day, 'isAvailable', e.target.checked)}
                        className="sr-only peer"
                        disabled={!isEditingAvailability}
                        aria-label={`Toggle availability for ${day.day}`}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {day.isAvailable && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleAvailabilityChange(day.day, 'startTime', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={!isEditingAvailability}
                        aria-label={`${day.day} start time`}
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleAvailabilityChange(day.day, 'endTime', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={!isEditingAvailability}
                        aria-label={`${day.day} end time`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 