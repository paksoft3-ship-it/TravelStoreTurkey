import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendMessageReply } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { subject, body: replyBody } = await request.json();

    if (!replyBody?.trim()) {
      return NextResponse.json({ error: 'Reply body is required' }, { status: 400 });
    }

    const message = await prisma.contactSubmission.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const replySubject = subject || `Re: ${message.subject}`;

    await sendMessageReply(
      message.email,
      replySubject,
      replyBody,
      message.message
    );

    // Mark as read
    await prisma.contactSubmission.update({ where: { id }, data: { read: true } });

    return NextResponse.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Message reply error:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
