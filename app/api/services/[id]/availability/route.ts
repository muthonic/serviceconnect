import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { message: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Get the service with technician details
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        technician: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Get the day of week (0-6) for the requested date
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Check if technician is available on this day
    const availability = service.technician.availability as {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };

    const dayMap: Record<number, keyof typeof availability> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };

    if (!availability[dayMap[dayOfWeek]]) {
      return NextResponse.json(
        { message: 'Technician is not available on this day' },
        { status: 404 }
      );
    }

    // Get existing bookings for the date
    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId: params.id,
        date: requestedDate,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Get technician's working hours
    const workingHours = service.technician.workingHours as {
      start: string;
      end: string;
    };

    // Generate available time slots
    const timeSlots = generateTimeSlots(
      workingHours.start,
      workingHours.end,
      existingBookings,
      service.duration
    );

    return NextResponse.json({ timeSlots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { message: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

function generateTimeSlots(
  startTime: string,
  endTime: string,
  existingBookings: { startTime: string; endTime: string }[],
  serviceDuration: number
): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const timeString = `${String(currentHour).padStart(2, '0')}:${String(
      currentMinute
    ).padStart(2, '0')}`;

    // Calculate end time for this slot
    const slotEndHour = Math.floor((currentHour * 60 + currentMinute + serviceDuration) / 60);
    const slotEndMinute = (currentHour * 60 + currentMinute + serviceDuration) % 60;
    const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(
      slotEndMinute
    ).padStart(2, '0')}`;

    // Check if this time slot overlaps with any existing bookings
    const isOverlapping = existingBookings.some(
      (booking) =>
        (timeString >= booking.startTime && timeString < booking.endTime) ||
        (slotEndTime > booking.startTime && slotEndTime <= booking.endTime) ||
        (timeString <= booking.startTime && slotEndTime >= booking.endTime)
    );

    // Check if the slot ends after working hours
    const isAfterWorkingHours = slotEndHour > endHour || 
      (slotEndHour === endHour && slotEndMinute > endMinute);

    if (!isOverlapping && !isAfterWorkingHours) {
      slots.push(timeString);
    }

    // Increment time by 30 minutes
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }
  }

  return slots;
} 