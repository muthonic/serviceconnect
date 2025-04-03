import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedServices = await prisma.service.findMany({
      where: {
        users: {
          some: {
            id: session.user.id
          }
        }
      },
      include: {
        technician: {
          select: {
            name: true,
            specialties: true,
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    });

    // Calculate average rating for each service's technician
    const servicesWithRating = savedServices.map(service => {
      const technicianReviews = service.technician.reviews;
      const avgRating = technicianReviews.length > 0
        ? technicianReviews.reduce((acc, review) => acc + review.rating, 0) / technicianReviews.length
        : 0;

      return {
        ...service,
        technician: {
          name: service.technician.name,
          specialties: service.technician.specialties,
          rating: avgRating,
          reviews: technicianReviews.length
        }
      };
    });

    return NextResponse.json(servicesWithRating);
  } catch (error) {
    console.error('Error fetching saved services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId } = await request.json();

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Add service to user's saved services using the many-to-many relationship
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        services: {
          connect: { id: serviceId }
        }
      }
    });

    return NextResponse.json({ message: 'Service saved successfully' });
  } catch (error) {
    console.error('Error saving service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId } = await request.json();

    // Remove service from user's saved services using the many-to-many relationship
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        services: {
          disconnect: { id: serviceId }
        }
      }
    });

    return NextResponse.json({ message: 'Service removed successfully' });
  } catch (error) {
    console.error('Error removing saved service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 