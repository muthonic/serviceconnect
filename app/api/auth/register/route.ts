import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserRole, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      serviceType,
      experience,
      businessName,
      licenseNumber,
      address,
      city,
      state,
      zipCode,
      description,
      availability,
      hourlyRate,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data
    const userData = {
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      phone,
      role: role === 'TECHNICIAN' ? UserRole.TECHNICIAN : UserRole.CUSTOMER,
    };

    // Validate technician-specific fields if applicable
    if (role === 'TECHNICIAN') {
      if (!serviceType || !experience || !businessName || !licenseNumber || !address || !city || !state || !zipCode || !description || !availability || !hourlyRate) {
        return NextResponse.json(
          { error: 'Missing required technician fields' },
          { status: 400 }
        );
      }

      try {
        // Validate availability JSON
        const availabilityObj = JSON.parse(availability);
        if (typeof availabilityObj !== 'object') {
          throw new Error('Invalid availability format');
        }
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid availability format' },
          { status: 400 }
        );
      }
    }

    // Create user and technician in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: userData,
      });

      // If user is a technician, create technician and service records
      if (role === 'TECHNICIAN') {
        // Create technician
        const technician = await prisma.technician.create({
          data: {
            name: `${firstName} ${lastName}`,
            email,
            phone,
            address,
            city,
            state,
            zipCode,
            bio: description,
            experience: parseInt(experience),
            specialties: [serviceType],
            certifications: [licenseNumber],
            availability: JSON.parse(availability),
            workingHours: { start: "09:00", end: "17:00" },
            user: {
              connect: { id: user.id }
            }
          },
        });

        // Create service
        await prisma.service.create({
          data: {
            name: serviceType,
            description,
            price: parseFloat(hourlyRate),
            duration: 60, // Default duration in minutes
            category: serviceType,
            technician: {
              connect: { id: technician.id }
            }
          },
        });

        return { user, technician };
      }

      return { user };
    });

    return NextResponse.json(
      { message: 'User registered successfully', userId: result.user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 