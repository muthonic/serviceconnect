import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { EmailService } from '@/lib/email';

// GET a single booking by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.id;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: {
            technician: true
          }
        },
        customer: true,
        payment: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the user has permission to view this booking
    const isCustomer = booking.customerId === session.user.id;
    const isTechnician = booking.service.technician.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isCustomer && !isTechnician && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to view this booking' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

// PATCH update a booking's status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    // Verify the user is a technician
    const technician = await prisma.technician.findUnique({
      where: { userId: session.user.id },
    });

    if (!technician) {
      return NextResponse.json({ error: 'Not a technician' }, { status: 403 });
    }

    const bookingId = params.id;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the technician is assigned to the booking
    if (booking.technicianId !== technician.id) {
      return NextResponse.json({ error: 'Not authorized to update this booking' }, { status: 403 });
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as BookingStatus },
      include: {
        service: true,
        customer: true,
        technician: true
      }
    });

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        title: 'Booking Status Updated',
        message: `Your booking for ${booking.service.name} has been ${status.toLowerCase()}`,
      },
    });

    // Send email to customer about booking status update
    try {
      console.log('About to send email with booking status:', updatedBooking.status);
      console.log('Technician data available:', !!updatedBooking.technician);
      
      await EmailService.sendBookingConfirmationToCustomer(
        updatedBooking.customer.email,
        updatedBooking.customer.name || '',
        updatedBooking.service.name,
        updatedBooking.date,
        updatedBooking.startTime,
        updatedBooking.amount,
        updatedBooking.technician.name,
        updatedBooking.id,
        updatedBooking.status,
        `${process.env.NEXT_PUBLIC_APP_URL}/user/bookings/${updatedBooking.id}`
      );
      console.log('Sending status update email to customer:', updatedBooking.customer.email);
    } catch (emailError) {
      console.error('Failed to send status update email to customer:', emailError);
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
} 