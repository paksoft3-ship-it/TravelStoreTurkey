'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Quote, ThumbsUp, MapPin, Calendar, ChevronLeft, ChevronRight, Filter, Award, Users, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample reviews data
const reviews = [
  {
    id: '1',
    name: 'Sarah Johnson',
    country: 'United States',
    flag: '🇺🇸',
    avatar: '',
    rating: 5,
    date: '2024-01-10',
    service: 'Cappadocia Tour',
    title: 'Absolutely incredible experience!',
    content: 'Our driver Jónas was fantastic! He knew all the best spots and even took us to a hidden waterfall that wasn\'t on the itinerary. The vehicle was spotless and comfortable. Highly recommend for anyone visiting Turkey!',
    helpful: 24,
    verified: true,
  },
  {
    id: '2',
    name: 'Marco Rossi',
    country: 'Italy',
    flag: '🇮🇹',
    avatar: '',
    rating: 5,
    date: '2024-01-08',
    service: 'Airport Transfer',
    title: 'Seamless airport pickup',
    content: 'After a long flight, it was such a relief to be greeted by a friendly driver with a sign. The Mercedes was luxurious and the WiFi allowed me to catch up on emails. Will definitely use again on my next trip.',
    helpful: 18,
    verified: true,
  },
  {
    id: '3',
    name: 'Emma Thompson',
    country: 'United Kingdom',
    flag: '🇬🇧',
    avatar: '',
    rating: 5,
    date: '2024-01-05',
    service: 'Hot Air Balloon Tour',
    title: 'We saw the lights!',
    content: 'Siggi knew exactly where to go. We drove for about an hour outside Istanbul and found a perfect spot with no light pollution. The Hot Air Balloon were magical! Hot chocolate and blankets made the wait cozy.',
    helpful: 32,
    verified: true,
  },
  {
    id: '4',
    name: 'Tanaka Hiroshi',
    country: 'Japan',
    flag: '🇯🇵',
    avatar: '',
    rating: 4,
    date: '2024-01-03',
    service: 'South Coast Tour',
    title: 'Great tour, amazing scenery',
    content: 'The South Coast is breathtaking. Our guide was very knowledgeable about the geography and history. Only giving 4 stars because we had to rush a bit at the last stop due to timing. Otherwise perfect!',
    helpful: 15,
    verified: true,
  },
  {
    id: '5',
    name: 'Anna Müller',
    country: 'Germany',
    flag: '🇩🇪',
    avatar: '',
    rating: 5,
    date: '2023-12-28',
    service: 'Cappadocia Transfer',
    title: 'Perfect timing and service',
    content: 'The driver waited for us after our spa session even though we took a bit longer than planned. Very professional and the car was super clean. Seamless experience from airport to lagoon to hotel.',
    helpful: 21,
    verified: true,
  },
  {
    id: '6',
    name: 'Pierre Dubois',
    country: 'France',
    flag: '🇫🇷',
    avatar: '',
    rating: 5,
    date: '2023-12-25',
    service: 'Custom Day Tour',
    title: 'Tailored to our wishes',
    content: 'We wanted to visit some off-the-beaten-path locations and TravelStore Turkey made it happen. Our driver suggested hidden hot springs and local restaurants. It felt like traveling with a friend rather than a tour company.',
    helpful: 28,
    verified: true,
  },
  {
    id: '7',
    name: 'Chen Wei',
    country: 'China',
    flag: '🇨🇳',
    avatar: '',
    rating: 5,
    date: '2023-12-20',
    service: 'Cappadocia Tour',
    title: 'Professional and punctual',
    content: 'Everything was arranged perfectly. The driver spoke excellent English and Chinese, which was a bonus. All the famous sites were covered plus some extra stops. Worth every penny!',
    helpful: 19,
    verified: true,
  },
  {
    id: '8',
    name: 'Sofia Garcia',
    country: 'Spain',
    flag: '🇪🇸',
    avatar: '',
    rating: 5,
    date: '2023-12-15',
    service: 'Airport Transfer',
    title: 'Best airport service',
    content: 'Our flight was delayed by 2 hours but the driver tracked it and was there right when we landed. No extra charge! The ride to Istanbul was comfortable and the driver gave us great tips for our stay.',
    helpful: 26,
    verified: true,
  },
];

