import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/technician/services
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching services for user:', session.user.id);

    // Get the technician's ID
    const technician = await prisma.technician.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!technician) {
      console.log('Technician not found for user:', session.user.id);
      return NextResponse.json({ error: 'Technician profile not found' }, { status: 404 });
    }

    console.log('Found technician:', technician.id);

    const services = await prisma.service.findMany({
      where: {
        technicianId: technician.id,
      },
      include: {
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log('Found services:', services.length);
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/technician/services
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received service data:', body);
    const { name, description, category, price, duration, images } = body;

    // Validate required fields
    if (!name || !description || !category || !price || !duration) {
      console.log('Missing required fields:', { name, description, category, price, duration });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the technician's ID
    const technician = await prisma.technician.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!technician) {
      console.log('Technician not found for user:', session.user.id);
      return NextResponse.json(
        { error: 'Technician profile not found' },
        { status: 404 }
      );
    }

    console.log('Creating service for technician:', technician.id);

    // Create the service
    const service = await prisma.service.create({
      data: {
        name,
        description,
        category,
        price: parseFloat(price),
        duration: parseInt(duration),
        technicianId: technician.id,
        images: {
          create: images?.map((url: string) => ({ url })) || []
        }
      },
      include: {
        images: true,
        technician: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('Service created successfully:', service);
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 