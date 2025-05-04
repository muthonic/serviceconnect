import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { EmailService } from '@/lib/email';

// GET /api/technician/bookings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get technician's services
    const technicianServices = await prisma.service.findMany({
      where: { technicianId: session.user.id },
      select: { id: true },
    });

    const serviceIds = technicianServices.map((service) => service.id);

    // Build where clause
    const where: any = {
      serviceId: { in: serviceIds },
    };

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
        review: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/technician/bookings/[id]
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { bookingId, status } = data;

    // Verify booking belongs to technician
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.service.technicianId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        service: true,
        customer: true,
        technician: true,
        payment: true,
        review: true,
      },
    });

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        title: 'Booking Status Updated',
        message: `Your booking for ${booking.service.name} has been ${status.toLowerCase()}.`,
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 