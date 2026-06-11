'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsData {
  period: number;
  summary: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    paidBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    conversionRate: number;
    cancellationRate: number;
  };
  trends: Array<{
    date: string;
    count: number;
    revenue: number;
    confirmed: number;
    cancelled: number;
  }>;
  bookingsByType: Record<string, number>;
  revenueByType: Array<{ type: string; revenue: number }>;
  topTours: Array<{
    tourId: string;
    tourName: string;
    bookings: number;
    revenue: number;
  }>;
}

const periods = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  format?: 'number' | 'currency' | 'percentage';
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val, 'ISK');
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="size-6 text-primary" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="size-4" />
            ) : (
              <ArrowDownRight className="size-4" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {formatValue(value)}
      </p>
    </div>
  );
}

function BookingTypeChart({ data }: { data: Record<string, number> }) {
  const typeLabels: Record<string, string> = {
    TAXI: 'Taxi',
    AIRPORT_TRANSFER: 'Airport Transfer',
    PRIVATE_TOUR: 'Private Tour',
    CUSTOM_TOUR: 'Custom Tour',
  };

  const colors = {
    TAXI: 'bg-blue-500',
    AIRPORT_TRANSFER: 'bg-green-500',
    PRIVATE_TOUR: 'bg-purple-500',
    CUSTOM_TOUR: 'bg-orange-500',
  };

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
        Bookings by Type
      </h3>
      <div className="space-y-4">
        {Object.entries(data).map(([type, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={type}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {typeLabels[type] || type}
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[type as keyof typeof colors] || 'bg-slate-400'} rounded-full transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopToursTable({
  tours,
}: {
  tours: AnalyticsData['topTours'];
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
        Top Tours
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                Tour
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                Bookings
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {tours.length > 0 ? (
              tours.map((tour, index) => (
                <tr
                  key={tour.tourId || index}
                  className="border-b border-slate-50 dark:border-slate-700/50"
                >
                  <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-medium">
                    {tour.tourName}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 text-right">
                    {tour.bookings}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-medium text-right">
                    {formatCurrency(tour.revenue, 'ISK')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No tour bookings in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrendChart({
  data,
}: {
  data: AnalyticsData['trends'];
}) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
        Revenue Trend
      </h3>
      <div className="h-64 flex items-end gap-1">
        {data.length > 0 ? (
          data.map((day, index) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center group relative"
            >
              <div
                className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all cursor-pointer"
                style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
              />
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                <p>{formatCurrency(day.revenue, 'ISK')}</p>
                <p>{day.count} bookings</p>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            No data available
          </div>
        )}
      </div>
      {data.length > 0 && (
        <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{new Date(data[0]?.date).toLocaleDateString()}</span>
          <span>{new Date(data[data.length - 1]?.date).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-primary text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track your business performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  period === p.value
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAnalytics}
            className="size-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="size-5" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={data.summary.totalRevenue}
              icon={DollarSign}
              format="currency"
            />
            <StatCard
              title="Total Bookings"
              value={data.summary.totalBookings}
              icon={ShoppingCart}
            />
            <StatCard
              title="Conversion Rate"
              value={data.summary.conversionRate}
              icon={TrendingUp}
              format="percentage"
            />
            <StatCard
              title="Average Booking Value"
              value={data.summary.averageBookingValue}
              icon={Calendar}
              format="currency"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Completed Bookings
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {data.summary.completedBookings}
                  </p>
                </div>
                <div className="size-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="size-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Cancelled Bookings
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {data.summary.cancelledBookings}
                  </p>
                </div>
                <div className="size-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="size-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Cancellation Rate
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.summary.cancellationRate}%
                  </p>
                </div>
                <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Users className="size-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart data={data.trends} />
            <BookingTypeChart data={data.bookingsByType} />
          </div>

          {/* Top Tours */}
          <TopToursTable tours={data.topTours} />
        </>
      )}
    </div>
  );
}
