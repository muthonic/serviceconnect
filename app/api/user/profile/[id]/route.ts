import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to view profiles' },
        { status: 401 }
      );
    }

    const userId = params.id;
    const currentUserId = session.user.id;

    // Fetch user with their bookings and technician data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookings: {
          select: {
            status: true,
          },
        },
        technician: true, // Include technician data if user is a technician
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate booking statistics
    const totalBookings = user.bookings.length;
    const completedBookings = user.bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledBookings = user.bookings.filter(b => b.status === 'CANCELLED').length;

    // Prepare profile data
    const profileData = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      joinDate: user.createdAt.toISOString(),
      totalBookings,
      completedBookings,
      cancelledBookings,
      isCurrentUser: userId === currentUserId,
      // Include technician-specific fields if user is a technician
      ...(user.technician && {
        address: user.technician.address,
        city: user.technician.city,
        state: user.technician.state,
        zipCode: user.technician.zipCode,
        specialties: user.technician.specialties,
        rating: user.technician.rating,
        reviews: user.technician.reviews,
      }),
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to fetch user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    const currentUserId = session.user.id;

    // Only allow users to update their own profile
    if (userId !== currentUserId) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      );
    }

    const { name, phone, address, city, state, zipCode } = await request.json();

    // First, get the user to check their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { technician: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
      },
      include: {
        technician: true,
        bookings: {
          select: {
            status: true,
          },
        },
      },
    });

    // If user is a technician, update technician fields
    if (user.role === 'TECHNICIAN' && user.technician) {
      await prisma.technician.update({
        where: { id: user.technician.id },
        data: {
          address,
          city,
          state,
          zipCode,
        },
      });
    }

    // Calculate booking statistics
    const totalBookings = updatedUser.bookings.length;
    const completedBookings = updatedUser.bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledBookings = updatedUser.bookings.filter(b => b.status === 'CANCELLED').length;

    const profileData = {
      id: updatedUser.id,
      name: updatedUser.name || '',
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      role: updatedUser.role,
      joinDate: updatedUser.createdAt.toISOString(),
      totalBookings,
      completedBookings,
      cancelledBookings,
      isCurrentUser: true,
      // Include technician-specific fields if user is a technician
      ...(updatedUser.technician && {
        address: updatedUser.technician.address,
        city: updatedUser.technician.city,
        state: updatedUser.technician.state,
        zipCode: updatedUser.technician.zipCode,
        specialties: updatedUser.technician.specialties,
        rating: updatedUser.technician.rating,
        reviews: updatedUser.technician.reviews,
      }),
    };

    return NextResponse.json({ user: profileData });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 