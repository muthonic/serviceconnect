import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer's bookings
    const bookings = await prisma.booking.findMany({
      where: { customerId: session.user.id },
      include: {
        service: true,
        technician: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate statistics
    const upcomingBookings = bookings.filter(
      (booking) => 
        new Date(booking.date) >= new Date() && 
        booking.status === 'CONFIRMED'
    ).length;

    const completedBookings = bookings.filter(
      (booking) => booking.status === 'COMPLETED'
    ).length;

    // Get saved services
    const savedServices = await prisma.service.findMany({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        technician: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get profile completion percentage
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    const profileFields = [
      user?.name,
      user?.email,
      user?.phone,
      user?.address,
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    return NextResponse.json({
      upcomingBookings,
      completedBookings,
      savedServices: savedServices.length,
      profileCompletion,
      recentBookings: bookings.slice(0, 5).map(booking => ({
        id: booking.id,
        serviceName: booking.service.name,
        technicianName: booking.technician.name,
        date: booking.date.toISOString(),
        status: booking.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching customer dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 