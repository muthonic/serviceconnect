'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  isActive: boolean;
}

const initialServices: Service[] = [
  {
    id: '1',
    name: 'Emergency Plumbing Repair',
    description: '24/7 emergency plumbing services for urgent repairs and leaks',
    price: 'Ksh150',
    duration: '1-2 hours',
    category: 'Plumbing',
    isActive: true,
  },
  {
    id: '2',
    name: 'Bathroom Renovation',
    description: 'Complete bathroom remodeling and renovation services',
    price: 'Ksh5000',
    duration: '5-7 days',
    category: 'Renovation',
    isActive: true,
  },
];

const serviceCategories = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Cleaning',
  'Carpentry',
  'Painting',
  'Landscaping',
  'Appliance Repair',
  'Renovation',
  'Other',
];

export default function EditServices() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Partial<Service>>({});

  const validateForm = () => {
    const newErrors: Partial<Service> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Service name is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price?.trim()) {
      newErrors.price = 'Price is required';
    }
    
    if (!formData.duration?.trim()) {
      newErrors.duration = 'Duration is required';
    }
    
    if (!formData.category?.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingService) {
      // Update existing service
      setServices(services.map(service => 
        service.id === editingService.id ? { ...formData as Service, id: service.id } : service
      ));
      setEditingService(null);
    } else {
      // Add new service
      const newService: Service = {
        ...formData as Service,
        id: Date.now().toString(),
      };
      setServices([...services, newService]);
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      isActive: true,
    });
    setIsAddingService(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData(service);
    setIsAddingService(true);
  };

  const handleDelete = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(service => service.id !== serviceId));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof Service]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/technician"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
          <button
            onClick={() => {
              setIsAddingService(true);
              setEditingService(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                duration: '',
                category: '',
                isActive: true,
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            <FaPlus className="mr-2" />
            Add New Service
          </button>
        </div>

        {/* Service Form */}
        {(isAddingService || editingService) && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-6 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Service Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Select a category</option>
                  {serviceCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  id="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-900"
              >
                Active Service
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddingService(false);
                  setEditingService(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    duration: '',
                    category: '',
                    isActive: true,
                  });
                }}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingService ? 'Update Service' : 'Add Service'}
              </button>
            </div>
          </form>
        )}

        {/* Services List */}
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {service.name}
                  </h3>
                  {!service.isActive && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {service.description}
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>{service.category}</span>
                  <span>•</span>
                  <span>{service.price}</span>
                  <span>•</span>
                  <span>{service.duration}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label={`Edit ${service.name}`}
                >
                  <FaEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Delete ${service.name}`}
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 