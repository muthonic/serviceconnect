'use client';

import { useState } from 'react';
import { FaSearch, FaStar, FaMapMarkerAlt, FaClock, FaUser } from 'react-icons/fa';
import Link from 'next/link';

// Mock data - replace with actual API data
const mockServices = [
  {
    id: '1',
    name: 'Emergency Plumbing Repair',
    category: 'Plumbing',
    description: 'Professional plumbing services for emergencies and regular maintenance',
    technician: 'Mike Johnson',
    rating: 4.8,
    totalReviews: 156,
    price: '150-300',
    location: 'Downtown',
    availability: '24/7',
    specialties: ['Emergency Repairs', 'Leak Detection', 'Pipe Installation'],
  },
  {
    id: '2',
    name: 'Bathroom Renovation',
    category: 'Home Improvement',
    description: 'Complete bathroom renovation and remodeling services',
    technician: 'Sarah Wilson',
    rating: 4.9,
    totalReviews: 89,
    price: '2000-5000',
    location: 'Westside',
    availability: 'Weekdays',
    specialties: ['Tile Installation', 'Plumbing', 'Electrical'],
  },
  {
    id: '3',
    name: 'Electrical Repair',
    category: 'Electrical',
    description: 'Licensed electrician for all your electrical needs',
    technician: 'John Smith',
    rating: 4.7,
    totalReviews: 203,
    price: '100-500',
    location: 'Eastside',
    availability: '24/7',
    specialties: ['Circuit Repair', 'Lighting Installation', 'Safety Inspections'],
  },
];

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Plumbing', 'Electrical', 'Home Improvement', 'HVAC', 'Carpentry'];

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Services</h1>
          <p className="mt-2 text-gray-600">
            Browse our selection of professional services
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">by {service.technician}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {service.category}
                  </span>
                </div>

                <div className="mt-4 flex items-center">
                  <div className="flex items-center">
                    <FaStar className="w-4 h-4 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium text-gray-900">{service.rating}</span>
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{service.totalReviews} reviews</span>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Specialties</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {service.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                  <span>{service.location}</span>
                </div>

                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <FaClock className="w-4 h-4 mr-1" />
                  <span>{service.availability}</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">Price range: </span>
                    <span className="font-medium text-gray-900">Ksh{service.price}</span>
                  </div>
                  <Link
                    href="/login"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Sign in to book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No services found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
} 