import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Currencies that have no subunit — amounts are passed as-is to Stripe
// NOTE: EUR is a standard 2-decimal currency; Stripe expects amounts in cents (EUR × 100)
const ZERO_DECIMAL_CURRENCIES = new Set(['jpy', 'krw', 'vnd', 'bif', 'clp', 'gnf', 'mga', 'pyg', 'rwf', 'ugx', 'xaf', 'xof']);

function toStripeAmount(amount: number, currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase())
    ? Math.round(amount)
    : Math.round(amount * 100);
}

export async function createPaymentIntent(
  amount: number,
  currency: string = 'eur',
  metadata?: Record<string, string>
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: toStripeAmount(amount, currency),
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: metadata || {},
  });

  return paymentIntent;
}

export async function confirmPaymentIntent(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent;
}

export async function cancelPaymentIntent(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
  return paymentIntent;
}

export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  currency: string = 'eur'
) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? toStripeAmount(amount, currency) : undefined,
  });

  return refund;
}
