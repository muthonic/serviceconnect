'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaStar, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import ServiceBooking from '../../components/ServiceBooking';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  technician: {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    experience: number;
    specialties: string[];
    bio?: string;
    availability: Record<string, boolean>;
    workingHours: {
      start: string;
      end: string;
    };
  };
  images: { url: string }[];
  rating?: number;
  reviewCount?: number;
}

export default function ServicePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [params.id]);

  const fetchServiceDetails = async () => {
    try {
      const response = await fetch(`/api/services/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch service details');
      const data = await response.json();
      setService(data);
    } catch (err) {
      setError('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    setShowBookingForm(true);
  };

  const formatAvailability = (availability: Record<string, boolean> | null | undefined, workingHours: Service['technician']['workingHours']) => {
    if (!availability) return 'Not available';

    const availableDays = Object.entries(availability)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));

    if (availableDays.length === 0) return 'Not available';

    return `Available on ${availableDays.join(', ')} from ${workingHours.start} to ${workingHours.end}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Service not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Service Images */}
          <div className="relative h-96">
            {service.images.length > 0 ? (
              <img
                src={service.images[0].url}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Service Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                <div className="mt-2 flex items-center text-gray-500">
                  <FaUser className="mr-2" />
                  <span>{service.technician.name}</span>
                </div>
              </div>
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {service.category}
              </span>
            </div>

            {/* Rating */}
            {service.rating && (
              <div className="mt-4 flex items-center">
                <FaStar className="text-yellow-400" />
                <span className="ml-2 text-gray-700">{service.rating}</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-gray-500">{service.reviewCount} reviews</span>
              </div>
            )}

            {/* Service Details */}
            <div className="mt-6 space-y-4">
              <p className="text-gray-600">{service.description}</p>

              <div className="flex items-center text-gray-500">
                <FaClock className="mr-2" />
                <span>Duration: {service.duration} minutes</span>
              </div>

              <div className="text-2xl font-bold text-gray-900">
                Ksh{service.price}
              </div>
            </div>

            {/* Technician Details */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Technician</h2>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <FaUser className="mr-2" />
                  <span>{service.technician.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-2" />
                  <span>{service.technician.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-2" />
                  <span>{service.technician.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>
                    {service.technician.address}, {service.technician.city}, {service.technician.state} {service.technician.zipCode}
                  </span>
                </div>
                {service.technician.bio && (
                  <p className="text-gray-600 mt-2">{service.technician.bio}</p>
                )}
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900">Experience & Specialties</h3>
                  <p className="text-sm text-gray-600">{service.technician.experience} years of experience</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {service.technician.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900">Availability</h3>
                  <p className="text-sm text-gray-600">
                    {formatAvailability(service.technician.availability, service.technician.workingHours)}
                  </p>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <div className="mt-8">
              <button
                onClick={handleBookClick}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && service && (
        <ServiceBooking
          service={{
            ...service,
            technician: {
              id: service.technician.id,
              name: service.technician.name,
            },
          }}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </div>
  );
} 