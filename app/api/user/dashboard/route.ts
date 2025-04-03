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

    // Get user with their bookings and technician data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        bookings: {
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
        },
        technician: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate statistics
    const upcomingBookings = user.bookings.filter(
      (booking) => 
        new Date(booking.date) >= new Date() && 
        booking.status === 'CONFIRMED'
    ).length;

    const completedBookings = user.bookings.filter(
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
            rating: true,
            specialties: true,
          },
        },
      },
    });

    // Get profile completion percentage
    const profileFields = [
      user.name,
      user.email,
      user.phone,
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    // If user is a technician, include additional stats
    let technicianStats = null;
    if (user.role === 'TECHNICIAN' && user.technician) {
      const technicianBookings = await prisma.booking.findMany({
        where: { technicianId: user.technician.id },
        include: {
          service: true,
          customer: true,
        },
      });

      const totalEarnings = technicianBookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, booking) => sum + booking.amount, 0);

      const reviews = await prisma.review.findMany({
        where: { technicianId: user.technician.id },
        include: { 
          booking: {
            include: {
              customer: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      technicianStats = {
        totalEarnings,
        averageRating,
        totalReviews: reviews.length,
        recentReviews: reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          customerName: review.booking.customer.name,
          date: review.createdAt.toISOString(),
        })),
      };
    }

    return NextResponse.json({
      upcomingBookings,
      completedBookings,
      savedServices: savedServices.length,
      profileCompletion,
      recentBookings: user.bookings.slice(0, 5).map(booking => ({
        id: booking.id,
        serviceName: booking.service.name,
        technicianName: booking.technician.name,
        date: booking.date.toISOString(),
        status: booking.status,
      })),
      ...(technicianStats && { technicianStats }),
    });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 