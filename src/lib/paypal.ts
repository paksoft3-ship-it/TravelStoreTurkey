// PayPal REST API v2 server helpers
// Works with both sandbox and live by checking PAYPAL_MODE env var

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * Generate a PayPal OAuth2 access token using client credentials.
 */
export async function generateAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[PAYMENT][PAYPAL][ERROR] PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET env var is not set');
    throw new Error('PayPal client ID or secret is not configured');
  }

  console.log(`[PAYMENT][PAYPAL] Fetching access token | mode=${process.env.PAYPAL_MODE || 'sandbox'}`);
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`[PAYMENT][PAYPAL][ERROR] Access token failed | status=${response.status} | body=${errorData}`);
    throw new Error(`Failed to get PayPal access token: ${errorData}`);
  }

  const data = await response.json();
  console.log('[PAYMENT][PAYPAL] Access token obtained');
  return data.access_token;
}

/**
 * Create a PayPal order. Amounts are already in EUR.
 * Returns the EUR amount alongside the order.
 */
export async function createOrder(
  amountEUR: number,
  description?: string
): Promise<{ id: string; status: string; amountEUR: string }> {
  const accessToken = await generateAccessToken();

  const amountEURStr = amountEUR.toFixed(2);
  console.log(`[PAYMENT][PAYPAL] Creating order | amountEUR=${amountEURStr}`);

  const requestBody = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'EUR',
          value: amountEURStr,
        },
        description: description || 'TravelStore Turkey Booking',
      },
    ],
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`[PAYMENT][PAYPAL][ERROR] Order creation failed | status=${response.status} | body=${JSON.stringify(errorData)}`);
    throw new Error(`PayPal API Error: ${errorData.message || JSON.stringify(errorData)}`);
  }

  const orderData = await response.json();
  console.log(`[PAYMENT][PAYPAL] Order created | orderId=${orderData.id} | status=${orderData.status}`);
  return { ...orderData, amountEUR: amountEURStr };
}

/**
 * Capture an approved PayPal order to collect payment.
 */
export async function captureOrder(
  orderId: string
): Promise<{ id: string; status: string; purchase_units: unknown[] }> {
  console.log(`[PAYMENT][PAYPAL] Capturing order | orderId=${orderId}`);
  const accessToken = await generateAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`[PAYMENT][PAYPAL][ERROR] Capture failed | orderId=${orderId} | status=${response.status} | body=${errorData}`);
    throw new Error(`Failed to capture PayPal order: ${errorData}`);
  }

  const result = await response.json();
  console.log(`[PAYMENT][PAYPAL] Capture response | orderId=${orderId} | status=${result.status}`);
  return result;
}
