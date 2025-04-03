import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, rating, comment } = await req.json();

    // Verify the booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to review this booking' },
        { status: 403 }
      );
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        bookingId,
        technicianId: booking.technicianId,
        serviceId: booking.serviceId,
        userId: session.user.id,
      },
      include: {
        booking: true,
        service: true,
        technician: true,
        user: true,
      },
    });

    // Create notification for technician
    await prisma.notification.create({
      data: {
        userId: booking.technician.userId,
        title: 'New Review',
        message: `You received a ${rating}-star review for ${booking.service.name}`,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const serviceId = searchParams.get('serviceId');

    let where = {};
    
    if (role === 'technician') {
      const technician = await prisma.technician.findUnique({
        where: { userId: session.user.id },
      });
      if (!technician) {
        return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
      }
      where = { technicianId: technician.id };
    } else if (serviceId) {
      where = { serviceId };
    } else {
      where = { userId: session.user.id };
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        booking: true,
        service: true,
        technician: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
} 