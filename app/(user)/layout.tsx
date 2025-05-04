'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaSearch, FaBookmark, FaUser, FaCog, FaBars, FaTimes, FaSignOutAlt, FaInfoCircle, FaQuestionCircle, FaCreditCard } from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/user/search', icon: <FaSearch className="w-5 h-5" /> },
  { name: 'Saved Services', href: '/user/saved-services', icon: <FaBookmark className="w-5 h-5" /> },
  { name: 'My Bookings', href: '/user/bookings', icon: <FaBookmark className="w-5 h-5" /> },
  { name: 'Payments', href: '/dashboard/customer/payment', icon: <FaCreditCard className="w-5 h-5" /> },
  { name: 'My Profile', href: '/user/profile', icon: <FaUser className="w-5 h-5" /> },
];

const globalNavigation: NavItem[] = [
  { name: 'About', href: '/about', icon: <FaInfoCircle className="w-5 h-5" /> },
  { name: 'FAQs', href: '/faqs', icon: <FaQuestionCircle className="w-5 h-5" /> },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {isSidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <Link href="/user" className="text-xl font-bold text-blue-600">
              ServiceConnect
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            <div className="mb-4">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main Menu
              </h3>
              <div className="mt-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                General
              </h3>
              <div className="mt-2 space-y-1">
                {globalNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User Profile Summary */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <FaUser className="w-4 h-4 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{session?.user?.name || 'Loading...'}</p>
                <p className="text-xs text-gray-500">{session?.user?.email || 'Loading...'}</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700"
            >
              <FaSignOutAlt className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 