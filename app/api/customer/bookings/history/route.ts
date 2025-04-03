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

    const bookings = await prisma.booking.findMany({
      where: { 
        customerId: session.user.id,
        status: { in: ['COMPLETED', 'CANCELLED'] }
      },
      include: {
        service: {
          select: {
            name: true,
            price: true,
          },
        },
        technician: {
          select: {
            name: true,
          },
        },
        review: {
          select: {
            rating: true,
            comment: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      serviceName: booking.service.name,
      technician: booking.technician.name,
      date: booking.date.toISOString(),
      status: booking.status,
      price: booking.service.price,
      rating: booking.review?.rating,
      review: booking.review?.comment,
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching booking history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 