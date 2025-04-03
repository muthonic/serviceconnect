'use client';

import Link from 'next/link';
import { FaHome, FaSearch, FaUser } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
          <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="text-9xl font-bold text-blue-600">404</div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for seems to have vanished into thin air. 
          Don't worry, we'll help you find your way back!
        </p>

        {/* Navigation Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Link 
            href="/"
            className="group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <FaHome className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-lg font-medium text-gray-900">Home</span>
            <span className="text-sm text-gray-500">Back to homepage</span>
          </Link>

          <Link 
            href="/user/search"
            className="group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <FaSearch className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-lg font-medium text-gray-900">Search</span>
            <span className="text-sm text-gray-500">Find services</span>
          </Link>

          <Link 
            href="/login"
            className="group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <FaUser className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-lg font-medium text-gray-900">Login</span>
            <span className="text-sm text-gray-500">Sign in to your account</span>
          </Link>
        </div>

        {/* Fun Message */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 italic">
            "Sometimes the best way to find something is to start over."
          </p>
        </div>
      </div>
    </div>
  );
} 