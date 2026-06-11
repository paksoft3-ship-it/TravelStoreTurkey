import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, MapPin, Check, ArrowRight, Star, Shield, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getPackageBySlug, getPackageSlugs, type TravelPackage } from '@/data/packages';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getTour(slug: string): Promise<TravelPackage | null> {
  // Tour content is served from the static Turkey packages.
  return getPackageBySlug(slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTour(slug);

  if (!tour) return { title: 'Package Not Found' };

  return {
    title: tour.name,
    description: tour.shortDescription,
  };
}

export async function generateStaticParams() {
  return getPackageSlugs().map((slug) => ({ slug }));
}

export default async function TourPage({ params }: Props) {
  const { slug } = await params;
  const tour = await getTour(slug);

  if (!tour) notFound();

  const mainImage = tour.images?.[0] || '';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px]">
        {mainImage ? (
          <Image src={mainImage} alt={tour.name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-slate-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 pb-8 sm:pb-12 lg:pb-20">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
                {tour.name}
              </h1>
              <p className="text-lg md:text-xl text-slate-200">
                {tour.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <Clock className="size-4" />
                  Duration
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{tour.duration}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <MapPin className="size-4" />
                  Type
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {tour.category.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <Star className="size-4" />
                  Rating
                </span>
                <span className="font-bold text-slate-900 dark:text-white">5.0 (Excellent)</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <Shield className="size-4" />
                  Vehicle
                </span>
                <span className="font-bold text-slate-900 dark:text-white">Private Luxury</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About this tour</h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {tour.description}
              </div>
            </div>

            {/* Highlights */}
            {tour.highlights.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-3 p-4 bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700 rounded-xl">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="size-4 text-primary" />
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-day Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Day-by-Day Itinerary</h2>
                <div className="space-y-4">
                  {tour.itinerary.map((day, idx) => (
                    <div key={day.day} className="relative flex gap-4">
                      {/* Timeline marker */}
                      <div className="flex flex-col items-center">
                        <div className="size-10 shrink-0 rounded-full bg-terracotta text-white font-bold flex items-center justify-center shadow-md shadow-terracotta/20">
                          {day.day}
                        </div>
                        {idx < tour.itinerary.length - 1 && (
                          <div className="w-0.5 flex-1 bg-borderSoft my-1" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1">
                          Day {day.day}
                        </p>
                        <h3 className="text-lg font-bold text-navy dark:text-white mb-1">
                          {day.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                {(tour.includes.length > 0
                  ? tour.includes
                  : [
                      'Private luxury vehicle',
                      'Professional driver-guide',
                      'WiFi on board',
                      'Bottled water',
                      'Hotel pickup & drop-off',
                      'All taxes and fees',
                    ]
                ).map((item) => (
                  <div key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Check className="size-4 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Included */}
            {tour.excluded && tour.excluded.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Not Included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                  {tour.excluded.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="text-terracotta font-bold shrink-0">✕</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {tour.images && tour.images.length > 1 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tour.images.slice(1).map((img, i) => (
                    <div key={img} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-borderSoft">
                      <Image
                        src={img}
                        alt={`${tour.name} photo ${i + 2}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 space-y-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Starting from</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">
                    {formatCurrency(tour.price, tour.currency)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">per person</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Private tour · price based on 2 travellers sharing
                </p>
              </div>

              <div className="space-y-4">
                <Link
                  href={`/booking?type=PRIVATE_TOUR&from=service&tourId=${tour.id}&tourName=${encodeURIComponent(tour.name)}&tourPrice=${tour.price}&tourLargeGroupPrice=${tour.largeGroupPrice ?? 0}`}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-primary/20"
                >
                  Book Now
                  <ArrowRight className="size-5" />
                </Link>
                <Link
                  href="/contact?subject=Custom Tour Inquiry"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                >
                  Customize Tour
                </Link>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Shield className="size-5 text-primary" />
                  <span>Free cancellation up to 24h</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="size-5 text-primary" />
                  <span>Instant booking confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
