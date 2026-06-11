import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const transfers = await prisma.transferRoute.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error('GET /api/admin/transfers error:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, from, to, description, duration, distance, passengers, price, largeGroupPrice, features, popular, active, sortOrder } = body;

    if (!name || !category || price == null) {
      return NextResponse.json({ error: 'name, category and price are required' }, { status: 400 });
    }

    const transfer = await prisma.transferRoute.create({
      data: {
        name,
        category,
        from: from || null,
        to: to || null,
        description: description || null,
        duration: duration || null,
        distance: distance || null,
        passengers: passengers || null,
        price: parseFloat(price),
        largeGroupPrice: parseFloat(largeGroupPrice) || 0,
        features: features || [],
        popular: popular ?? false,
        active: active ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ transfer }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/transfers error:', error);
    return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 });
  }
}
