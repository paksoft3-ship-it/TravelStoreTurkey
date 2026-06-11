import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Star, Sparkles, Car } from 'lucide-react';
import { formatCurrency, TOUR_CATEGORIES } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { TourCategory } from '@/types';

interface TourCardProps {
  id: string;
  name: string;
  slug: string;
  category: TourCategory;
  duration: string;
  shortDescription: string;
  price: number;
  currency: string;
  image: string;
  badge?: {
    text: string;
    type: 'popular' | 'seasonal' | 'transfer';
  };
  highlights: string[];
  variant?: 'default' | 'featured';
  distance?: string;
}

export function TourCard({
  name,
  slug,
  category,
  duration,
  shortDescription,
  price,
  currency,
  image,
  badge,
  highlights,
  distance,
  variant = 'default',
}: TourCardProps) {
  if (variant === 'featured') {
    return (
      <Link
        href={`/tours/${slug}`}
        className="group rounded-xl overflow-hidden relative aspect-[4/5] cursor-pointer"
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {badge && (
            <div className="bg-primary text-slate-900 text-xs font-bold px-2 py-1 rounded w-fit mb-2">
              {badge.text}
            </div>
          )}
          <h3 className="text-white text-xl font-bold mb-1">{name}</h3>
          <p className="text-slate-300 text-sm mb-4">{shortDescription}</p>
          <div className="flex items-center justify-between">
            <span className="text-white font-bold">
              Fr. {formatCurrency(price, currency)}
            </span>
            <div className="size-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-slate-900 transition-colors text-white">
              <ArrowRight className="size-4" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/tours/${slug}`}
      className="flex flex-col rounded-xl bg-white dark:bg-[#1e1e1e] shadow-card hover:shadow-card-hover transition-all duration-300 group overflow-hidden border border-slate-100 dark:border-slate-800"
    >
      <div className="relative h-60 overflow-hidden">
        {badge && (
          <div
            className={cn(
              'absolute top-3 left-3 z-10 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1',
              badge.type === 'popular' && 'bg-white/90 text-secondary',
              badge.type === 'seasonal' && 'bg-secondary/90 text-white',
              badge.type === 'transfer' && 'bg-white/90 text-secondary'
            )}
          >
            {badge.type === 'popular' && <Star className="size-3 text-primary" />}
            {badge.type === 'seasonal' && <Sparkles className="size-3 text-primary" />}
            {badge.type === 'transfer' && <Car className="size-3 text-primary" />}
            {badge.text}
          </div>
        )}
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <p className="text-primary text-xs font-semibold uppercase tracking-wide">
            {TOUR_CATEGORIES[category]}
          </p>
          <div className="flex items-center text-slate-500 text-xs gap-1">
            <Clock className="size-3.5" />
            {duration}
          </div>
          {distance && (
            <div className="flex items-center text-slate-500 text-xs gap-1">
              <span className="text-primary font-bold">km</span>
              {distance}
            </div>
          )}
        </div>
        <h3 className="text-secondary dark:text-white text-xl font-bold mb-3 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <ul className="space-y-2 mb-6 flex-1">
          {highlights.slice(0, 3).map((highlight, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
            >
              <span className="text-primary mt-0.5">✓</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Starting from</span>
            <span className="text-lg font-bold text-secondary dark:text-white">
              {formatCurrency(price, currency)}
            </span>
          </div>
          <span className="bg-primary hover:bg-primary-dark text-slate-900 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
            Book Tour
          </span>
        </div>
      </div>
    </Link>
  );
}
