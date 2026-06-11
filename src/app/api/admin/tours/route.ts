import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET - List all tours
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const active = searchParams.get('active');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (active === 'true') where.active = true;
    if (active === 'false') where.active = false;

    const tours = await prisma.tour.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tours });
  } catch (error) {
    console.error('Admin Tours GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 });
  }
}

// POST - Create tour
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, shortDescription, duration, durationHours, price, largeGroupPrice, currency, category, highlights, includes, images, featured, active } = body;

    if (!name || !description || !shortDescription || !duration || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let slug = body.slug || generateSlug(name);
    const existing = await prisma.tour.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const tour = await prisma.tour.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        duration,
        durationHours: durationHours || 1,
        price: parseFloat(price),
        largeGroupPrice: parseFloat(largeGroupPrice) || 0,
        currency: currency || 'ISK',
        category,
        highlights: highlights || [],
        includes: includes || [],
        images: images || [],
        featured: featured || false,
        active: active !== false,
      },
    });

    return NextResponse.json({ tour }, { status: 201 });
  } catch (error) {
    console.error('Admin Tours POST error:', error);
    return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 });
  }
}
