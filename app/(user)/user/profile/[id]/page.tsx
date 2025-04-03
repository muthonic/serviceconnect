'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';

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
  isCurrentUser: boolean;
  // Technician-specific fields (optional)
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  specialties?: string[];
  rating?: number;
  reviews?: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/profile/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch profile');
      }
      
      const data = await response.json();
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      setProfile(data);
      setEditedProfile(data);
      setIsCurrentUser(data.isCurrentUser);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data. Please try again later.');
      router.push('/'); // Redirect to home page on error
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/user/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedProfile.name,
          phone: editedProfile.phone,
          // Only include technician fields if the user is a technician
          ...(profile?.role === 'TECHNICIAN' && {
            address: editedProfile.address,
            city: editedProfile.city,
            state: editedProfile.state,
            zipCode: editedProfile.zipCode,
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.user);
      setEditedProfile(data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again later.');
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isCurrentUser ? 'My Profile' : `${profile.name}'s Profile`}
          </h1>
          <p className="mt-2 text-gray-600">
            {profile.role === 'TECHNICIAN' ? 'Service Provider Profile' : 'Customer Profile'}
          </p>
        </div>
        {isCurrentUser && !isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FaEdit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        )}
        {isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <FaTimes className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaSave className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
              <FaUser className="w-full h-full p-6 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your name"
                    aria-label="Name"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile.name || 'Not provided'}</p>
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
                    value={editedProfile.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                    aria-label="Phone number"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile.phone || 'Not provided'}</p>
                )}
              </div>

              {/* Only show address fields for technicians */}
              {profile.role === 'TECHNICIAN' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your address"
                        aria-label="Address"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile.address || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.city || ''}
                          onChange={(e) => handleChange('city', e.target.value)}
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
                          value={editedProfile.state || ''}
                          onChange={(e) => handleChange('state', e.target.value)}
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
                          value={editedProfile.zipCode || ''}
                          onChange={(e) => handleChange('zipCode', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter your ZIP code"
                          aria-label="ZIP Code"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.zipCode || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Role-specific Information */}
            {profile.role === 'TECHNICIAN' && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-gray-500">Specialties</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {profile.specialties?.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p className="mt-1 text-2xl font-semibold text-yellow-600">
                    {profile.rating?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reviews</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {profile.reviews || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Booking Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
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
        </div>
      </div>
    </div>
  );
} 