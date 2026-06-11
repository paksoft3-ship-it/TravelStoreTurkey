import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, 'License plate is required'),
  type: z.enum(['SEDAN', 'SUV', 'VAN', 'LUXURY', 'MINIBUS']),
  capacity: z.number().int().min(1).max(20),
  features: z.array(z.string()).optional(),
  image: z.string().url().optional().nullable(),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED']).optional(),
});

// GET - List all vehicles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Vehicles GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

// POST - Create new vehicle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = vehicleSchema.parse(body);

    // Check if license plate already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate: validatedData.licensePlate },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle with this license plate already exists' },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        make: validatedData.make,
        model: validatedData.model,
        year: validatedData.year,
        licensePlate: validatedData.licensePlate,
        type: validatedData.type,
        capacity: validatedData.capacity,
        features: validatedData.features || [],
        image: validatedData.image,
        status: validatedData.status || 'AVAILABLE',
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Vehicle POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}
