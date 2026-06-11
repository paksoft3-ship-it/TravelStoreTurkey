'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

const filters = [
  { id: 'all', label: 'All Tours' },
  { id: 'full-day', label: 'Full Day' },
  { id: 'half-day', label: 'Half Day' },
  { id: 'northern-lights', label: 'Hot Air Balloon', icon: Sparkles },
  { id: 'airport', label: 'Airport Transfers' },
];

export function TourFilters() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <section className="border-b border-slate-200 bg-white dark:bg-[#1a180d] dark:border-slate-800">
      <div className="max-w-7xl mx-auto w-full py-4 px-4 lg:px-10">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                'flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-colors border',
                activeFilter === filter.id
                  ? 'bg-secondary text-white shadow-sm border-secondary'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-transparent hover:border-slate-300'
              )}
            >
              <p
                className={cn(
                  'text-sm',
                  activeFilter === filter.id
                    ? 'font-bold'
                    : 'font-medium text-slate-700 dark:text-slate-200'
                )}
              >
                {filter.label}
              </p>
              {filter.icon && (
                <filter.icon
                  className={cn(
                    'size-4',
                    activeFilter === filter.id ? 'text-primary' : 'text-slate-500'
                  )}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
