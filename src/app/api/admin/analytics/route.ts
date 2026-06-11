import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // days
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get booking trends
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        type: true,
        status: true,
        totalPrice: true,
        paymentStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate by date
    const bookingsByDate = bookings.reduce((acc: Record<string, any>, booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          revenue: 0,
          confirmed: 0,
          cancelled: 0,
        };
      }
      acc[date].count++;
      if (booking.paymentStatus === 'PAID') {
        acc[date].revenue += booking.totalPrice;
      }
      if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
        acc[date].confirmed++;
      }
      if (booking.status === 'CANCELLED') {
        acc[date].cancelled++;
      }
      return acc;
    }, {});

    // Aggregate by booking type
    const bookingsByType = bookings.reduce((acc: Record<string, number>, booking) => {
      acc[booking.type] = (acc[booking.type] || 0) + 1;
      return acc;
    }, {});

    // Get revenue by type
    const revenueByType = await prisma.booking.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'PAID',
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Get top tours
    const topTours = await prisma.booking.groupBy({
      by: ['tourId'],
      where: {
        createdAt: { gte: startDate },
        tourId: { not: null },
      },
      _count: {
        tourId: true,
      },
      _sum: {
        totalPrice: true,
      },
      orderBy: {
        _count: {
          tourId: 'desc',
        },
      },
      take: 5,
    });

    // Fetch tour names
    const tourIds = topTours.map((t) => t.tourId).filter(Boolean) as string[];
    const tours = await prisma.tour.findMany({
      where: { id: { in: tourIds } },
      select: { id: true, name: true },
    });

    const tourMap = new Map(tours.map((t) => [t.id, t.name]));

    const topToursWithNames = topTours.map((t) => ({
      tourId: t.tourId,
      tourName: t.tourId ? tourMap.get(t.tourId) || 'Unknown' : 'N/A',
      bookings: t._count.tourId,
      revenue: t._sum.totalPrice || 0,
    }));

    // Calculate conversion metrics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(
      (b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED'
    ).length;
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;
    const paidBookings = bookings.filter((b) => b.paymentStatus === 'PAID').length;

    const conversionRate = totalBookings > 0 ? (paidBookings / totalBookings) * 100 : 0;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    // Calculate total revenue
    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const averageBookingValue = paidBookings > 0 ? totalRevenue / paidBookings : 0;

    return NextResponse.json({
      period: days,
      summary: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        paidBookings,
        totalRevenue,
        averageBookingValue: Math.round(averageBookingValue),
        conversionRate: Math.round(conversionRate * 10) / 10,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
      },
      trends: Object.values(bookingsByDate),
      bookingsByType,
      revenueByType: revenueByType.map((r) => ({
        type: r.type,
        revenue: r._sum.totalPrice || 0,
      })),
      topTours: topToursWithNames,
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
