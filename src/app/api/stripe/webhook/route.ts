import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/db';
import {
  sendBookingConfirmation,
  sendAdminBookingNotification,
  sendPaymentConfirmation,
} from '@/lib/email';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  console.log(`[PAYMENT][WEBHOOK] Received webhook | hasSignature=${!!signature}`);

  if (!signature) {
    console.error('[PAYMENT][WEBHOOK][ERROR] Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log(`[PAYMENT][WEBHOOK] Signature verified | eventType=${event.type} | eventId=${event.id}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[PAYMENT][WEBHOOK][ERROR] Signature verification failed | error=${msg}`);
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('[PAYMENT][WEBHOOK][ERROR] STRIPE_WEBHOOK_SECRET env var is not set!');
    }
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`[PAYMENT][WEBHOOK] payment_intent.succeeded | intentId=${paymentIntent.id} | amount=${paymentIntent.amount} | currency=${paymentIntent.currency} | metadata=${JSON.stringify(paymentIntent.metadata)}`);

      const updateResult = await prisma.booking.updateMany({
        where: { paymentIntentId: paymentIntent.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paidAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        console.error(`[PAYMENT][WEBHOOK][ERROR] No booking found for intentId=${paymentIntent.id} — booking NOT marked as paid!`);
      } else {
        console.log(`[PAYMENT][WEBHOOK][DB] Booking marked PAID | intentId=${paymentIntent.id} | rowsUpdated=${updateResult.count}`);
      }

      const booking = await prisma.booking.findFirst({
        where: { paymentIntentId: paymentIntent.id },
        include: { tour: { select: { name: true } } },
      });

      if (booking) {
        console.log(`[PAYMENT][WEBHOOK] Sending payment emails | bookingId=${booking.id} | bookingNumber=${booking.bookingNumber} | email=${booking.customerEmail}`);
        const emailData = {
          bookingNumber:   booking.bookingNumber,
          customerName:    booking.customerName,
          customerEmail:   booking.customerEmail,
          customerPhone:   booking.customerPhone,
          type:            booking.type,
          pickupDate:      booking.pickupDate,
          pickupTime:      booking.pickupTime,
          pickupLocation:  booking.pickupLocation,
          dropoffLocation: booking.dropoffLocation || undefined,
          passengers:      booking.passengers,
          totalPrice:      booking.totalPrice,
          currency:        booking.currency,
          specialRequests: booking.specialRequests || undefined,
          tourName:        booking.tour?.name,
        };

        Promise.all([
          sendBookingConfirmation(emailData).catch((err) => console.error(`[PAYMENT][EMAIL][ERROR] Booking confirmation to ${booking.customerEmail} failed:`, err)),
          sendPaymentConfirmation(emailData).catch((err) => console.error(`[PAYMENT][EMAIL][ERROR] Payment receipt to ${booking.customerEmail} failed:`, err)),
          sendAdminBookingNotification(emailData).catch((err) => console.error('[PAYMENT][EMAIL][ERROR] Admin notification failed:', err)),
        ]);
      } else {
        console.error(`[PAYMENT][WEBHOOK][ERROR] Booking not found after DB update — emails NOT sent | intentId=${paymentIntent.id}`);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const failureMsg = paymentIntent.last_payment_error?.message || 'unknown';
      const failureCode = paymentIntent.last_payment_error?.code || 'unknown';
      console.error(`[PAYMENT][WEBHOOK] payment_intent.payment_failed | intentId=${paymentIntent.id} | code=${failureCode} | message=${failureMsg}`);

      const updateResult = await prisma.booking.updateMany({
        where: { paymentIntentId: paymentIntent.id },
        data: { paymentStatus: 'FAILED' },
      });
      console.log(`[PAYMENT][WEBHOOK][DB] Booking marked FAILED | intentId=${paymentIntent.id} | rowsUpdated=${updateResult.count}`);
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      console.log(`[PAYMENT][WEBHOOK] charge.refunded | chargeId=${charge.id} | intentId=${charge.payment_intent}`);

      if (charge.payment_intent) {
        const updateResult = await prisma.booking.updateMany({
          where: { paymentIntentId: charge.payment_intent as string },
          data: { paymentStatus: 'REFUNDED' },
        });
        console.log(`[PAYMENT][WEBHOOK][DB] Booking marked REFUNDED | intentId=${charge.payment_intent} | rowsUpdated=${updateResult.count}`);
      }
      break;
    }

    default:
      console.log(`[PAYMENT][WEBHOOK] Unhandled event type: ${event.type} | eventId=${event.id}`);
  }

  return NextResponse.json({ received: true });
}
