import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  driverId: z.string().optional().nullable(),
  vehicleId: z.string().optional().nullable(),
  pickupDate: z.string().datetime().optional(),
  pickupTime: z.string().optional(),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional().nullable(),
  specialRequests: z.string().optional().nullable(),
});

// GET - Get single booking
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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tour: true,
        driver: true,
        vehicle: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Admin booking GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT - Update booking
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
    const validatedData = updateBookingSchema.parse(body);

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Validate driver exists if provided
    if (validatedData.driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: validatedData.driverId },
      });
      if (!driver) {
        return NextResponse.json({ error: 'Driver not found' }, { status: 400 });
      }
    }

    // Validate vehicle exists if provided
    if (validatedData.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: validatedData.vehicleId },
      });
      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 400 });
      }
    }

    const updateData: any = { ...validatedData };

    // Convert datetime string to Date if provided
    if (validatedData.pickupDate) {
      updateData.pickupDate = new Date(validatedData.pickupDate);
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        tour: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
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

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Admin booking PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/Delete booking
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

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    await prisma.booking.delete({ where: { id } });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Admin booking DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
