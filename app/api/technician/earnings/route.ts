import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/technician/earnings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentStatus = searchParams.get('paymentStatus');

    // Get technician by email
    const technician = await prisma.technician.findUnique({
      where: { email: session.user.email },
      include: {
        services: {
          select: { id: true }
        }
      }
    });

    if (!technician) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    const serviceIds = technician.services.map(service => service.id);

    // Build where clause for bookings
    const where: any = {
      serviceId: { in: serviceIds },
      status: 'COMPLETED' // Only show completed bookings
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.payment = {
        status: paymentStatus.toUpperCase(),
      };
    }

    // Get bookings with payments and customer details
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        payment: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate monthly breakdown
    const monthlyBreakdown = bookings.reduce((acc: any[], booking) => {
      const month = new Date(booking.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      const existingMonth = acc.find(m => m.month === month);
      
      if (existingMonth) {
        existingMonth.earnings += booking.service.price || 0;
        existingMonth.bookings += 1;
      } else {
        acc.push({
          month,
          earnings: booking.service.price || 0,
          bookings: 1,
        });
      }
      
      return acc;
    }, []).sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());

    // Calculate earnings statistics
    const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.service.price || 0), 0);
    const totalBookings = bookings.length;
    const averageEarningPerBooking = totalBookings > 0 ? totalEarnings / totalBookings : 0;
    
    const totalPendingPayments = bookings
      .filter(b => b.payment?.status === 'PENDING')
      .reduce((sum, booking) => sum + (booking.service.price || 0), 0);
    
    const totalCompletedPayments = bookings
      .filter(b => b.payment?.status === 'COMPLETED')
      .reduce((sum, booking) => sum + (booking.service.price || 0), 0);

    // Format bookings data
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      date: booking.date.toISOString(),
      serviceName: booking.service.name,
      amount: booking.service.price || 0,
      paymentMethod: booking.payment?.method || 'N/A',
      paymentStatus: booking.payment?.status || 'PENDING',
      customerName: booking.customer.name || 'Anonymous',
      customerEmail: booking.customer.email || 'N/A',
    }));

    return NextResponse.json({
      totalEarnings,
      totalBookings,
      averageEarningPerBooking,
      totalPendingPayments,
      totalCompletedPayments,
      bookings: formattedBookings,
      monthlyBreakdown,
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 