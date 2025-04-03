'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaTools, FaCalendarAlt } from 'react-icons/fa';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface TechnicianData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bio: string;
  specialties: string[];
  experience: number;
  certifications: string[];
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
  profileImage: string;
  rating: number;
  reviews: number;
  services: Service[];
}

export default function TechnicianProfile() {
  const { data: session } = useSession();
  const [technicianData, setTechnicianData] = useState<TechnicianData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTechnicianData = async () => {
      try {
        const response = await fetch('/api/technician/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch technician data');
        }
        const data = await response.json();
        setTechnicianData(data);
      } catch (err) {
        setError('Failed to load technician profile');
        console.error('Error fetching technician data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchTechnicianData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!technicianData) {
    return null;
  }

  // Format availability
  const availableDays = Object.entries(technicianData.availability)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
    .join(', ');

  const availabilityText = availableDays
    ? `Available on ${availableDays} from ${technicianData.workingHours.start} to ${technicianData.workingHours.end}`
    : 'No availability set';

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="relative h-48 bg-blue-600">
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end space-x-4">
              <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                <Image
                  src={technicianData.profileImage || "/placeholder-avatar.jpg"}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {technicianData.name}
                  </h1>
                  {technicianData.certifications.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{technicianData.specialties[0] || 'Professional Technician'}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-gray-600">
                      {technicianData.rating} ({technicianData.reviews} reviews)
                    </span>
                  </div>
                  <span className="text-gray-600">
                    {technicianData.experience} years experience
                  </span>
                </div>
              </div>
              <Link
                href="/technician/profile/edit"
                className="bg-white text-blue-600 px-4 py-2 rounded-md shadow-sm hover:bg-gray-50"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600">{technicianData.bio}</p>
            <div className="mt-4">
              <h3 className="font-medium text-gray-900">Location</h3>
              <p className="text-gray-600">
                {technicianData.city}, {technicianData.state}
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-medium text-gray-900">Availability</h3>
              <p className="text-gray-600">{availabilityText}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-medium text-gray-900">Specialties</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {technicianData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            {technicianData.certifications.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900">Certifications</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {technicianData.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Services Section */}
          {/* <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Services</h2>
              <Link
                href="/technician/services/edit"
                className="text-blue-600 hover:text-blue-800"
              >
                Edit Services
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technicianData.services && technicianData.services.length > 0 ? (
                technicianData.services.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="text-3xl mb-2">{getServiceIcon(service.category)}</div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {service.description}
                    </p>
                    <p className="text-blue-600 font-medium mt-2">
                      From ${service.price}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">No services added yet.</p>
                  <Link
                    href="/technician/services/edit"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                  >
                    Add your first service
                  </Link>
                </div>
              )}
            </div>
          </div> */}
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/technician/bookings"
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                View Bookings
              </Link>
              <Link
                href="/technician/earnings"
                className="block w-full text-center bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
              >
                View Earnings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get appropriate icon based on service category
function getServiceIcon(category: string): string {
  const iconMap: { [key: string]: string } = {
    plumbing: '🚰',
    electrical: '⚡',
    hvac: '❄️',
    carpentry: '🔨',
    painting: '🎨',
    cleaning: '🧹',
    landscaping: '🌿',
    general: '🔧',
  };

  return iconMap[category.toLowerCase()] || '🔧';
} 