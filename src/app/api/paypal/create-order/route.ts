import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description } = body;

    if (!amount || amount <= 0) {
      console.error(`[PAYMENT][PAYPAL][ERROR] Invalid amount | amount=${amount}`);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    console.log(`[PAYMENT][PAYPAL] Creating order | amount=${amount} | description=${description}`);
    const order = await createOrder(amount, description);
    console.log(`[PAYMENT][PAYPAL] Order created | orderId=${order.id} | amountEUR=${order.amountEUR} | status=${order.status}`);

    return NextResponse.json({
      orderID: order.id,
      amountEUR: order.amountEUR,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[PAYMENT][PAYPAL][ERROR] Failed to create order | error=${msg}`);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
