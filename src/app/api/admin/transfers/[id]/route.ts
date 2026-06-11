import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const transfer = await prisma.transferRoute.findUnique({ where: { id } });
    if (!transfer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ transfer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transfer' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();

    const transfer = await prisma.transferRoute.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.from !== undefined && { from: body.from || null }),
        ...(body.to !== undefined && { to: body.to || null }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.duration !== undefined && { duration: body.duration || null }),
        ...(body.distance !== undefined && { distance: body.distance || null }),
        ...(body.passengers !== undefined && { passengers: body.passengers || null }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.largeGroupPrice !== undefined && { largeGroupPrice: parseFloat(body.largeGroupPrice) || 0 }),
        ...(body.features !== undefined && { features: body.features }),
        ...(body.popular !== undefined && { popular: body.popular }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json({ transfer });
  } catch (error) {
    console.error('PUT /api/admin/transfers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update transfer' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await prisma.transferRoute.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transfer' }, { status: 500 });
  }
}
