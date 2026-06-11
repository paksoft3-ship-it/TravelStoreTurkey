import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  status: z.enum(['AVAILABLE', 'ON_TOUR', 'OFFLINE', 'BREAK']).optional(),
  image: z.string().url().optional().nullable(),
  vehicleId: z.string().optional().nullable(),
});

// GET - List all drivers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const drivers = await prisma.driver.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            licensePlate: true,
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error('Drivers GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

// POST - Create new driver
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = driverSchema.parse(body);

    // Check if email already exists
    const existingDriver = await prisma.driver.findUnique({
      where: { email: validatedData.email },
    });

    if (existingDriver) {
      return NextResponse.json(
        { error: 'Driver with this email already exists' },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        licenseNumber: validatedData.licenseNumber,
        status: validatedData.status || 'OFFLINE',
        image: validatedData.image,
        vehicleId: validatedData.vehicleId,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            licensePlate: true,
          },
        },
      },
    });

    return NextResponse.json({ driver }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Driver POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    );
  }
}
