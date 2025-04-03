import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';

    console.log('Search params:', { query, category, location });

    // Build the where clause for the search
    const where: any = {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            {
              technician: {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { specialties: { hasSome: [query] } },
                ],
              },
            },
          ],
        },
      ],
    };

    // Add category filter if provided
    if (category && category !== 'all') {
      where.AND.push({ category: { equals: category, mode: 'insensitive' } });
    }

    // Add location filter if provided
    if (location) {
      where.AND.push({
        technician: {
          OR: [
            { city: { contains: location, mode: 'insensitive' } },
            { state: { contains: location, mode: 'insensitive' } },
          ],
        },
      });
    }

    console.log('Search where clause:', where);

    // Fetch services with their technician details
    const services = await prisma.service.findMany({
      where,
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            specialties: true,
            experience: true,
            profileImage: true,
          },
        },
        images: {
          select: {
            url: true,
          },
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
          },
        },
      },
    });

    console.log('Found services:', services.length);

    // Calculate average rating for each service
    const servicesWithRating = services.map(service => {
      const avgRating = service.reviews.length > 0
        ? service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length
        : 0;

      return {
        ...service,
        avgRating,
        reviewCount: service.reviews.length,
        reviews: undefined, // Remove the reviews array from the response
      };
    });

    return NextResponse.json(servicesWithRating);
  } catch (error) {
    console.error('Error searching services:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 