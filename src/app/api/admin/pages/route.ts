import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const pages = await prisma.page.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Admin pages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { slug, title, content } = body;
    if (!slug || !title || !content) {
      return NextResponse.json({ error: 'slug, title, and content are required' }, { status: 400 });
    }
    const page = await prisma.page.create({ data: { slug, title, content } });
    return NextResponse.json({ page }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
    }
    console.error('Admin pages POST error:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
