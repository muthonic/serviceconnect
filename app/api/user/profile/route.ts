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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        bookings: {
          include: {
            service: true,
            technician: true,
            review: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate booking statistics
    const totalBookings = user.bookings.length;
    const completedBookings = user.bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledBookings = user.bookings.filter(b => b.status === 'CANCELLED').length;

    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      joinDate: user.createdAt.toISOString(),
      totalBookings,
      completedBookings,
      cancelledBookings,
      bookings: user.bookings.map(booking => ({
        id: booking.id,
        date: booking.date.toISOString(),
        status: booking.status,
        service: {
          name: booking.service.name,
          description: booking.service.description,
        },
        technician: {
          id: booking.technician.id,
          name: booking.technician.name,
        },
        review: booking.review ? {
          rating: booking.review.rating,
        } : undefined,
      })),
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone } = await request.json();

    // Update user fields
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
      },
      include: {
        bookings: {
          include: {
            service: true,
            technician: true,
            review: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    // Calculate booking statistics
    const totalBookings = updatedUser.bookings.length;
    const completedBookings = updatedUser.bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledBookings = updatedUser.bookings.filter(b => b.status === 'CANCELLED').length;

    const profileData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      joinDate: updatedUser.createdAt.toISOString(),
      totalBookings,
      completedBookings,
      cancelledBookings,
      bookings: updatedUser.bookings.map(booking => ({
        id: booking.id,
        date: booking.date.toISOString(),
        status: booking.status,
        service: {
          name: booking.service.name,
          description: booking.service.description,
        },
        technician: {
          id: booking.technician.id,
          name: booking.technician.name,
        },
        review: booking.review ? {
          rating: booking.review.rating,
        } : undefined,
      })),
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 