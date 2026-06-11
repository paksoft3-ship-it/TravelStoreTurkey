import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - Single active tour by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const tour = await prisma.tour.findFirst({
      where: { slug, active: true },
    });

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json({ tour });
  } catch (error) {
    console.error('Public Tour[slug] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 });
  }
}
