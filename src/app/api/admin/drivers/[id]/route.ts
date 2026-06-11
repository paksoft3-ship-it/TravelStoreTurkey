import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const updateDriverSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  licenseNumber: z.string().min(1).optional(),
  status: z.enum(['AVAILABLE', 'ON_TOUR', 'OFFLINE', 'BREAK']).optional(),
  image: z.string().url().optional().nullable(),
  vehicleId: z.string().optional().nullable(),
});

// GET - Get single driver
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

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        vehicle: true,
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

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ driver });
  } catch (error) {
    console.error('Driver GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver' },
      { status: 500 }
    );
  }
}

// PUT - Update driver
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
    const validatedData = updateDriverSchema.parse(body);

    // Check if driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!existingDriver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Check email uniqueness if updating email
    if (validatedData.email && validatedData.email !== existingDriver.email) {
      const emailExists = await prisma.driver.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: validatedData,
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

    return NextResponse.json({ driver });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Driver PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update driver' },
      { status: 500 }
    );
  }
}

// DELETE - Delete driver
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

    // Check if driver exists
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        _count: { select: { bookings: true } },
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Check if driver has bookings
    if (driver._count.bookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete driver with existing bookings' },
        { status: 400 }
      );
    }

    await prisma.driver.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Driver DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete driver' },
      { status: 500 }
    );
  }
}
