import { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingForm } from './BookingForm';

export const metadata: Metadata = {
  title: 'Book Your Journey',
  description:
    'Book your private Turkey tour, airport transfer, or custom travel package. Easy online booking with instant confirmation.',
};

export default function BookingPage() {
  return (
    <main className="w-full py-6 sm:py-10 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      <Suspense fallback={<BookingFormSkeleton />}>
        <BookingForm />
      </Suspense>
    </main>
  );
}

function BookingFormSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 flex flex-col gap-8">
        <div className="h-20 skeleton rounded-xl" />
        <div className="h-64 skeleton rounded-xl" />
        <div className="h-64 skeleton rounded-xl" />
      </div>
      <div className="lg:col-span-4">
        <div className="h-96 skeleton rounded-xl" />
      </div>
    </div>
  );
}
