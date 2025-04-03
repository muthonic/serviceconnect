'use client';

import { useState, useEffect } from 'react';
import { FaStar, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  technician: {
    name: string;
    rating: number;
    specialties: string[];
  };
}

export default function SavedServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSavedServices();
  }, []);

  const fetchSavedServices = async () => {
    try {
      const response = await fetch('/api/user/saved-services');
      if (!response.ok) throw new Error('Failed to fetch saved services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching saved services:', error);
      toast.error('Failed to load saved services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    setIsRemoving(prev => ({ ...prev, [serviceId]: true }));
    try {
      const response = await fetch('/api/user/saved-services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });

      if (!response.ok) throw new Error('Failed to remove service');
      
      // Update local state
      setServices(prev => prev.filter(service => service.id !== serviceId));
      toast.success('Service removed from saved');
    } catch (error) {
      console.error('Error removing service:', error);
      toast.error('Failed to remove service');
    } finally {
      setIsRemoving(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Saved Services</h1>
        <p className="mt-2 text-gray-600">
          Your favorite services for quick access
        </p>
      </div>

      {/* Services Grid */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {service.technician.name}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveService(service.id)}
                  disabled={isRemoving[service.id]}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                  aria-label="Remove service"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {service.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FaStar className="w-4 h-4 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">
                    {service.technician.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  ${service.price}
                </span>
              </div>

              <div className="mt-6">
                <Link
                  href={`/services/${service.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No saved services yet</p>
          <Link
            href="/user/search"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Browse Services
          </Link>
        </div>
      )}
    </div>
  );
} 