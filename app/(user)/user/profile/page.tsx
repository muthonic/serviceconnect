'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaStar, FaBriefcase, FaCertificate } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import RatingModal from '@/components/RatingModal';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
  joinDate: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  bookings: {
    id: string;
    date: string;
    status: string;
    service: {
      name: string;
      description: string;
    };
    technician: {
      id: string;
      name: string;
    };
    review?: {
      rating: number;
    };
  }[];
  // Technician-specific fields (optional)
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  specialties?: string[];
  experience?: number;
  certifications?: string[];
  availability?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  workingHours?: {
    start: string;
    end: string;
  };
  bio?: string;
  profileImage?: string;
}

interface Booking {
  id: string;
  date: string;
  status: string;
  service: {
    id: string;
    name: string;
    description: string;
  };
  technician: {
    id: string;
    name: string;
  };
  review?: {
    rating: number;
  };
}

interface ServiceHistory {
  id: string;
  service: {
    name: string;
    description: string;
  };
  technician: {
    id: string;
    name: string;
  };
  date: string;
  status: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceHistory | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setFormData(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;
    const array = value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const handleRateService = async (rating: number) => {
    if (!selectedService) return;

    try {
      const response = await fetch(`/api/bookings/${selectedService.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      // Refresh the page to show the new rating
      window.location.reload();

      toast.success('Thank you for your rating!');
      setIsRatingModalOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <FaSave className="mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your name"
                    aria-label="Name"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{profile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                    aria-label="Phone number"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-gray-900">
                  {new Date(profile.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Technician-specific fields */}
            {profile.role === 'TECHNICIAN' && (
              <>
                <div className="border-t pt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter your address"
                          aria-label="Address"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.address || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="city"
                          value={formData.city || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter your city"
                          aria-label="City"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.city || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="state"
                          value={formData.state || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter your state"
                          aria-label="State"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.state || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter your ZIP code"
                          aria-label="ZIP code"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.zipCode || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience || 0}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter years of experience"
                          aria-label="Years of experience"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.experience || 0} years</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={formData.bio || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter your bio"
                          aria-label="Bio"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.bio || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Specialties & Certifications</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specialties</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="specialties"
                          value={formData.specialties?.join(', ') || ''}
                          onChange={(e) => handleArrayInputChange(e, 'specialties')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter specialties separated by commas"
                          aria-label="Specialties"
                        />
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {profile.specialties?.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Certifications</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="certifications"
                          value={formData.certifications?.join(', ') || ''}
                          onChange={(e) => handleArrayInputChange(e, 'certifications')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter certifications separated by commas"
                          aria-label="Certifications"
                        />
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {profile.certifications?.map((cert, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Booking Statistics */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Booking Statistics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{profile.totalBookings}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="mt-1 text-2xl font-semibold text-green-600">{profile.completedBookings}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cancelled</p>
                  <p className="mt-1 text-2xl font-semibold text-red-600">{profile.cancelledBookings}</p>
                </div>
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Service History</h2>
              <div className="space-y-6">
                {profile?.bookings && profile.bookings.length > 0 ? (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {profile.bookings.map((booking) => (
                      <div key={booking.id} className="relative pl-12 pb-6 last:pb-0">
                        {/* Timeline dot */}
                        <div className={`absolute left-3 w-2 h-2 rounded-full ${
                          booking.status === 'COMPLETED' 
                            ? 'bg-green-500' 
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}></div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{booking.service.name}</h3>
                              <p className="text-sm text-gray-500">Technician: {booking.technician.name}</p>
                              <p className="text-sm text-gray-500">
                                Date: {new Date(booking.date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              booking.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {booking.service.description}
                          </p>

                          {booking.status === 'COMPLETED' && !booking.review && (
                            <div className="mt-4">
                              <button
                                onClick={() => {
                                  setSelectedService({
                                    id: booking.id,
                                    service: booking.service,
                                    technician: {
                                      id: booking.technician.id || '',
                                      name: booking.technician.name
                                    },
                                    date: booking.date,
                                    status: booking.status
                                  });
                                  setIsRatingModalOpen(true);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <FaStar className="mr-2" />
                                Rate Service
                              </button>
                            </div>
                          )}

                          {booking.review && (
                            <div className="mt-4">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < booking.review!.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No service history found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {selectedService && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedService(null);
          }}
          onSubmit={handleRateService}
          serviceName={selectedService.service.name}
          technicianName={selectedService.technician.name}
        />
      )}
    </div>
  );
} 