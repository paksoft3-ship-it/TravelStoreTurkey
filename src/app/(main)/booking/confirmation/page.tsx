'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Phone,
  Mail,
  Download,
  Home,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';


interface BookingDetails {
  id: string;
  bookingNumber: string;
  type: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  passengers: number;
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: string;
  pickupTime: string;
  totalPrice: number;
  currency: string;
  paymentStatus: string;
  specialRequests?: string;
  tour?: {
    name: string;
  };
}

function getBookingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    TAXI: 'Taxi Service',
    AIRPORT_TRANSFER: 'Airport Transfer',
    PRIVATE_TOUR: 'Private Tour',
    CUSTOM_TOUR: 'Custom Tour',
  };
  return labels[type] || type;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  const paymentIntent = searchParams.get('payment_intent');

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setError('Booking ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }
        const data = await response.json();
        setBooking(data);
      } catch (err) {
        setError('Could not load booking details');
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Booking Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {error || 'We could not find your booking details.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
          >
            <Home className="size-5" />
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="size-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="size-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Thank you for your booking. A confirmation email has been sent to{' '}
            <span className="font-medium text-slate-900 dark:text-white">
              {booking.customerEmail}
            </span>
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-yellow-400 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Booking Number</p>
                <p className="text-2xl font-black text-slate-900">{booking.bookingNumber}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/30 text-slate-900">
                  {booking.type === 'TAXI' ? 'Pay in Car' : (booking.paymentStatus === 'PAID' ? 'Paid' : booking.paymentStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Service Type */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {getBookingTypeLabel(booking.type)}
              </h3>
              {booking.tour && (
                <p className="text-primary font-medium">{booking.tour.name}</p>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <Calendar className="size-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {formatDate(booking.pickupDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <Clock className="size-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pickup Time</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {booking.pickupTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <MapPin className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pickup Location</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {booking.pickupLocation}
                  </p>
                </div>
              </div>
              {booking.dropoffLocation && (
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <MapPin className="size-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Drop-off Location</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {booking.dropoffLocation}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Passengers */}
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <Users className="size-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Passengers</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {booking.passengers} {booking.passengers === 1 ? 'person' : 'people'}
                </p>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">
                  Special Requests
                </p>
                <p className="text-amber-700 dark:text-amber-300">{booking.specialRequests}</p>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-slate-600 dark:text-slate-400">
                  {booking.type === 'TAXI' ? 'Fare' : 'Total Paid'}
                </span>
                <span className="text-2xl font-black text-green-600 dark:text-green-400">
                  {booking.type === 'TAXI' ? 'Metered' : formatCurrency(booking.totalPrice, booking.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
            What's Next?
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <p className="text-blue-800 dark:text-blue-200">
                Check your email for the confirmation and detailed booking information.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <p className="text-blue-800 dark:text-blue-200">
                Your driver will arrive at the pickup location at the scheduled time.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <p className="text-blue-800 dark:text-blue-200">
                Look for a vehicle with "TravelStore Turkey" signage.
              </p>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Need Help?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="tel:+905301234567"
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <Phone className="size-5 text-primary" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Call us</p>
                <p className="font-medium text-slate-900 dark:text-white">+90 530 123 45 67</p>
              </div>
            </a>
            <a
              href="mailto:booking@travelstoreturkey.com"
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <Mail className="size-5 text-primary" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Email us</p>
                <p className="font-medium text-slate-900 dark:text-white">booking@travelstoreturkey.com</p>
              </div>
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Home className="size-5" />
            Return Home
          </Link>
          <Link
            href="/tours"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
          >
            Explore More Tours
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
