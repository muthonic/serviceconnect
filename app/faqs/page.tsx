'use client';

import { useState } from 'react';

export default function FAQs() {
  const [activeTab, setActiveTab] = useState('client');

  const clientFAQs = [
    {
      question: 'How do I book a service?',
      answer: 'Simply create an account, select the service you need, and browse available technicians in your area. You can then book directly through our platform and pay securely.',
    },
    {
      question: 'How are service providers vetted?',
      answer: 'All service providers undergo a thorough verification process, including background checks, license verification, and skill assessment. We also collect and verify customer reviews.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and digital payment methods. Payments are processed securely through our platform.',
    },
    {
      question: 'What if I need to cancel a booking?',
      answer: 'You can cancel your booking up to 24 hours before the scheduled service. Cancellations within 24 hours may incur a fee depending on the service provider\'s policy.',
    },
    {
      question: 'How do I rate and review a service?',
      answer: 'After the service is completed, you\'ll receive an email with a link to rate and review your experience. Your feedback helps maintain quality standards.',
    },
  ];

  const technicianFAQs = [
    {
      question: 'How do I become a service provider?',
      answer: 'Create an account as a technician, complete your profile with your skills and experience, submit required documentation, and pass our verification process.',
    },
    {
      question: 'What documents do I need to provide?',
      answer: 'Depending on your service type, you may need to provide business licenses, insurance certificates, professional certifications, and identification documents.',
    },
    {
      question: 'How do I get paid?',
      answer: 'Payments are automatically processed through our platform. You can set up your preferred payment method in your account settings.',
    },
    {
      question: 'How do I manage my schedule?',
      answer: 'Our platform provides a dashboard where you can set your availability, manage bookings, and update your schedule in real-time.',
    },
    {
      question: 'What are the platform fees?',
      answer: 'We charge a small commission on completed services. The exact percentage varies by service category and is clearly outlined in our terms of service.',
    },
  ];

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Frequently Asked Questions
        </h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('client')}
              className={`px-6 py-2 ${
                activeTab === 'client'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              For Clients
            </button>
            <button
              onClick={() => setActiveTab('technician')}
              className={`px-6 py-2 ${
                activeTab === 'technician'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              For Technicians
            </button>
          </div>
        </div>

        {/* FAQs List */}
        <div className="max-w-3xl mx-auto">
          {(activeTab === 'client' ? clientFAQs : technicianFAQs).map((faq, index) => (
            <div
              key={index}
              className="mb-6 bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
} 