import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { EmailService } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId, date, startTime, endTime } = await req.json();

    // Get the service to calculate amount
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { technician: true },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        amount: service.price,
        status: BookingStatus.PENDING,
        technicianId: service.technicianId,
        serviceId,
        customerId: session.user.id,
      },
      include: {
        service: {
          select: {
            name: true,
            description: true,
          },
        },
        technician: {
          select: {
            name: true,
            phone: true,
            email: true,
            experience: true,
            specialties: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
    });

    // Create notification for technician
    await prisma.notification.create({
      data: {
        userId: service.technician.userId,
        title: 'New Booking Request',
        message: `You have a new booking request for ${service.name} from ${session.user.name}`,
      },
    });

    // Send email to customer
    try {
      await EmailService.sendBookingConfirmationToCustomer(
        booking.customer.email,
        booking.customer.name || '',
        booking.service.name,
        booking.date,
        booking.startTime,
        booking.amount,
        booking.technician.name,
        booking.id,
        booking.status,
        `${process.env.NEXT_PUBLIC_APP_URL}/user/bookings/${booking.id}`
      );
      console.log('Sending customer email to:', booking.customer.email);
    } catch (emailError) {
      console.error('Failed to send customer email:', emailError);
    }

    // Send email to technician
    try {
      await EmailService.sendBookingNotificationToTechnician(
        booking.technician.email,
        booking.technician.name,
        booking.service.name,
        booking.date,
        booking.startTime,
        booking.amount,
        booking.customer.name || '',
        booking.id,
        `${process.env.NEXT_PUBLIC_APP_URL}/technician/bookings/${booking.id}`
      );
      console.log('Sending technician email to:', booking.technician.email);
    } catch (emailError) {
      console.error('Failed to send technician email:', emailError);
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const needsPayment = searchParams.get('needsPayment') === 'true';

    console.log('Fetching bookings for:', {
      role,
      status,
      needsPayment,
      userId: session.user.id,
      userName: session.user.name
    });

    let where: any = {};
    
    if (role === 'technician') {
      const technician = await prisma.technician.findUnique({
        where: { userId: session.user.id },
      });
      console.log('Found technician:', technician);
      
      if (!technician) {
        console.log('No technician found for user:', session.user.id);
        return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
      }
      where = { technicianId: technician.id };
    } else {
      where = { customerId: session.user.id };
    }

    if (status) {
      where = { ...where, status: status as BookingStatus };
    }

    // If needsPayment is true, add condition to filter bookings without payments
    if (needsPayment) {
      where = {
        ...where,
        payment: { is: null }  // Bookings with no payment record
      };
    }

    console.log('Query where clause:', where);

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: {
          select: {
            name: true,
            description: true,
          },
        },
        technician: {
          select: {
            name: true,
            phone: true,
            email: true,
            experience: true,
            specialties: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        payment: true,
        review: {
          select: {
            rating: true,
            comment: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    console.log('Found bookings:', bookings.length);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 