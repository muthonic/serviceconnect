import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            experience: true,
            specialties: true,
            bio: true,
            availability: true,
            workingHours: true,
          },
        },
        images: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Calculate average rating and review count
    const avgRating = service.reviews.length > 0
      ? service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length
      : 0;

    const serviceWithStats = {
      ...service,
      rating: avgRating,
      reviewCount: service.reviews.length,
    };

    return NextResponse.json(serviceWithStats);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service details' },
      { status: 500 }
    );
  }
} 