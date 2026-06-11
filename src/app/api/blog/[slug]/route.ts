import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - Single published blog post by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findFirst({
      where: { slug, status: 'PUBLISHED' },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Public Blog[slug] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
