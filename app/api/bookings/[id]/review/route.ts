import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating } = await request.json();

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get the user ID from the email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate the booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        technician: true,
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customer.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      );
    }

    // Create or update the review
    const review = await prisma.review.upsert({
      where: { bookingId: params.id },
      update: {
        rating,
        comment: '', // Set empty comment when updating
      },
      create: {
        bookingId: params.id,
        technicianId: booking.technicianId,
        userId: user.id,
        serviceId: booking.serviceId,
        rating,
        comment: '', // Set empty comment when creating
      },
    });

    // Update technician's average rating
    const technician = await prisma.technician.findUnique({
      where: { id: booking.technicianId },
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (technician) {
      const totalRatings = technician.reviews.length;
      const averageRating = technician.reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;

      await prisma.technician.update({
        where: { id: booking.technicianId },
        data: {
          averageRating,
          totalRatings,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
} 