import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db';
import { ArrowRight, Car, Map, Clock, Banknote, Percent, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

const SETTING_DEFAULTS: Record<string, number> = {
  hourlyHireRate: 12000,
  hourlyHireLargeGroupRate: 15000,
  customTourBasePrice: 60000,
  customTourLargeGroupPrice: 75000,
  cityTourBasePrice: 10500,
  premiumCarFee: 5000,
  childSeatFee: 2000,
  extraStopFee: 7000,
  extraTimeFee: 14000,
  nightSurchargePercent: 25,
  earlyMorningSurchargePercent: 15,
  peakHoursSurchargePercent: 10,
};

const TRANSFER_CATEGORY_LABELS: Record<string, string> = {
  AIRPORT: 'Airport Transfers',
  AIRPORT_BLUE_LAGOON: 'Airport ↔ Cappadocia',
  BLUE_LAGOON: 'Cappadocia Packages',
  PRIVATE_TRANSFER: 'Private Transfers',
};

function formatISK(n: number) {
  return `${n.toLocaleString('is-IS')} ISK`;
}

export default async function PricingOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  const [settingRows, tours, transferRoutes] = await Promise.all([
    prisma.setting.findMany({ where: { key: { in: Object.keys(SETTING_DEFAULTS) } } }).catch(() => []),
    prisma.tour.findMany({ where: { active: true }, orderBy: { price: 'asc' } }).catch(() => []),
    prisma.transferRoute.findMany({ where: { active: true }, orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { price: 'asc' }] }).catch(() => []),
  ]);

  const settings = { ...SETTING_DEFAULTS };
  for (const s of settingRows) {
    if (s.key in settings) settings[s.key] = parseFloat(s.value) || settings[s.key];
  }

  type TransferRoute = (typeof transferRoutes)[number];
  const transfersByCategory = transferRoutes.reduce<Record<string, TransferRoute[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pricing Overview
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            All live prices across transfers, tours, and booking add-ons — read-only
          </p>
        </div>
      </div>

      {/* Transfer Routes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Car className="size-5 text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white">Transfer Routes</h3>
            <span className="text-sm text-slate-500">{transferRoutes.length} active</span>
          </div>
          <Link href="/admin/transfers" className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
            Edit in Transfers <ExternalLink className="size-3" />
          </Link>
        </div>
        {transferRoutes.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm mb-3">No active transfer routes. Add them in the Transfers section.</p>
            <Link href="/admin/transfers" className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
              Go to Transfers <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          Object.entries(transfersByCategory).map(([category, routes]) => (
            <div key={category}>
              <div className="px-6 py-2 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {TRANSFER_CATEGORY_LABELS[category] ?? category}
                </span>
              </div>
              <table className="w-full border-collapse">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {routes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{r.name}</td>
                      <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">{r.duration ?? '—'}</td>
                      <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">{r.passengers ?? '—'}</td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-primary">{formatISK(r.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}

        {/* Hourly hire rates (from Settings) */}
        <div>
          <div className="px-6 py-2 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hourly Hire Rates</span>
          </div>
          <table className="w-full border-collapse">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">Hourly Hire — Small Group (1–4 pax)</td>
                <td className="px-6 py-3 text-sm text-slate-500">per hour</td>
                <td className="px-6 py-3 text-sm text-slate-500"></td>
                <td className="px-6 py-3 text-right text-sm font-bold text-primary">{formatISK(settings.hourlyHireRate)}</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">Hourly Hire — Large Group (5–8 pax)</td>
                <td className="px-6 py-3 text-sm text-slate-500">per hour</td>
                <td className="px-6 py-3 text-sm text-slate-500"></td>
                <td className="px-6 py-3 text-right text-sm font-bold text-primary">{formatISK(settings.hourlyHireLargeGroupRate)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sightseeing Tours */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Map className="size-5 text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white">Sightseeing Tours</h3>
            <span className="text-sm text-slate-500">{tours.length} active</span>
          </div>
          <Link href="/admin/tours" className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
            Edit in Tours <ExternalLink className="size-3" />
          </Link>
        </div>
        {tours.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm mb-3">No active tours. Add them in the Tours section.</p>
            <Link href="/admin/tours" className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
              Go to Tours <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/40 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-3 text-left">Tour</th>
                <th className="px-6 py-3 text-left">Duration</th>
                <th className="px-6 py-3 text-right">1–4 pax</th>
                <th className="px-6 py-3 text-right">5–8 pax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {tours.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{t.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{t.duration}</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-primary">{formatISK(t.price)}</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-primary">
                    {t.largeGroupPrice > 0 ? formatISK(t.largeGroupPrice) : formatISK(t.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Booking Add-ons */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Banknote className="size-5 text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white">Booking Add-ons & Surcharges</h3>
          </div>
          <Link href="/admin/settings?tab=pricing" className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
            Edit in Settings <ExternalLink className="size-3" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700">
          {/* Add-on fees */}
          <div>
            <div className="px-6 py-2 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Banknote className="size-3" /> Add-on Fees
              </span>
            </div>
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {[
                  { key: 'premiumCarFee', label: 'Premium Vehicle' },
                  { key: 'childSeatFee', label: 'Child Seat (per seat)' },
                  { key: 'extraStopFee', label: 'Extra Stop' },
                  { key: 'extraTimeFee', label: 'Extra Time' },
                ].map(({ key, label }) => (
                  <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{label}</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-primary">{formatISK(settings[key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Surcharges */}
          <div>
            <div className="px-6 py-2 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Percent className="size-3" /> Time Surcharges
              </span>
            </div>
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {[
                  { key: 'nightSurchargePercent', label: 'Night (22:00–06:00)', unit: '%' },
                  { key: 'earlyMorningSurchargePercent', label: 'Early Morning (06:00–08:00)', unit: '%' },
                  { key: 'peakHoursSurchargePercent', label: 'Peak Hours (08–09 & 17–19)', unit: '%' },
                ].map(({ key, label, unit }) => (
                  <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{label}</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-primary">+{settings[key]}{unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 pb-4">
        This page shows all live prices from the database. Use the edit links above to make changes.
      </p>
    </div>
  );
}
