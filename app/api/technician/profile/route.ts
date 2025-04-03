import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadImage } from '@/lib/uploadImage';

// GET /api/technician/profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the technician profile with related data
    const technician = await prisma.technician.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        services: true,
        reviews: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!technician) {
      return NextResponse.json(
        { error: 'Technician not found' },
        { status: 404 }
      );
    }

    // Calculate average rating and total reviews
    const totalReviews = technician.reviews.length;
    const averageRating = totalReviews > 0
      ? technician.reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
      : 0;

    // Format availability
    const availabilityObj = typeof technician.availability === 'string'
      ? JSON.parse(technician.availability)
      : technician.availability;

    const workingHours = typeof technician.workingHours === 'string'
      ? JSON.parse(technician.workingHours)
      : technician.workingHours;

    // Format the response
    const formattedResponse = {
      name: technician.user.name,
      email: technician.email,
      phone: technician.phone,
      address: technician.address,
      city: technician.city,
      state: technician.state,
      zipCode: technician.zipCode,
      bio: technician.bio,
      specialties: technician.specialties,
      experience: technician.experience,
      certifications: technician.certifications,
      availability: availabilityObj,
      workingHours: workingHours,
      profileImage: technician.profileImage,
      rating: Number(averageRating.toFixed(1)),
      reviews: totalReviews,
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error fetching technician profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technician profile' },
      { status: 500 }
    );
  }
}

// Helper function to get appropriate icon based on service category
function getServiceIcon(category: string): string {
  const iconMap: { [key: string]: string } = {
    plumbing: '🚰',
    electrical: '⚡',
    hvac: '❄️',
    carpentry: '🔨',
    painting: '🎨',
    cleaning: '🧹',
    landscaping: '🌿',
    general: '🔧',
  };

  return iconMap[category.toLowerCase()] || '🔧';
}

// PUT /api/technician/profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      phone,
      address,
      city,
      state,
      zipCode,
      bio,
      specialties,
      experience,
      certifications,
      availability,
      workingHours,
    } = body;

    // Update the technician profile
    const updatedTechnician = await prisma.technician.update({
      where: {
        email: session.user.email,
      },
      data: {
        name,
        phone,
        address,
        city,
        state,
        zipCode,
        bio,
        specialties,
        experience,
        certifications,
        availability,
        workingHours,
      },
    });

    return NextResponse.json(updatedTechnician);
  } catch (error) {
    console.error('Error updating technician profile:', error);
    return NextResponse.json(
      { error: 'Failed to update technician profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const technician = await prisma.technician.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        bio: data.bio,
        profileImage: data.profileImage,
        specialties: data.specialties,
        experience: data.experience,
        certifications: data.certifications,
        availability: data.availability,
        workingHours: data.workingHours,
      },
    });

    return NextResponse.json(technician);
  } catch (error) {
    console.error('Error updating technician profile:', error);
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    );
  }
} 