const stats = [
  { icon: Star, value: '4.9', label: 'Average Rating', color: 'text-primary' },
  { icon: Users, value: '2,500+', label: 'Happy Customers', color: 'text-blue-500' },
  { icon: ThumbsUp, value: '98%', label: 'Recommend Us', color: 'text-green-500' },
  { icon: Award, value: '50+', label: '5-Star Reviews', color: 'text-purple-500' },
];

const services = ['All Services', 'Airport Transfer', 'Cappadocia Tour', 'Hot Air Balloon Tour', 'South Coast Tour', 'Cappadocia Transfer', 'Custom Day Tour'];

export default function ReviewsPage() {
  const [selectedService, setSelectedService] = useState('All Services');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');

  const filteredReviews = reviews
    .filter((review) => selectedService === 'All Services' || review.service === selectedService)
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'helpful') return b.helpful - a.helpful;
      return 0;
    });

  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-secondary text-white py-10 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-1 mb-4 sm:mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="size-6 sm:size-8 text-primary fill-primary" />
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              What Our <span className="text-primary">Customers Say</span>
            </h1>
            <p className="text-lg text-slate-300">
              Real reviews from real travelers. See why thousands choose TravelStore Turkey for their Turkey adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4 justify-center md:justify-start">
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                  <stat.icon className={cn('size-6', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Service Filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => setSelectedService(service)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    selectedService === service
                      ? 'bg-primary text-black'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                  )}
                >
                  {service}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'highest' | 'helpful')}
                className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Review */}
      <section className="py-12 px-4 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-5 sm:p-8 md:p-12 mb-8 sm:mb-12 relative overflow-hidden">
            <Quote className="absolute top-4 right-4 size-24 text-primary/20" />
            <div className="relative z-10">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="size-5 text-primary fill-primary" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white mb-6 leading-relaxed">
                "TravelStore Turkey made our Turkey trip absolutely unforgettable. From the moment we landed to our last day, every transfer and tour was flawless. The drivers are knowledgeable, friendly, and genuinely care about giving you the best experience possible."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-2xl">
                  🇺🇸
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">The Anderson Family</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">California, USA - December 2023</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl">
                      {review.flag}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{review.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{review.country}</p>
                    </div>
                  </div>
                  {review.verified && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                      Verified
                    </span>
                  )}
                </div>

                {/* Rating & Service */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'size-4',
                          star <= review.rating
                            ? 'text-primary fill-primary'
                            : 'text-slate-300 dark:text-slate-600'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                    {review.service}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{review.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-4">
                  {review.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="size-3" />
                    {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                    <ThumbsUp className="size-3" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {filteredReviews.length > 0 && (
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                Load More Reviews
              </button>
            </div>
          )}

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <Star className="size-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No reviews for this service yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Be the first to leave a review!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Write Review CTA */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="size-12 text-black/20 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-black text-black mb-4">
            Traveled With Us? Share Your Experience!
          </h2>
          <p className="text-slate-800 mb-8">
            Your feedback helps other travelers make informed decisions and helps us improve our service.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact?type=review"
              className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Write a Review
            </Link>
            <Link
              href="/booking"
              className="px-8 py-3 bg-white/30 text-black font-bold rounded-xl hover:bg-white/50 transition-colors"
            >
              Book Your Trip
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trusted & Verified</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">We're proud to be recognized by</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="text-center">
              <div className="text-3xl font-black text-slate-400">TripAdvisor</div>
              <div className="text-xs text-slate-400">Certificate of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-400">Google</div>
              <div className="text-xs text-slate-400">4.9 Star Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-400">Viator</div>
              <div className="text-xs text-slate-400">Top Rated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-400">GetYourGuide</div>
              <div className="text-xs text-slate-400">Traveler's Choice</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
