import { PrismaClient, UserRole, ServiceCategory, PaymentMethod, PaymentStatus, BookingStatus } from '@prisma/client';
import { hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  // Create technician user
  const technicianPassword = await hashPassword('tech123');
  const technician = await prisma.user.upsert({
    where: { email: 'tech@example.com' },
    update: {},
    create: {
      email: 'tech@example.com',
      password: technicianPassword,
      name: 'John Technician',
      role: UserRole.TECHNICIAN,
      phone: '1234567890',
      address: '123 Tech St, City',
    },
  });

  // Create customer user
  const customerPassword = await hashPassword('customer123');
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'Jane Customer',
      role: UserRole.CUSTOMER,
      phone: '0987654321',
      address: '456 Customer Ave, City',
    },
  });

  // Create some services
  const plumbingService = await prisma.service.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Emergency Plumbing Repair',
      description: '24/7 emergency plumbing services for urgent repairs and leaks. Licensed and insured plumber with over 15 years of experience.',
      category: ServiceCategory.PLUMBING,
      basePrice: 150,
      duration: 120, // 2 hours
      location: 'City Center',
      technicianId: technician.id,
      images: {
        create: [
          {
            url: 'https://example.com/plumbing1.jpg',
          },
          {
            url: 'https://example.com/plumbing2.jpg',
          },
        ],
      },
      availability: {
        create: [
          {
            dayOfWeek: 0, // Sunday
            startTime: '09:00',
            endTime: '17:00',
          },
          {
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '17:00',
          },
          // Add more availability slots as needed
        ],
      },
      serviceAreas: {
        create: [
          {
            city: 'New York',
            state: 'NY',
            country: 'USA',
          },
          {
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
          },
        ],
      },
    },
  });

  const renovationService = await prisma.service.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      name: 'Bathroom Renovation',
      description: 'Complete bathroom remodeling and renovation services. From design to completion, we handle every aspect of your bathroom renovation.',
      category: ServiceCategory.RENOVATION,
      basePrice: 2500,
      duration: 480, // 8 hours
      location: 'City Center',
      technicianId: technician.id,
      images: {
        create: [
          {
            url: 'https://example.com/renovation1.jpg',
          },
          {
            url: 'https://example.com/renovation2.jpg',
          },
        ],
      },
      availability: {
        create: [
          {
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '17:00',
          },
          {
            dayOfWeek: 2, // Tuesday
            startTime: '09:00',
            endTime: '17:00',
          },
          // Add more availability slots as needed
        ],
      },
      serviceAreas: {
        create: [
          {
            city: 'New York',
            state: 'NY',
            country: 'USA',
          },
        ],
      },
    },
  });

  // Create a sample booking
  const booking = await prisma.booking.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      serviceId: plumbingService.id,
      customerId: customer.id,
      status: BookingStatus.COMPLETED,
      date: new Date('2024-03-15'),
      startTime: '10:00',
      endTime: '12:00',
      price: 150,
      address: '789 Service St, City',
      payment: {
        create: {
          amount: 150,
          status: PaymentStatus.COMPLETED,
          method: PaymentMethod.CREDIT_CARD,
          transactionId: 'txn_123456',
        },
      },
      review: {
        create: {
          rating: 5,
          comment: 'Excellent service! Very professional and quick.',
          serviceId: plumbingService.id,
          customerId: customer.id,
        },
      },
    },
  });

  // Create a sample notification
  const notification = await prisma.notification.create({
    data: {
      userId: customer.id,
      title: 'Booking Confirmed',
      message: 'Your plumbing service booking has been confirmed for March 15, 2024.',
      type: 'BOOKING_CONFIRMED',
    },
  });

  console.log({ admin, technician, customer, plumbingService, renovationService, booking, notification });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 