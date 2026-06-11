import { NextRequest, NextResponse } from 'next/server';
import { buildMyPOSParams, signMyPOSParams, MYPOS_CHECKOUT_URL } from '@/lib/mypos';

export async function POST(req: NextRequest) {
  try {
    const { amount, bookingId, description, customerEmail, customerFirstName, customerLastName } =
      await req.json();

    if (!process.env.MYPOS_CONFIG_PACK) {
      return NextResponse.json(
        { error: 'myPOS is not configured on this server.' },
        { status: 500 }
      );
    }

    if (!amount || !bookingId) {
      return NextResponse.json(
        { error: 'Missing amount or bookingId.' },
        { status: 400 }
      );
    }

    const appUrl    = process.env.NEXT_PUBLIC_APP_URL!;
    const amountEUR = (amount / 150).toFixed(2);
    const orderId   = `PT-${bookingId}-${Date.now()}`;

    const params = buildMyPOSParams({
      amount:            amountEUR,
      currency:          'EUR',
      orderId,
      urlOk:             `${appUrl}/booking/confirmation?booking=${bookingId}&gateway=mypos`,
      urlCancel:         `${appUrl}/booking/payment?booking=${bookingId}&amount=${amount}&cancelled=1`,
      urlNotify:         `${appUrl}/api/mypos/notify`,
      customerEmail,
      customerFirstName,
      customerLastName,
    });

    // === DIAGNOSTIC LOGGING — remove once signature issue is resolved ===
    const { getMyPOSConfig } = await import('@/lib/mypos');
    const diagCfg = getMyPOSConfig();
    const diagValues = Object.values(params);
    const diagJoined = diagValues.join('-');
    const diagB64 = Buffer.from(diagJoined).toString('base64');
    console.log('[myPOS DIAG] Checkout URL:', MYPOS_CHECKOUT_URL);
    console.log('[myPOS DIAG] MYPOS_MODE env:', process.env.MYPOS_MODE || '(not set — using TEST endpoint)');
    console.log('[myPOS DIAG] KeyIndex sent:', params.KeyIndex);
    console.log('[myPOS DIAG] SID:', params.SID);
    console.log('[myPOS DIAG] WalletNumber:', params.WalletNumber);
    console.log('[myPOS DIAG] cfg.idx:', diagCfg.idx);
    console.log('[myPOS DIAG] Private key length (chars):', diagCfg.pk.length);
    console.log('[myPOS DIAG] Private key has \\r (CRLF):', diagCfg.pk.includes('\r'));
    console.log('[myPOS DIAG] Private key first 60 chars:', diagCfg.pk.slice(0, 60));
    console.log('[myPOS DIAG] Private key last 30 chars:', diagCfg.pk.slice(-30));
    console.log('[myPOS DIAG] Param count:', diagValues.length);
    console.log('[myPOS DIAG] Param values (truncated):', diagValues.map(v => v.slice(0, 40)));
    console.log('[myPOS DIAG] Full URL_OK:', params.URL_OK);
    console.log('[myPOS DIAG] Full URL_Cancel:', params.URL_Cancel);
    console.log('[myPOS DIAG] Full URL_Notify:', params.URL_Notify);
    console.log('[myPOS DIAG] Joined string (first 120 chars):', diagJoined.slice(0, 120));
    console.log('[myPOS DIAG] Base64 of joined (first 80 chars):', diagB64.slice(0, 80));
    // === END DIAGNOSTIC LOGGING ===

    const signature = signMyPOSParams(params);

    return NextResponse.json({
      checkoutUrl: MYPOS_CHECKOUT_URL,
      params: { ...params, Signature: signature },
    });
  } catch (err: any) {
    console.error('myPOS create-payment error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
