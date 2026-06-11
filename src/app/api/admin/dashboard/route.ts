import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch all stats in parallel
    const [
      totalBookings,
      monthlyBookings,
      lastMonthBookings,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      activeDrivers,
      totalDrivers,
      availableVehicles,
      totalVehicles,
      pendingBookings,
      todayBookings,
      recentBookings,
      unreadMessages,
    ] = await Promise.all([
      // Total bookings
      prisma.booking.count(),
      // This month bookings
      prisma.booking.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      // Last month bookings
      prisma.booking.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      // Total revenue (paid only)
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { paymentStatus: 'PAID' },
      }),
      // Monthly revenue
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfMonth },
        },
      }),
      // Last month revenue
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      // Active drivers
      prisma.driver.count({
        where: { status: { in: ['AVAILABLE', 'ON_TOUR'] } },
      }),
      // Total drivers
      prisma.driver.count(),
      // Available vehicles
      prisma.vehicle.count({
        where: { status: 'AVAILABLE' },
      }),
      // Total vehicles
      prisma.vehicle.count(),
      // Pending bookings
      prisma.booking.count({
        where: { status: 'PENDING' },
      }),
      // Today's bookings
      prisma.booking.count({
        where: {
          pickupDate: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lt: new Date(now.setHours(23, 59, 59, 999)),
          },
        },
      }),
      // Recent bookings
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          tour: { select: { name: true } },
          driver: { select: { name: true } },
        },
      }),
      // Unread messages
      prisma.contactSubmission.count({
        where: { read: false },
      }),
    ]);

    // Calculate percentage changes
    const bookingChange = lastMonthBookings > 0
      ? ((monthlyBookings - lastMonthBookings) / lastMonthBookings) * 100
      : 0;

    const monthlyRevenueValue = monthlyRevenue._sum.totalPrice || 0;
    const lastMonthRevenueValue = lastMonthRevenue._sum.totalPrice || 0;
    const revenueChange = lastMonthRevenueValue > 0
      ? ((monthlyRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100
      : 0;

    return NextResponse.json({
      stats: {
        totalBookings,
        monthlyBookings,
        bookingChange: Math.round(bookingChange),
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        monthlyRevenue: monthlyRevenueValue,
        revenueChange: Math.round(revenueChange),
        activeDrivers,
        totalDrivers,
        availableVehicles,
        totalVehicles,
        pendingBookings,
        todayBookings,
        unreadMessages,
      },
      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        customerName: booking.customerName,
        type: booking.type,
        status: booking.status,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        pickupDate: booking.pickupDate,
        tour: booking.tour?.name,
        driver: booking.driver?.name,
        createdAt: booking.createdAt,
      })),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
