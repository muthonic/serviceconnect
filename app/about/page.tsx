export default function About() {
  const values = [
    {
      title: 'Trust & Safety',
      description: 'We thoroughly vet all service providers to ensure quality and reliability.',
      icon: '🛡️',
    },
    {
      title: 'Convenience',
      description: 'Book services instantly and manage everything from your dashboard.',
      icon: '⚡',
    },
    {
      title: 'Quality Service',
      description: 'We connect you with experienced professionals who deliver excellence.',
      icon: '⭐',
    },
    {
      title: 'Transparency',
      description: 'Clear pricing and honest reviews from real customers.',
      icon: '🔍',
    },
  ];

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About ServiceConnect</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing how people connect with service professionals. Our platform
            makes it easy to find, book, and pay for local services while helping skilled
            technicians grow their businesses.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700">
            ServiceConnect aims to bridge the gap between service providers and clients by
            creating a trusted platform that facilitates seamless connections. We believe
            in empowering local businesses while providing convenience and reliability to
            our customers.
          </p>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Team</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're a dedicated team of professionals committed to making service connections
            simple and efficient. Our diverse backgrounds in technology, customer service,
            and local business help us understand and meet the needs of both service
            providers and clients.
          </p>
        </div>
      </div>
    </main>
  );
} 