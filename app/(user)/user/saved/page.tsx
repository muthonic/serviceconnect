'use client';

import { useState } from 'react';
import { FaStar, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';

interface SavedService {
  id: string;
  name: string;
  technician: string;
  rating: number;
  reviews: number;
  price: string;
  location: string;
  description: string;
  image: string;
  savedDate: string;
}

// Mock data - replace with actual API call
const mockSavedServices: SavedService[] = [
  {
    id: '1',
    name: 'Emergency Plumbing',
    technician: 'Mike Johnson',
    rating: 4.8,
    reviews: 127,
    price: 'From $100',
    location: 'New York, NY',
    description: '24/7 emergency plumbing services for urgent repairs',
    image: '/placeholder-service.jpg',
    savedDate: '2024-03-15',
  },
  {
    id: '2',
    name: 'Bathroom Renovation',
    technician: 'Sarah Wilson',
    rating: 4.9,
    reviews: 89,
    price: 'From $2,500',
    location: 'Brooklyn, NY',
    description: 'Complete bathroom remodeling and plumbing installation',
    image: '/placeholder-service.jpg',
    savedDate: '2024-03-10',
  },
];

export default function SavedServicesPage() {
  const [savedServices, setSavedServices] = useState<SavedService[]>(mockSavedServices);

  const removeSavedService = (serviceId: string) => {
    setSavedServices(services => services.filter(service => service.id !== serviceId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Saved Services</h1>
        <p className="mt-2 text-gray-600">
          Your favorite services are saved here for easy access
        </p>
      </div>

      {/* Saved Services List */}
      <div className="bg-white rounded-lg shadow-sm">
        {savedServices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">You haven't saved any services yet.</p>
            <a
              href="/user/search"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Browse services
            </a>
          </div>
        ) : (
          <div className="divide-y">
            {savedServices.map((service) => (
              <div key={service.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4">
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {service.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {service.description}
                      </p>
                      <div className="mt-2 flex items-center">
                        <FaStar className="w-4 h-4 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {service.rating} ({service.reviews} reviews)
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                        {service.location}
                      </div>
                      <div className="mt-2">
                        <span className="text-lg font-medium text-blue-600">
                          {service.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={() => removeSavedService(service.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove from saved"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Book Now
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Saved on {new Date(service.savedDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 