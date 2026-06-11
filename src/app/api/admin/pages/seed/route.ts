import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { defaultPages } from '@/lib/defaultPages';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await Promise.all(
      defaultPages.map((p) =>
        prisma.page.upsert({
          where: { slug: p.slug },
          create: { slug: p.slug, title: p.title, content: p.content },
          update: {},
        })
      )
    );

    return NextResponse.json({ message: `${results.length} pages seeded successfully`, pages: results });
  } catch (error) {
    console.error('Pages seed error:', error);
    return NextResponse.json({ error: 'Failed to seed pages' }, { status: 500 });
  }
}
