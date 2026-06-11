import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/vehicles - Public list of non-retired vehicles
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: { not: 'RETIRED' },
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        type: true,
        capacity: true,
        features: true,
        image: true,
        status: true,
      },
      orderBy: { type: 'asc' },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Public vehicles GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}
