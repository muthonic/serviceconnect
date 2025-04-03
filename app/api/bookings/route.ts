import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

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

    console.log('Fetching bookings for:', {
      role,
      status,
      userId: session.user.id,
      userName: session.user.name
    });

    let where = {};
    
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