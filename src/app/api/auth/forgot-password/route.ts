import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { rateLimit, getIp } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per IP per 15 minutes
  const ip = getIp(request);
  if (!rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (user) {
      // Invalidate old tokens for this email
      await prisma.passwordResetToken.updateMany({
        where: { email: email.toLowerCase(), used: false },
        data: { used: true },
      });

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          email: email.toLowerCase(),
          token,
          expiresAt,
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/admin/reset-password?token=${token}`;

      try {
        await sendPasswordResetEmail(email.toLowerCase(), resetUrl);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't fail the request — token is saved, user can retry
      }
    }

    return NextResponse.json({
      message: 'If that email is registered, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
