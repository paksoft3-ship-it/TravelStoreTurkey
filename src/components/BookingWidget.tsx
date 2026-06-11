'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Flag, Calendar, CarTaxiFront,
  Mountain, ArrowRight, Plane, Users, Hash,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { trackBookingStarted } from '@/lib/analytics';
import { PlaceAutocomplete } from '@/components/PlaceAutocomplete';

export interface PackageOption {
  id: string;
  name: string;
  slug: string;
  price: number;
  largeGroupPrice: number;
  currency: string;
}

type BookingType = 'PRIVATE_TOUR' | 'AIRPORT_TRANSFER' | 'TAXI';

const TABS = [
  { id: 'PRIVATE_TOUR', label: 'Tour Packages', icon: Mountain },
  { id: 'AIRPORT_TRANSFER', label: 'Airport Transfer', icon: Plane },
  { id: 'TAXI', label: 'Private Taxi', icon: CarTaxiFront },
] as const;

export function BookingWidget({ packages = [] }: { packages?: PackageOption[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BookingType>('PRIVATE_TOUR');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [minDate, setMinDate] = useState('');

  const [flightNumber, setFlightNumber] = useState('');
  const [passengers, setPassengers] = useState('2');
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id ?? '');

  useEffect(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = new Date(today.getTime() - offset).toISOString().split('T')[0];
    setMinDate(localISOTime);
    if (!date) setDate(localISOTime);
  }, []);

  useEffect(() => {
    // Reset per-tab fields on tab switch to avoid stale values carrying over
    setFlightNumber('');
    setDropoff('');
    setPickup(activeTab === 'AIRPORT_TRANSFER' ? 'Istanbul Airport (IST)' : '');
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    trackBookingStarted(activeTab as any);

    const params = new URLSearchParams({ type: activeTab, date, passengers });

    if (activeTab === 'PRIVATE_TOUR') {
      const pkg = packages.find((p) => p.id === selectedPackageId);
      if (pkg) {
        params.append('from', 'service');
        params.append('tourId', pkg.id);
        params.append('tourName', pkg.name);
        params.append('tourPrice', pkg.price.toString());
        params.append('tourLargeGroupPrice', pkg.largeGroupPrice.toString());
        params.append('tourCurrency', pkg.currency);
      }
    } else if (activeTab === 'AIRPORT_TRANSFER') {
      params.append('pickup', pickup);
      params.append('dropoff', dropoff);
      params.append('flightNumber', flightNumber);
    } else if (activeTab === 'TAXI') {
      params.append('pickup', pickup);
      params.append('dropoff', dropoff);
    }

    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="relative z-20 w-full px-3 sm:px-4 -mt-16 sm:-mt-20 lg:-mt-24 mb-8 sm:mb-12">
      <div className="max-w-6xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-borderSoft">

        {/* Tabs */}
        <div className="flex overflow-x-auto rounded-t-xl sm:rounded-t-2xl border-b border-borderSoft bg-cream/60">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BookingType)}
              className={cn(
                'flex items-center justify-center gap-1.5 sm:gap-2 flex-1 min-w-[120px] sm:min-w-[140px] py-3 sm:py-4 border-b-[3px] font-bold text-xs sm:text-sm lg:text-base transition-colors whitespace-nowrap px-2 sm:px-4',
                activeTab === tab.id
                  ? 'border-terracotta text-navy bg-white'
                  : 'border-transparent text-textMuted hover:text-navy'
              )}
              type="button"
            >
              <tab.icon className={cn('size-4 sm:size-5 shrink-0', activeTab === tab.id && 'text-terracotta')} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSearch} className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row flex-wrap gap-3 sm:gap-4 lg:items-end">

            {/* TOUR PACKAGES */}
            {activeTab === 'PRIVATE_TOUR' && (
              <div className="flex flex-col gap-1.5 w-full lg:flex-[2] lg:min-w-[300px]">
                <label className="text-[11px] font-bold uppercase tracking-wider text-textMuted ml-1">Select Package</label>
                <div className="relative">
                  <Mountain className="absolute left-3.5 top-1/2 -translate-y-1/2 text-terracotta size-5" />
                  <select
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full pl-10 pr-4 h-12 rounded-lg border border-borderSoft bg-cream/40 text-sm text-navy font-medium focus:ring-2 focus:ring-terracotta focus:outline-none appearance-none transition-all"
                    required
                  >
                    {packages.length === 0 && <option value="" disabled>No packages available</option>}
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — from {formatCurrency(p.price, p.currency)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* AIRPORT / TAXI pickup */}
            {(activeTab === 'AIRPORT_TRANSFER' || activeTab === 'TAXI') && (
              <div className="flex flex-col gap-1.5 w-full lg:flex-1 lg:min-w-[220px]">
                <label className="text-[11px] font-bold uppercase tracking-wider text-textMuted ml-1">Pickup Location</label>
                <PlaceAutocomplete
                  value={pickup}
                  onChange={setPickup}
                  placeholder={activeTab === 'AIRPORT_TRANSFER' ? 'IST Airport...' : 'Hotel, address...'}
                  icon={<MapPin className="text-terracotta size-5" />}
                  required
                  className="bg-cream/40 border border-borderSoft"
                />
              </div>
            )}

            {(activeTab === 'AIRPORT_TRANSFER' || activeTab === 'TAXI') && (
              <div className="flex flex-col gap-1.5 w-full lg:flex-1 lg:min-w-[220px]">
                <label className="text-[11px] font-bold uppercase tracking-wider text-textMuted ml-1">Dropoff Location</label>
                <PlaceAutocomplete
                  value={dropoff}
                  onChange={setDropoff}
                  placeholder="Enter destination"
                  icon={<Flag className="text-terracotta size-5" />}
                  required
                  className="bg-cream/40 border border-borderSoft"
                />
              </div>
            )}

            {activeTab === 'AIRPORT_TRANSFER' && (
              <div className="flex flex-col gap-1.5 w-full sm:w-[calc(50%-0.5rem)] lg:w-auto lg:flex-[0.7] lg:min-w-[140px]">
                <label className="text-[11px] font-bold uppercase tracking-wider text-textMuted ml-1">Flight No.</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="e.g. TK1980 (opt)"
                    className="w-full pl-10 pr-3 h-12 rounded-lg border border-borderSoft bg-cream/40 text-navy text-sm font-medium focus:ring-2 focus:ring-terracotta focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* DATE & GUESTS */}
            <div className="flex gap-3 w-full lg:flex-[1.2] lg:min-w-[220px]">
              <div className="flex flex-col gap-1.5 flex-[3]">
                <label className="text-[11px] font-bold uppercase tracking-wider text-textMuted ml-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={minDate}
                    className="w-full pl-9 pr-2 h-12 rounded-lg border border-borderSoft bg-cream/40 text-navy text-sm font-medium focus:ring-2 focus:ring-terracotta focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {activeTab !== 'TAXI' && (
                <div className="flex flex-col gap-1.5 flex-[2]">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-textMuted ml-1 truncate">Travelers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      className="w-full pl-9 pr-2 h-12 rounded-lg border border-borderSoft bg-cream/40 text-navy text-sm font-medium focus:ring-2 focus:ring-terracotta focus:outline-none appearance-none transition-all"
                    >
                      {[1,2,3,4,5,6,7,8].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* SUBMIT (deep navy per mockup) */}
            <div className="w-full lg:flex-1 lg:min-w-[140px] lg:max-w-[170px] mt-2 lg:mt-0">
              <button
                type="submit"
                className="w-full h-12 bg-navy hover:bg-navyDark text-white font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>{activeTab === 'PRIVATE_TOUR' ? 'Search Packages' : 'Search'}</span>
                <ArrowRight className="size-5" />
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
