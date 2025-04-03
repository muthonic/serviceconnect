'use client';

import { useState, useEffect } from 'react';
import { FaBell, FaEnvelope, FaLock, FaLanguage, FaMoon, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface PrivacySettings {
  showProfile: boolean;
  showBookings: boolean;
  showReviews: boolean;
}

interface UserSettings {
  email: string;
  notificationPreferences: NotificationPreferences;
  privacySettings: PrivacySettings;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (type: keyof NotificationPreferences) => {
    if (!settings) return;
    setSettings(prev => ({
      ...prev!,
      notificationPreferences: {
        ...prev!.notificationPreferences,
        [type]: !prev!.notificationPreferences[type]
      }
    }));
  };

  const handlePrivacyChange = (type: keyof PrivacySettings) => {
    if (!settings) return;
    setSettings(prev => ({
      ...prev!,
      privacySettings: {
        ...prev!.privacySettings,
        [type]: !prev!.privacySettings[type]
      }
    }));
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationPreferences: settings.notificationPreferences,
          privacySettings: settings.privacySettings
        }),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account preferences and settings
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FaSave className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Email */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900">Email Address</h2>
        <p className="mt-1 text-sm text-gray-500">{settings.email}</p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <FaBell className="w-5 h-5 text-gray-400" />
          <h2 className="ml-2 text-lg font-medium text-gray-900">
            Notification Preferences
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            <button
              onClick={() => handleNotificationChange('email')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.notificationPreferences.email ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked="false"
              title={settings.notificationPreferences.email ? 'Disable email notifications' : 'Enable email notifications'}
              aria-label={settings.notificationPreferences.email ? 'Email notifications enabled' : 'Email notifications disabled'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.notificationPreferences.email ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-500">
                Receive notifications via text message
              </p>
            </div>
            <button
              onClick={() => handleNotificationChange('sms')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.notificationPreferences.sms ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked="false"
              title={settings.notificationPreferences.sms ? 'Disable SMS notifications' : 'Enable SMS notifications'}
              aria-label={settings.notificationPreferences.sms ? 'SMS notifications enabled' : 'SMS notifications disabled'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.notificationPreferences.sms ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-500">
                Receive notifications in the app
              </p>
            </div>
            <button
              onClick={() => handleNotificationChange('push')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.notificationPreferences.push ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked="false"
              title={settings.notificationPreferences.push ? 'Disable push notifications' : 'Enable push notifications'}
              aria-label={settings.notificationPreferences.push ? 'Push notifications enabled' : 'Push notifications disabled'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.notificationPreferences.push ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <FaLock className="w-5 h-5 text-gray-400" />
          <h2 className="ml-2 text-lg font-medium text-gray-900">
            Privacy Settings
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Show Profile</h3>
              <p className="text-sm text-gray-500">
                Allow others to view your profile
              </p>
            </div>
            <button
              onClick={() => handlePrivacyChange('showProfile')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.privacySettings.showProfile ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked="false"
              title={settings.privacySettings.showProfile ? 'Hide profile from others' : 'Show profile to others'}
              aria-label={settings.privacySettings.showProfile ? 'Profile visibility enabled' : 'Profile visibility disabled'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.privacySettings.showProfile ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Show Bookings</h3>
              <p className="text-sm text-gray-500">
                Allow others to view your booking history
              </p>
            </div>
            <button
              onClick={() => handlePrivacyChange('showBookings')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.privacySettings.showBookings ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked="false"
              title={settings.privacySettings.showBookings ? 'Hide booking history from others' : 'Show booking history to others'}
              aria-label={settings.privacySettings.showBookings ? 'Booking history visibility enabled' : 'Booking history visibility disabled'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.privacySettings.showBookings ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Show Reviews</h3>
              <p className="text-sm text-gray-500">
                Allow others to view your reviews
              </p>
            </div>
            <button
              onClick={() => handlePrivacyChange('showReviews')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.privacySettings.showReviews ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked="false"
              title={settings.privacySettings.showReviews ? 'Hide reviews from others' : 'Show reviews to others'}
              aria-label={settings.privacySettings.showReviews ? 'Reviews visibility enabled' : 'Reviews visibility disabled'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.privacySettings.showReviews ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 