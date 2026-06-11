import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Plane, ShieldCheck, Clock, Star } from 'lucide-react';
import { TourCard } from '@/components/TourCard';
import { BookingWidget } from '@/components/BookingWidget';
import { packages, getPackageOptions } from '@/data/packages';
import type { TourCategory } from '@/types';

export default function HomePage() {
  // Demo: drive the homepage from static Turkey packages (no database needed).
  const recentPackages = packages.filter((p) => p.active).slice(0, 1);
  const packageOptions = getPackageOptions();

  return (
    <>
      {/* ===== Hero ===== */}
      <header className="relative w-full min-h-[560px] lg:min-h-[640px] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/turkey_hero.jpg"
            alt="The Blue Mosque at sunset in Istanbul, Turkey"
            fill
            className="object-cover"
            priority
          />
          {/* Warm cream gradient from the left for editorial text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/85 to-cream/10 md:to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl py-16">
            <p className="flex items-center gap-3 text-terracotta font-semibold tracking-wide uppercase text-sm mb-4">
              <span className="h-px w-8 bg-gold" />
              Explore the Beauty of
            </p>
            <h1 className="font-display text-navy text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
              <span className="text-terracotta">Turkey</span> with Local Experts
            </h1>
            <p className="text-textMain/80 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
              Book 3–4 day tours, airport transfers, taxi pickups and custom travel
              experiences across Turkey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/tours"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-terracotta hover:bg-terracotta-dark text-white font-semibold rounded-lg shadow-lg shadow-terracotta/20 transition-colors"
              >
                Explore Packages
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/booking?type=AIRPORT_TRANSFER&from=hero"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white font-semibold rounded-lg transition-colors"
              >
                <Plane className="size-4" />
                Book Airport Transfer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Booking / package search widget (overlaps hero) ===== */}
      <BookingWidget packages={packageOptions} />

      {/* ===== Trust strip ===== */}
      <section className="bg-white border-b border-borderSoft">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap justify-center gap-x-10 gap-y-3 items-center text-textMuted">
          <div className="flex items-center gap-2">
            <Star className="size-5 text-gold fill-gold" />
            <span className="font-bold text-navy">4.9/5</span>
            <span className="text-sm">Guest rating</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-terracotta" />
            <span className="font-bold text-navy">Licensed</span>
            <span className="text-sm">local travel agency</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-terracotta" />
            <span className="font-bold text-navy">24/7</span>
            <span className="text-sm">WhatsApp support</span>
          </div>
        </div>
      </section>

      {/* ===== Recently Added Packages (En Son Eklenen İlanlar) ===== */}
      <section className="py-14 sm:py-20 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="flex items-center justify-center gap-3 text-terracotta font-semibold uppercase tracking-wide text-sm mb-3">
              <span className="h-px w-8 bg-gold" />
              En Son Eklenen İlanlar
              <span className="h-px w-8 bg-gold" />
            </p>
            <h2 className="font-display text-navy text-3xl sm:text-4xl font-bold">
              Recently Added Packages
            </h2>
            <p className="text-textMuted max-w-xl mx-auto mt-3">
              Our newest curated Turkey experience, ready to book.
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            {recentPackages.map((pkg) => (
              <TourCard
                key={pkg.id}
                id={pkg.id}
                name={pkg.name}
                slug={pkg.slug}
                category={pkg.category as TourCategory}
                duration={pkg.duration}
                shortDescription={pkg.shortDescription}
                price={pkg.price}
                currency={pkg.currency}
                image={pkg.images[0]}
                highlights={pkg.highlights}
                badge={pkg.badge}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-navy/15 text-navy font-semibold rounded-lg hover:border-terracotta hover:text-terracotta transition-colors"
            >
              View All Packages
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA banner ===== */}
      <section className="py-14 sm:py-20 px-4 bg-cream">
        <div className="max-w-7xl mx-auto bg-navy rounded-3xl p-8 md:p-14 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="font-display text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                Ready to Explore Turkey?
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-lg">
                Plan your private tour, transfer or custom package with our local
                experts — secure booking and instant confirmation.
              </p>
            </div>
            <Link
              href="/tours"
              className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-terracotta hover:bg-terracotta-dark text-white font-semibold rounded-xl shadow-lg transition-colors"
            >
              Explore Packages
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
