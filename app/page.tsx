'use client';

import Link from 'next/link';
import { FaSearch, FaUserTie, FaHandshake, FaShieldAlt, FaStar, FaUser, FaTools } from 'react-icons/fa';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Connect with Local Service Professionals
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Find trusted technicians for your home services. Book appointments, manage schedules, and get quality work done.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/services"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
                >
                  Find Services
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link
                  href="#signup-section"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose ServiceConnect?
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FaSearch className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Easy Service Discovery</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Find the right technician for your needs with our advanced search and filtering options.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FaUserTie className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Verified Professionals</h3>
                  <p className="mt-2 text-base text-gray-500">
                    All technicians are verified and background-checked for your peace of mind.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FaHandshake className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Seamless Booking</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Book appointments instantly and manage your schedule with ease.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FaShieldAlt className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Secure Payments</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Safe and secure payment processing with multiple payment options.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up Section */}
      <div id="signup-section" className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Join ServiceConnect Today
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose how you want to use ServiceConnect
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Client Sign Up */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <FaUser className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900 text-center">I'm a Client</h3>
              <p className="mt-2 text-gray-500 text-center">
                Find and book services from trusted professionals
              </p>
              <div className="mt-6">
                <Link
                  href="/auth/register?role=client"
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign up as Client
                </Link>
              </div>
            </div>

            {/* Technician Sign Up */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <FaTools className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900 text-center">I'm a Technician</h3>
              <p className="mt-2 text-gray-500 text-center">
                Offer your services and grow your business
              </p>
              <div className="mt-6">
                <Link
                  href="/auth/register?role=technician"
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign up as Technician
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 