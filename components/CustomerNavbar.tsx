'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { FaSignOutAlt, FaInfoCircle, FaQuestionCircle, FaCreditCard } from 'react-icons/fa';

const CustomerNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const routes = [
    { name: 'Dashboard', path: '/dashboard/customer' },
    { name: 'My Bookings', path: '/dashboard/customer/bookings' },
    { name: 'Payments', path: '/dashboard/customer/payment' },
    { name: 'Profile', path: '/dashboard/customer/profile' },
  ];

  const globalRoutes = [
    { name: 'About', path: '/about', icon: <FaInfoCircle className="w-4 h-4" /> },
    { name: 'FAQs', path: '/faqs', icon: <FaQuestionCircle className="w-4 h-4" /> },
  ];

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard/customer" className="text-xl font-bold text-blue-600">
                ServiceConnect
              </Link>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-1">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === route.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {route.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center ml-4 space-x-1">
              {globalRoutes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 flex items-center ${
                    pathname === route.path ? 'text-blue-600 bg-blue-50' : ''
                  }`}
                >
                  <span className="mr-1">{route.icon}</span>
                  {route.name}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center"
              >
                <FaSignOutAlt className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === route.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 my-2"></div>
            {globalRoutes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 flex items-center ${
                  pathname === route.path ? 'text-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">{route.icon}</span>
                {route.name}
              </Link>
            ))}
            <button
              onClick={() => {
                handleSignOut();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default CustomerNavbar; 