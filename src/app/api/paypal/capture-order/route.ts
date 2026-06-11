import { NextRequest, NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal';
import prisma from '@/lib/db';
import {
  sendBookingConfirmation,
  sendAdminBookingNotification,
  sendPaymentConfirmation,
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderID, bookingId } = body;

    if (!orderID || !bookingId) {
      console.error(`[PAYMENT][PAYPAL][ERROR] Missing params | orderID=${orderID} | bookingId=${bookingId}`);
      return NextResponse.json(
        { error: 'Missing orderID or bookingId' },
        { status: 400 }
      );
    }

    console.log(`[PAYMENT][PAYPAL] Capturing order | orderId=${orderID} | bookingId=${bookingId}`);
    const captureData = await captureOrder(orderID);
    console.log(`[PAYMENT][PAYPAL] Capture result | orderId=${orderID} | status=${captureData.status}`);

    if (captureData.status !== 'COMPLETED') {
      console.error(`[PAYMENT][PAYPAL][ERROR] Payment not completed | orderId=${orderID} | status=${captureData.status}`);
      return NextResponse.json(
        { error: 'Payment not completed', status: captureData.status },
        { status: 400 }
      );
    }

    // Update booking — retry up to 3x with backoff to handle Neon cold-start.
    // CRITICAL: PayPal payment is already captured — must succeed or customer is charged but booking stays PENDING.
    let updatedBooking = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[PAYMENT][PAYPAL][DB] Updating booking to PAID | bookingId=${bookingId} | attempt=${attempt}`);
        updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            paymentIntentId: orderID,
            paidAt: new Date(),
          },
          include: { tour: { select: { name: true } } },
        });
        console.log(`[PAYMENT][PAYPAL][DB] Booking marked PAID | bookingId=${bookingId} | bookingNumber=${updatedBooking.bookingNumber}`);
        break;
      } catch (dbErr: unknown) {
        const code = (dbErr as Record<string, unknown>)?.code;
        const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
        if (attempt === 3) {
          console.error(`[PAYMENT][PAYPAL][DB][ERROR] CRITICAL — PayPal captured but DB update failed after 3 attempts | bookingId=${bookingId} | orderId=${orderID} | error=${msg}`);
          throw dbErr;
        }
        console.warn(`[PAYMENT][PAYPAL][DB] DB update attempt ${attempt} failed, retrying | code=${code} | error=${msg}`);
        await new Promise((r) => setTimeout(r, attempt * 2000));
      }
    }

    const booking = updatedBooking ?? await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tour: { select: { name: true } } },
    });

    if (booking) {
      console.log(`[PAYMENT][PAYPAL] Sending payment emails | bookingId=${bookingId} | email=${booking.customerEmail}`);
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
    }

    return NextResponse.json({
      success: true,
      captureId: captureData.id,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[PAYMENT][PAYPAL][ERROR] Capture failed | error=${msg}`);
    return NextResponse.json(
      { error: 'Failed to capture payment' },
      { status: 500 }
    );
  }
}
