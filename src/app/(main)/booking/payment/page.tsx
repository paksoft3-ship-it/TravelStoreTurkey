'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Lock, ArrowLeft, ShieldCheck, Clock, Phone, Star, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const serviceLabels: Record<string, string> = {
  TAXI: 'City Taxi',
  AIRPORT_TRANSFER: 'Airport Transfer',
  PRIVATE_TOUR: 'Private Tour',
  CUSTOM_TOUR: 'Custom Tour',
  BLUE_LAGOON: 'Cappadocia Transfer',
  HOURLY_HIRE: 'Hourly Hire',
};

const serviceIcons: Record<string, string> = {
  TAXI: '🚖',
  AIRPORT_TRANSFER: '✈️',
  PRIVATE_TOUR: '🗺️',
  CUSTOM_TOUR: '🎯',
  BLUE_LAGOON: '♨️',
  HOURLY_HIRE: '⏱️',
};

// ── Stripe checkout form ──────────────────────────────────────────────────────

function StripeCheckoutForm({ bookingId }: { bookingId: string }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [error,     setError]     = useState<string | null>(null);
  const [isPaying,  setIsPaying]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsPaying(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Payment failed. Please try again.');
      setIsPaying(false);
      return;
    }

    const returnUrl = `${window.location.origin}/booking/confirmation?booking=${bookingId}&gateway=stripe`;

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setIsPaying(false);
    }
    // On success Stripe redirects to return_url — no need to handle here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isPaying}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold rounded-xl px-6 py-3.5 transition-colors"
      >
        {isPaying ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Processing payment…
          </>
        ) : (
          <>
            <Lock className="size-4" />
            Pay Securely with Card
          </>
        )}
      </button>
    </form>
  );
}

// ── PayPal wrapper ────────────────────────────────────────────────────────────

interface PayPalWrapperProps {
  isPaying: boolean;
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError: (err: unknown) => void;
  onCancel: () => void;
}

function PayPalButtonsWrapper({ isPaying, createOrder, onApprove, onError, onCancel }: PayPalWrapperProps) {
  const [sdkState] = usePayPalScriptReducer();
  const { isPending, isRejected } = sdkState;
  const sdkErrorMsg = (sdkState as unknown as Record<string, unknown>).loadingStatusErrorMessage as string | undefined;

  if (isRejected) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span className="font-semibold">Failed to load PayPal.</span>
        </div>
        {sdkErrorMsg && (
          <p className="text-xs text-red-500 font-mono bg-red-100 rounded px-2 py-1 break-all">{sdkErrorMsg}</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-[50px]">
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}
      <PayPalButtons
        style={{ layout: 'horizontal', color: 'blue', shape: 'rect', label: 'pay', height: 45, tagline: false }}
        disabled={isPaying || isPending}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
      />
    </div>
  );
}

// ── Main payment content ──────────────────────────────────────────────────────

function PaymentContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();

  const amount      = parseInt(searchParams.get('amount')  || '0');
  const bookingId   = searchParams.get('booking');
  const serviceType = searchParams.get('type') || '';

  const [clientSecret,     setClientSecret]     = useState<string | null>(null);
  const [secretError,      setSecretError]      = useState<string | null>(null);
  const [error,            setError]            = useState<string | null>(null);
  const [isPayPalPaying,   setIsPayPalPaying]   = useState(false);

  // Load Stripe client secret
  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}/client-secret`)
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setSecretError(data.error || 'Failed to load payment details.');
      })
      .catch(() => setSecretError('Failed to load payment details.'));
  }, [bookingId]);

  // PayPal handlers
  const createPayPalOrder = async () => {
    setError(null);
    const res  = await fetch('/api/paypal/create-order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ amount, description: `${serviceLabels[serviceType] || 'Booking'} - TravelStore Turkey` }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to initialize PayPal.'); throw new Error(data.error); }
    return data.orderID;
  };

  const onPayPalApprove = async (data: { orderID: string }) => {
    setIsPayPalPaying(true);
    setError(null);
    try {
      const res    = await fetch('/api/paypal/capture-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderID: data.orderID, bookingId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Payment capture failed');
      router.push(`/booking/confirmation?booking=${bookingId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setIsPayPalPaying(false);
    }
  };

  if (!bookingId || !amount) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Invalid Payment Link</h1>
          <p className="text-slate-500 mb-8">Booking details are missing. Please start a new booking.</p>
          <button
            onClick={() => router.push('/booking')}
            className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
          >
            Start New Booking
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm font-medium">Back to Booking</span>
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <ShieldCheck className="size-4" />
            Secure Payment
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Complete Your Payment</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Pay securely by card or PayPal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Payment panel ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Amount banner */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Amount Due</span>
                <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5">EUR</span>
              </div>
              <div className="flex items-end gap-3 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(amount)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Secure payment processed in EUR by card or PayPal.
              </p>
            </div>

            {/* Card payment via Stripe */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Pay by Card</p>
                  <div className="flex items-center gap-1.5">
                    {['Visa', 'Mastercard', 'Amex'].map((c) => (
                      <span key={c} className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!stripePromise ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    Card payment is not configured. Please contact support.
                  </div>
                ) : secretError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    {secretError}
                  </div>
                ) : !clientSecret ? (
                  <div className="flex items-center justify-center py-8 gap-3 text-slate-400">
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-sm">Loading payment form…</span>
                  </div>
                ) : (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: { colorPrimary: '#EAB308', borderRadius: '8px' },
                      },
                    }}
                  >
                    <StripeCheckoutForm bookingId={bookingId} />
                  </Elements>
                )}
              </div>
            </div>

            {/* PayPal */}
            {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-700">Or pay with PayPal</p>
                </div>
                <div className="p-6">
                  <PayPalScriptProvider
                    options={{
                      clientId:            process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                      currency:            'EUR',
                      intent:              'capture',
                      components:          'buttons',
                      locale:              'en_US',
                      'disable-funding':   'card,paylater,venmo,credit',
                    }}
                  >
                    <PayPalButtonsWrapper
                      isPaying={isPayPalPaying}
                      createOrder={createPayPalOrder}
                      onApprove={onPayPalApprove}
                      onError={() => setError('PayPal payment could not be processed. Please try again.')}
                      onCancel={() => setError('PayPal payment was cancelled.')}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            )}

            {/* Shared error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400 py-1">
              <span className="flex items-center gap-1.5"><Lock className="size-3.5" />256-bit SSL</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" />Secure checkout</span>
              <span className="flex items-center gap-1.5"><Phone className="size-3.5" />24/7 support</span>
            </div>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-secondary text-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <span className="text-3xl">{serviceIcons[serviceType] || '🚗'}</span>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Service</p>
                  <p className="font-bold">{serviceLabels[serviceType] || 'Booking'}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Total</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(amount)}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { icon: Clock,       text: 'Free cancellation up to 24h before' },
                  { icon: Phone,       text: 'Flight monitoring included'          },
                  { icon: Star,        text: 'Meet & greet at arrivals'            },
                  { icon: ShieldCheck, text: 'Instant booking confirmation'        },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <div className="size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <Icon className="size-3 text-green-400" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 text-center">
                <p className="text-xs text-slate-400">
                  Need help?{' '}
                  <a href="tel:+905301234567" className="text-primary hover:underline font-medium">
                    +90 530 123 45 67
                  </a>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function PaymentLoading() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="h-5 w-28 bg-slate-200 rounded animate-pulse mb-8" />
        <div className="h-10 w-64 bg-slate-200 rounded animate-pulse mx-auto mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl h-24 animate-pulse" />
            <div className="bg-white rounded-2xl h-80 animate-pulse" />
          </div>
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl h-80 animate-pulse" />
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}
