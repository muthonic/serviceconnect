import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/technician/schedule
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get technician's services
    const technicianServices = await prisma.service.findMany({
      where: { technicianId: session.user.id },
      select: { id: true },
    });

    const serviceIds = technicianServices.map((service) => service.id);

    // Build where clause
    const where: any = {
      serviceId: { in: serviceIds },
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get bookings for the date range
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
        startTime: 'asc',
      },
    });

    // Get technician's availability
    const technician = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { availability: true },
    });

    return NextResponse.json({
      availability: technician?.availability || '',
      bookings: bookings.map((booking) => ({
        id: booking.id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        serviceName: booking.service.name,
        customerName: booking.customer.name,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
      })),
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/technician/schedule
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { availability } = data;

    // Update technician's availability
    const updatedTechnician = await prisma.user.update({
      where: { id: session.user.id },
      data: { availability },
      select: { availability: true },
    });

    return NextResponse.json(updatedTechnician);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 