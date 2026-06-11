import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const updateVehicleSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  licensePlate: z.string().min(1).optional(),
  type: z.enum(['SEDAN', 'SUV', 'VAN', 'LUXURY', 'MINIBUS']).optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  features: z.array(z.string()).optional(),
  image: z.string().url().optional().nullable(),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED']).optional(),
});

// GET - Get single vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        driver: true,
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            bookingNumber: true,
            customerName: true,
            pickupDate: true,
            status: true,
            totalPrice: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error('Vehicle GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

// PUT - Update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateVehicleSchema.parse(body);

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check license plate uniqueness if updating
    if (validatedData.licensePlate && validatedData.licensePlate !== existingVehicle.licensePlate) {
      const plateExists = await prisma.vehicle.findUnique({
        where: { licensePlate: validatedData.licensePlate },
      });

      if (plateExists) {
        return NextResponse.json(
          { error: 'License plate already in use' },
          { status: 400 }
        );
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: validatedData,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Vehicle PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

// DELETE - Delete vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        driver: true,
        _count: { select: { bookings: true } },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check if vehicle has driver assigned
    if (vehicle.driver) {
      return NextResponse.json(
        { error: 'Cannot delete vehicle with assigned driver' },
        { status: 400 }
      );
    }

    // Check if vehicle has bookings
    if (vehicle._count.bookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vehicle with existing bookings' },
        { status: 400 }
      );
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Vehicle DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
