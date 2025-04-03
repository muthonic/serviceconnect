import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();

    // Verify the user is a technician
    const technician = await prisma.technician.findUnique({
      where: { userId: session.user.id },
    });

    if (!technician) {
      return NextResponse.json({ error: 'Not a technician' }, { status: 403 });
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { customer: true, service: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the booking belongs to this technician
    if (booking.technicianId !== technician.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this booking' },
        { status: 403 }
      );
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: {
        service: true,
        technician: true,
        customer: true,
      },
    });

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        title: 'Booking Status Updated',
        message: `Your booking for ${booking.service.name} has been ${status.toLowerCase()}`,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
} 