import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Single tour
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
    const tour = await prisma.tour.findUnique({ where: { id } });

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json({ tour });
  } catch (error) {
    console.error('Admin Tours[id] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 });
  }
}

// PUT - Update tour
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

    const existing = await prisma.tour.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    const tour = await prisma.tour.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.durationHours !== undefined && { durationHours: body.durationHours }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.largeGroupPrice !== undefined && { largeGroupPrice: parseFloat(body.largeGroupPrice) || 0 }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.highlights !== undefined && { highlights: body.highlights }),
        ...(body.includes !== undefined && { includes: body.includes }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });

    return NextResponse.json({ tour });
  } catch (error) {
    console.error('Admin Tours[id] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update tour' }, { status: 500 });
  }
}

// DELETE - Soft delete (set active=false)
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
    const existing = await prisma.tour.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    await prisma.tour.delete({ where: { id } });
    return NextResponse.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Admin Tours[id] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 });
  }
}
