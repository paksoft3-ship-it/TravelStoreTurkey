import { Metadata } from 'next';
import Link from 'next/link';
import {
  Banknote,
  CarTaxiFront,
  Clock,
  Mountain,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  Search,
  Filter,
  MoreVertical,
  MessageCircle,
  Check,
  X,
  Mail,
  LayoutList,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'TravelStore Turkey Admin Dashboard',
};

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  try {
    const [
      todayRevenue,
      yesterdayRevenue,
      activeDrivers,
      totalDrivers,
      pendingBookings,
      todayTours,
      yesterdayTours,
      recentBookings,
      drivers,
      unreadMessages,
    ] = await Promise.all([
      // Today's revenue
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: 'PAID',
          paidAt: { gte: startOfToday, lt: endOfToday },
        },
      }),
      // Yesterday's revenue
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: 'PAID',
          paidAt: { gte: startOfYesterday, lt: startOfToday },
        },
      }),
      // Active drivers
      prisma.driver.count({
        where: { status: { in: ['AVAILABLE', 'ON_TOUR'] } },
      }),
      // Total drivers
      prisma.driver.count(),
      // Pending bookings
      prisma.booking.count({
        where: { status: 'PENDING' },
      }),
      // Today's tours
      prisma.booking.count({
        where: {
          pickupDate: { gte: startOfToday, lt: endOfToday },
          type: { in: ['PRIVATE_TOUR', 'CUSTOM_TOUR'] },
        },
      }),
      // Yesterday's tours
      prisma.booking.count({
        where: {
          pickupDate: { gte: startOfYesterday, lt: startOfToday },
          type: { in: ['PRIVATE_TOUR', 'CUSTOM_TOUR'] },
        },
      }),
      // Recent bookings
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          tour: { select: { name: true } },
          driver: { select: { name: true } },
        },
      }),
      // Drivers with status
      prisma.driver.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          vehicle: { select: { make: true, model: true } },
        },
      }),
      // Unread messages
      prisma.contactSubmission.count({
        where: { read: false },
      }),
    ]);

    const todayRevenueValue = todayRevenue._sum.totalPrice || 0;
    const yesterdayRevenueValue = yesterdayRevenue._sum.totalPrice || 0;
    const revenueChange = yesterdayRevenueValue > 0
      ? Math.round(((todayRevenueValue - yesterdayRevenueValue) / yesterdayRevenueValue) * 100)
      : 0;

    const toursChange = yesterdayTours > 0
      ? Math.round(((todayTours - yesterdayTours) / yesterdayTours) * 100)
      : 0;

    return {
      stats: {
        todayRevenue: todayRevenueValue,
        revenueChange,
        activeDrivers,
        totalDrivers,
        pendingBookings,
        todayTours,
        toursChange,
        unreadMessages,
      },
      recentBookings,
      drivers,
    };
  } catch (error) {
    console.error('Dashboard data error:', error);
    return {
      stats: {
        todayRevenue: 0,
        revenueChange: 0,
        activeDrivers: 0,
        totalDrivers: 0,
        pendingBookings: 0,
        todayTours: 0,
        toursChange: 0,
        unreadMessages: 0,
      },
      recentBookings: [],
      drivers: [],
    };
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-primary/20 text-yellow-800 border-primary/20';
    case 'CONFIRMED':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'IN_PROGRESS':
      return 'bg-green-50 text-green-700 border-green-100';
    case 'COMPLETED':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-100';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function getDriverStatusColor(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'green';
    case 'ON_TOUR':
      return 'yellow';
    case 'BREAK':
      return 'orange';
    default:
      return 'slate';
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const bookingDate = new Date(date);
  const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());

  const time = bookingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (bookingDay.getTime() === today.getTime()) {
    return `Today, ${time}`;
  } else if (bookingDay.getTime() === yesterday.getTime()) {
    return `Yesterday, ${time}`;
  } else {
    return bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${time}`;
  }
}

export default async function AdminDashboard() {
  const { stats, recentBookings, drivers } = await getDashboardData();

  const statsCards = [
    {
      label: "Today's Revenue",
      value: formatCurrency(stats.todayRevenue, 'ISK'),
      change: `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}%`,
      changeType: stats.revenueChange >= 0 ? 'positive' : 'negative',
      icon: Banknote,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-700 dark:text-yellow-400',
    },
    {
      label: 'Active Drivers',
      value: stats.activeDrivers.toString(),
      subtext: `/ ${stats.totalDrivers}`,
      change: '0%',
      changeType: 'neutral',
      icon: CarTaxiFront,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-700 dark:text-blue-400',
    },
    {
      label: 'Pending Requests',
      value: stats.pendingBookings.toString(),
      change: stats.pendingBookings > 0 ? `${stats.pendingBookings} New` : '0',
      changeType: stats.pendingBookings > 0 ? 'warning' : 'neutral',
      icon: Clock,
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Total Tours Today',
      value: stats.todayTours.toString(),
      change: `${stats.toursChange >= 0 ? '+' : ''}${stats.toursChange}%`,
      changeType: stats.toursChange >= 0 ? 'positive' : 'negative',
      icon: Mountain,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Welcome back. Here is what is happening in Turkey today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats.unreadMessages > 0 && (
            <Link
              href="/admin/messages"
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm font-semibold text-red-700 hover:bg-red-100 transition-all"
            >
              <Mail className="size-4" />
              {stats.unreadMessages} New Messages
            </Link>
          )}
          <Link
            href="/admin/bookings"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-yellow-400 transition-all"
          >
            <Plus className="size-4" />
            New Booking
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-3 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                <stat.icon className={cn('size-5', stat.iconColor)} />
              </div>
              <span
                className={cn(
                  'flex items-center text-xs font-bold px-2 py-1 rounded-full',
                  stat.changeType === 'positive' && 'text-green-600 bg-green-50',
                  stat.changeType === 'negative' && 'text-red-500 bg-red-50',
                  stat.changeType === 'neutral' && 'text-slate-500 bg-slate-100',
                  stat.changeType === 'warning' && 'text-orange-600 bg-orange-50'
                )}
              >
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
                {stat.subtext && (
                  <span className="text-sm font-normal text-slate-400">
                    {stat.subtext}
                  </span>
                )}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Quick Actions
              </h3>
              <p className="text-sm text-slate-500">
                Manage your bookings and services
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <Link
              href="/admin/bookings"
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-primary/10 transition-colors"
            >
              <Clock className="size-8 text-primary" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Bookings</span>
            </Link>
            <Link
              href="/admin/drivers"
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-primary/10 transition-colors"
            >
              <CarTaxiFront className="size-8 text-blue-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Drivers</span>
            </Link>
            <Link
              href="/admin/fleet"
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-primary/10 transition-colors"
            >
              <Mountain className="size-8 text-purple-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Fleet</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-primary/10 transition-colors"
            >
              <TrendingUp className="size-8 text-green-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Analytics</span>
            </Link>
            <Link
              href="/admin/pricing-overview"
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-primary/10 transition-colors"
            >
              <LayoutList className="size-8 text-orange-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Pricing</span>
            </Link>
          </div>
        </div>

        {/* Driver Availability */}
        <div className="xl:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Driver Availability
          </h3>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px]">
            {drivers.length > 0 ? (
              drivers.map((driver) => {
                const statusColor = getDriverStatusColor(driver.status);
                return (
                  <div
                    key={driver.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                        {getInitials(driver.name)}
                      </div>
                      <div
                        className={cn(
                          'absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white dark:border-slate-800',
                          statusColor === 'green' && 'bg-green-500',
                          statusColor === 'yellow' && 'bg-yellow-500',
                          statusColor === 'orange' && 'bg-orange-500',
                          statusColor === 'slate' && 'bg-slate-300'
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {driver.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {driver.vehicle ? `${driver.vehicle.make} ${driver.vehicle.model}` : 'No vehicle'} •{' '}
                        <span
                          className={cn(
                            statusColor === 'green' && 'text-green-600',
                            statusColor === 'yellow' && 'text-yellow-600',
                            statusColor === 'orange' && 'text-orange-600',
                            statusColor === 'slate' && 'text-slate-400'
                          )}
                        >
                          {driver.status === 'AVAILABLE' ? 'Available' :
                            driver.status === 'ON_TOUR' ? 'On Tour' :
                              driver.status === 'BREAK' ? 'On Break' : 'Offline'}
                        </span>
                      </p>
                    </div>
                    <button className="size-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-primary hover:text-black transition-colors">
                      <MessageCircle className="size-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No drivers found</p>
            )}
          </div>
          <Link
            href="/admin/drivers"
            className="w-full mt-4 py-2 text-sm text-primary font-semibold hover:underline text-center"
          >
            View All Drivers
          </Link>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Bookings
          </h3>
          <Link
            href="/admin/bookings"
            className="text-sm text-primary font-semibold hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4">Booking #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {booking.bookingNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full flex items-center justify-center font-bold text-xs bg-indigo-100 text-indigo-600">
                          {getInitials(booking.customerName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {booking.customerName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {booking.customerEmail}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={cn(
                            'inline-flex w-fit items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border',
                            booking.type === 'TAXI' || booking.type === 'AIRPORT_TRANSFER'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-purple-50 text-purple-700 border-purple-100'
                          )}
                        >
                          {booking.type === 'TAXI' || booking.type === 'AIRPORT_TRANSFER' ? (
                            <CarTaxiFront className="size-3" />
                          ) : (
                            <Mountain className="size-3" />
                          )}
                          {booking.type.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {booking.tour?.name || `${booking.pickupLocation} → ${booking.dropoffLocation || 'TBD'}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(booking.pickupDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                          getStatusStyle(booking.status)
                        )}
                      >
                        {booking.status === 'COMPLETED' && <Check className="size-3" />}
                        {booking.status === 'CANCELLED' && <X className="size-3" />}
                        {booking.status === 'PENDING' && (
                          <span className="size-1.5 rounded-full bg-yellow-600" />
                        )}
                        {(booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') && (
                          <span className="size-1.5 rounded-full bg-green-600" />
                        )}
                        {booking.status}
                      </span>
                    </td>
                    <td
                      className={cn(
                        'px-6 py-4 text-right text-sm font-bold',
                        booking.status === 'CANCELLED'
                          ? 'text-slate-400 line-through'
                          : 'text-slate-900 dark:text-white'
                      )}
                    >
                      {formatCurrency(booking.totalPrice, booking.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
