import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { createPaymentIntent } from '@/lib/stripe';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[PAYMENT][STRIPE] Client-secret requested | bookingId=${id}`);

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id:              true,
        bookingNumber:   true,
        customerEmail:   true,
        totalPrice:      true,
        currency:        true,
        paymentIntentId: true,
        paymentStatus:   true,
      },
    });

    if (!booking) {
      console.error(`[PAYMENT][STRIPE][ERROR] Booking not found | bookingId=${id}`);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    console.log(`[PAYMENT][STRIPE] Booking found | bookingId=${id} | amount=${booking.totalPrice} EUR | paymentStatus=${booking.paymentStatus} | hasIntent=${!!booking.paymentIntentId}`);

    if (booking.paymentStatus === 'PAID') {
      console.warn(`[PAYMENT][STRIPE] Booking already paid | bookingId=${id}`);
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    // If no intent yet (e.g. Stripe key wasn't configured at booking time), create one now
    let intentId = booking.paymentIntentId;
    if (!intentId) {
      if (booking.totalPrice <= 0) {
        console.error(`[PAYMENT][STRIPE][ERROR] Cannot create intent — totalPrice is ${booking.totalPrice} | bookingId=${id}`);
        return NextResponse.json(
          { error: `Invalid booking amount (${booking.totalPrice} EUR). Please contact support.` },
          { status: 400 }
        );
      }
      console.log(`[PAYMENT][STRIPE] No intent found — creating lazily | bookingId=${id} | amountISK=${booking.totalPrice} | stripeAmount=${booking.totalPrice * 100}`);
      const intent = await createPaymentIntent(booking.totalPrice, booking.currency, {
        bookingId:     booking.id,
        bookingNumber: booking.bookingNumber,
        customerEmail: booking.customerEmail,
      });
      intentId = intent.id;
      await prisma.booking.update({
        where: { id: booking.id },
        data:  { paymentIntentId: intentId },
      });
      console.log(`[PAYMENT][STRIPE] Intent created lazily | intentId=${intentId} | bookingId=${id}`);
    }

    let paymentIntent = await stripe.paymentIntents.retrieve(intentId);
    console.log(`[PAYMENT][STRIPE] Intent retrieved | intentId=${intentId} | status=${paymentIntent.status} | stripeAmount=${paymentIntent.amount} | expectedAmount=${booking.totalPrice * 100}`);

    // Correct any intent created with wrong amount (amounts are stored in EUR).
    // Stripe expects EUR in cents (EUR × 100). If the stored amount is off by 100×, update it.
    const expectedAmount = Math.round(booking.totalPrice * 100);
    if (
      paymentIntent.status === 'requires_payment_method' &&
      paymentIntent.amount !== expectedAmount
    ) {
      console.warn(`[PAYMENT][STRIPE] Correcting intent amount | intentId=${intentId} | was=${paymentIntent.amount} | correctedTo=${expectedAmount} | bookingId=${id}`);
      paymentIntent = await stripe.paymentIntents.update(intentId, { amount: expectedAmount });
      console.log(`[PAYMENT][STRIPE] Intent amount corrected | intentId=${intentId} | newAmount=${paymentIntent.amount}`);
    }

    console.log(`[PAYMENT][STRIPE] Returning client_secret | intentId=${intentId} | bookingId=${id}`);
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[PAYMENT][STRIPE][ERROR] client-secret fetch failed | error=${msg}`);

    // Give a clear message when Stripe is not configured
    if (msg.includes('Invalid API Key') || msg.includes('sk_test_mock')) {
      return NextResponse.json(
        { error: 'Payment is not configured yet. Please contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Failed to retrieve payment details' }, { status: 500 });
  }
}
