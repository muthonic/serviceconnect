import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get technician's bookings and reviews
    const technician = await prisma.technician.findUnique({
      where: { email: session.user.email },
      include: {
        bookings: {
          include: {
            service: true,
            customer: true,
            review: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!technician) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    // Calculate statistics
    const totalBookings = technician.bookings.length;
    const completedBookings = technician.bookings.filter(b => b.status === 'COMPLETED').length;
    const pendingBookings = technician.bookings.filter(b => b.status === 'PENDING').length;
    
    // Calculate earnings (assuming each completed booking contributes to earnings)
    const totalEarnings = technician.bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, booking) => sum + (booking.service.price || 0), 0);

    // Calculate ratings and reviews
    const reviews = technician.bookings
      .filter(b => b.review)
      .map(b => ({
        id: b.review!.id,
        rating: b.review!.rating,
        comment: b.review!.comment,
        customerName: b.customer.name || 'Anonymous',
        date: b.review!.createdAt.toISOString()
      }));

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Get upcoming bookings
    const upcomingBookings = technician.bookings
      .filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING')
      .map(b => ({
        id: b.id,
        date: b.date.toISOString(),
        startTime: b.startTime,
        endTime: b.endTime,
        serviceName: b.service.name,
        customerName: b.customer.name || 'Anonymous',
        status: b.status
      }));

    return NextResponse.json({
      totalBookings,
      completedBookings,
      pendingBookings,
      totalEarnings,
      averageRating,
      totalReviews: reviews.length,
      recentReviews: reviews.slice(0, 5), // Get 5 most recent reviews
      upcomingBookings: upcomingBookings.slice(0, 5) // Get 5 upcoming bookings
    });
  } catch (error) {
    console.error('Error fetching technician dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 