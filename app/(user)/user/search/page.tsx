'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaStar, FaBookmark, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  avgRating: number;
  reviewCount: number;
  isSaved?: boolean;
  technician: {
    id: string;
    name: string;
    rating: number;
    reviews: number;
    city: string;
    state: string;
    specialties: string[];
    experience: number;
    profileImage: string | null;
  };
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [savedServiceIds, setSavedServiceIds] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'hvac', name: 'HVAC' },
    { id: 'carpentry', name: 'Carpentry' },
    { id: 'painting', name: 'Painting' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'landscaping', name: 'Landscaping' },
    { id: 'general', name: 'General' }
  ];

  useEffect(() => {
    fetchServices();
    fetchSavedServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching services with params:', {
        q: searchQuery,
        category: selectedCategory,
        location: location
      });

      const params = new URLSearchParams({
        q: searchQuery,
        category: selectedCategory,
        location: location,
      });

      const response = await fetch(`/api/user/search?${params}`);
      console.log('Search response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch services');
      }
      
      const data = await response.json();
      console.log('Fetched services:', data);
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedServices = async () => {
    try {
      const response = await fetch('/api/user/saved-services');
      if (!response.ok) throw new Error('Failed to fetch saved services');
      const savedServices = await response.json();
      setSavedServiceIds(new Set(savedServices.map((service: Service) => service.id)));
    } catch (error) {
      console.error('Error fetching saved services:', error);
    }
  };

  const handleSaveService = async (serviceId: string) => {
    setIsSaving(prev => ({ ...prev, [serviceId]: true }));
    try {
      const isCurrentlySaved = savedServiceIds.has(serviceId);
      const response = await fetch('/api/user/saved-services', {
        method: isCurrentlySaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });

      if (!response.ok) throw new Error('Failed to update saved service');
      
      // Update local state
      setSavedServiceIds(prev => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
          newSet.delete(serviceId);
        } else {
          newSet.add(serviceId);
        }
        return newSet;
      });

      toast.success(isCurrentlySaved ? 'Service removed from saved' : 'Service saved successfully');
    } catch (error) {
      console.error('Error updating saved service:', error);
      toast.error('Failed to update saved service');
    } finally {
      setIsSaving(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleBookService = (serviceId: string) => {
    router.push(`/services/${serviceId}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Find Services</h1>
        <p className="mt-2 text-gray-600">
          Search for local service professionals
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search services"
            />
          </div>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Enter location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              aria-label="Location"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No services found. Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                  </div>
                  <button
                    onClick={() => handleSaveService(service.id)}
                    disabled={isSaving[service.id]}
                    className={`text-gray-400 hover:text-blue-500 ${savedServiceIds.has(service.id) ? 'text-blue-500' : ''}`}
                    aria-label={savedServiceIds.has(service.id) ? "Remove from saved" : "Save service"}
                  >
                    <FaBookmark className={savedServiceIds.has(service.id) ? 'fill-current' : ''} />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">
                      {service.avgRating.toFixed(1)} ({service.reviewCount} reviews)
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    Ksh{service.price}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>
                      {service.technician.city}, {service.technician.state}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Technician:</span>{' '}
                    {service.technician.name}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleBookService(service.id)}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 