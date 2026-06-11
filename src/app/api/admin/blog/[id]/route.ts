import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Single post
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
    const post = await prisma.blogPost.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Blog[id] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT - Update post
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

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const wasPublished = existing.status === 'PUBLISHED';
    const isPublishing = body.status === 'PUBLISHED' && !wasPublished;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.featuredImage !== undefined && { featuredImage: body.featuredImage || null }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.author !== undefined && { author: body.author }),
        ...(body.status !== undefined && { status: body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT' }),
        ...(isPublishing && { publishedAt: new Date() }),
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Blog[id] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE - Delete post
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
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Blog[id] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
