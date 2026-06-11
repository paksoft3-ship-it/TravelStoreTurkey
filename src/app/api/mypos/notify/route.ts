import { NextRequest, NextResponse } from 'next/server';
import { verifyMyPOSSignature } from '@/lib/mypos';
import { prisma } from '@/lib/db';

// myPOS requires HTTP 200 + "OK" body — any other response triggers a retry for up to 3 days
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => { body[key] = String(value); });

    // Always verify the signature before processing
    if (!verifyMyPOSSignature(body)) {
      console.error('myPOS notify: invalid signature', body);
      // Still return 200 OK so myPOS stops retrying — but don't update DB
      return new NextResponse('OK', { status: 200 });
    }

    const ipcMethod = body['IPCmethod'];   // IPCPurchaseNotify
    const orderID   = body['OrderID'];     // format: PT-{bookingId}-{timestamp}
    const trnRef    = body['IPC_Trnref']; // myPOS transaction reference (present on success)

    if (ipcMethod !== 'IPCPurchaseNotify') {
      return new NextResponse('OK', { status: 200 });
    }

    // Payment is successful when IPCPurchaseNotify is received with valid signature + trnRef
    const bookingId = orderID?.split('-')[1];

    if (bookingId && trnRef) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status:        'CONFIRMED',
          paymentStatus: 'PAID',
          paidAt:        new Date(),
          paymentIntentId: trnRef,
        },
      });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('myPOS notify error:', err);
    // Return 200 to prevent infinite retries — log the error instead
    return new NextResponse('OK', { status: 200 });
  }
}
