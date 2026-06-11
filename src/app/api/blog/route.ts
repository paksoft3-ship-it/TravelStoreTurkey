import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List published blog posts (public)
export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        category: true,
        author: true,
        publishedAt: true,
        views: true,
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Public Blog GET error:', error);
    return NextResponse.json({ posts: [] });
  }
}
