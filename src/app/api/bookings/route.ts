import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { bookingSchema } from '@/lib/validations';
import { generateBookingNumber } from '@/lib/utils';
// PayPal payment is handled separately via /api/paypal/* routes
import { sendBookingConfirmation, sendAdminBookingNotification } from '@/lib/email';
import { rateLimit, getIp } from '@/lib/rateLimit';
import { createPaymentIntent } from '@/lib/stripe';

// GET /api/bookings - Get all bookings (admin only)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          tour: true,
          driver: true,
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 bookings per IP per hour
    const ip = getIp(request);
    if (!rateLimit(`bookings:${ip}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = bookingSchema.parse(body);

    // Fetch dynamic pricing from DB (falls back to defaults if not set)
    const pricingDefaults: Record<string, number> = {
      airportTransferPrice: 20000,
      airportTransferLargeGroupPrice: 25000,
      hourlyHireRate: 12000,
      hourlyHireLargeGroupRate: 15000,
      privateTourBasePrice: 45000,
      customTourBasePrice: 60000,
      customTourLargeGroupPrice: 75000,
      blueLagoonTransferPrice: 20000,
      blueLagoonRoundtripPrice: 39000,
      blueLagoonComboPrice: 40000,
      blueLagoonComboLargeGroupPrice: 50000,
      premiumCarFee: 5000,
      childSeatFee: 2000,
      extraStopFee: 7000,
      extraTimeFee: 14000,
      nightSurchargePercent: 25,
      earlyMorningSurchargePercent: 15,
      peakHoursSurchargePercent: 10,
    };
    const dbPricing = await prisma.setting.findMany({
      where: { key: { in: Object.keys(pricingDefaults) } },
    });
    const pricing: Record<string, number> = { ...pricingDefaults };
    for (const s of dbPricing) {
      pricing[s.key] = parseFloat(s.value) || pricingDefaults[s.key];
    }

    // Calculate price based on service type
    const basePrices: Record<string, number> = {
      TAXI: 0,
      AIRPORT_TRANSFER: pricing.airportTransferPrice,
      PRIVATE_TOUR: pricing.privateTourBasePrice,
      CUSTOM_TOUR: pricing.customTourBasePrice,
      BLUE_LAGOON: pricing.blueLagoonTransferPrice,
    };

    let basePrice = basePrices[validated.type] || 0;

    // Use tour-specific price when a tourId is provided for PRIVATE_TOUR
    if (validated.type === 'PRIVATE_TOUR' && validated.tourId) {
      const tour = await prisma.tour.findUnique({ where: { id: validated.tourId } });
      if (tour) {
        basePrice = validated.passengers > 4 && tour.largeGroupPrice > 0
          ? tour.largeGroupPrice
          : tour.price;
      }
    }

    // Dynamic pricing for hourly hire (rate per hour, default 4 hrs)
    if (validated.type === 'HOURLY_HIRE') {
      const hours = parseInt(String(validated.options?.hourlyDuration || '4'), 10);
      const rate = validated.passengers > 4 ? pricing.hourlyHireLargeGroupRate : pricing.hourlyHireRate;
      basePrice = hours * rate;
    }

    // Use routePrice (from service page route cards) when explicitly provided
    if (validated.routePrice && validated.routePrice > 0) {
      basePrice = validated.routePrice;
      // Switch to large group price if passengers > 4 and route has one
      if (validated.passengers > 4 && validated.routeLargeGroupPrice && validated.routeLargeGroupPrice > 0) {
        basePrice = validated.routeLargeGroupPrice;
      }
    }

    // Handle Cappadocia Packages specifically (only if no routePrice override)
    if (validated.type === 'BLUE_LAGOON' && validated.options?.packageType && !validated.routePrice) {
      if (validated.options.packageType === 'roundtrip') {
        basePrice = pricing.blueLagoonRoundtripPrice;
      } else if (validated.options.packageType === 'combo') {
        if (validated.passengers > 4) {
          basePrice = pricing.blueLagoonComboLargeGroupPrice;
        } else {
          basePrice = pricing.blueLagoonComboPrice;
        }
      }
    }

    // Calculate extras
    let extras = 0;

    // Large group price overrides (only when no routePrice was provided)
    if (validated.passengers > 4 && !validated.routePrice) {
      if (validated.type === 'AIRPORT_TRANSFER') {
        basePrice = pricing.airportTransferLargeGroupPrice;
      } else if (validated.type === 'CUSTOM_TOUR') {
        basePrice = pricing.customTourLargeGroupPrice;
      }
      // PRIVATE_TOUR: handled above via tour.largeGroupPrice
      // HOURLY_HIRE: handled above via hourlyHireLargeGroupRate
      // BLUE_LAGOON with routePrice: handled above via routeLargeGroupPrice
    }

    // Options add-ons (applied once for all types)
    if (validated.options) {
      if (validated.options.premiumCar) extras += pricing.premiumCarFee;
      if (validated.options.childSeats) extras += validated.options.childSeats * pricing.childSeatFee;
      if (validated.options.extraStop) extras += pricing.extraStopFee;
      if (validated.options.extraTime) extras += pricing.extraTimeFee;
    }

    let totalPrice = basePrice + extras;

    // Apply time-based surcharge (matches BookingSummary.tsx display logic)
    let appliedSurchargeLabel = '';
    if (validated.type !== 'TAXI' && validated.pickupTime) {
      const pickupHour = parseInt(validated.pickupTime.split(':')[0], 10);
      let surchargeMultiplier = 1.0;

      if (pickupHour >= 22 || pickupHour < 6) {
        surchargeMultiplier = 1 + pricing.nightSurchargePercent / 100;
        appliedSurchargeLabel = `Night rate (22:00-06:00) +${pricing.nightSurchargePercent}%`;
      } else if (pickupHour >= 6 && pickupHour < 8) {
        surchargeMultiplier = 1 + pricing.earlyMorningSurchargePercent / 100;
        appliedSurchargeLabel = `Early morning (06:00-08:00) +${pricing.earlyMorningSurchargePercent}%`;
      } else if ((pickupHour >= 8 && pickupHour < 9) || (pickupHour >= 17 && pickupHour < 19)) {
        surchargeMultiplier = 1 + pricing.peakHoursSurchargePercent / 100;
        appliedSurchargeLabel = `Peak hours +${pricing.peakHoursSurchargePercent}%`;
      }

      if (surchargeMultiplier > 1.0) {
        const surchargeAmount = Math.round(totalPrice * (surchargeMultiplier - 1));
        extras += surchargeAmount;
        totalPrice += surchargeAmount;
      }
    }

    // Compile special requests string
    let specialRequests = validated.specialRequests || '';
    const details = [];
    if (validated.routeName) {
      details.push(`Package: ${validated.routeName}`);
    }
    if (appliedSurchargeLabel) {
      details.push(`Surcharge: ${appliedSurchargeLabel}`);
    }

    // Map types for DB compatibility
    type DbBookingType = 'TAXI' | 'AIRPORT_TRANSFER' | 'PRIVATE_TOUR' | 'CUSTOM_TOUR';
    let dbType: DbBookingType = validated.type as DbBookingType;
    if (validated.type === 'BLUE_LAGOON') {
      dbType = 'AIRPORT_TRANSFER';
      details.push('Service: Cappadocia Transfer');
      if (validated.options?.packageType) {
        details.push(`Package: ${validated.options.packageType}`);
      }
      if (validated.options?.blDirection) {
        details.push(`Route: ${validated.options.blDirection}`);
      }
    } else if (validated.type === 'HOURLY_HIRE') {
      dbType = 'CUSTOM_TOUR';
      details.push('Service: Hourly Hire');
      if (validated.options?.hourlyDuration) {
        details.push(`Duration: ${validated.options.hourlyDuration} hours`);
      }
    } else if (validated.type === 'PRIVATE_TOUR') {
      if (validated.options?.tourName) {
        details.push(`Tour: ${validated.options.tourName}`);
      }
      if (validated.options?.tourStartTime) {
        details.push(`Start Time: ${validated.options.tourStartTime}`);
      }
    }

    if (validated.flightNumber) details.push(`Flight: ${validated.flightNumber}`);
    if (validated.flightTime) details.push(`Flight Time: ${validated.flightTime}`);
    if (validated.luggageCount) details.push(`Luggage: ${validated.luggageCount}`);

    if (validated.options) {
      if (validated.options.premiumCar) details.push('Premium Car');
      if (validated.options.childSeats) details.push(`${validated.options.childSeats} Child/Booster Seat(s)`);
      if (validated.options.extraStop) details.push('Extra Stop');
      if (validated.options.extraTime) details.push('Extra Time');
    }

    if (details.length > 0) {
      specialRequests = `${details.join(', ')}. ${specialRequests}`;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        type: dbType,
        customerName: validated.customerName,
        customerEmail: validated.customerEmail,
        customerPhone: validated.customerPhone,
        passengers: validated.passengers,
        pickupLocation: validated.pickupLocation,
        dropoffLocation: validated.dropoffLocation,
        pickupDate: new Date(validated.pickupDate),
        pickupTime: validated.pickupTime,
        basePrice,
        extras,
        totalPrice,
        currency: 'EUR',
        tourId: validated.tourId,
        specialRequests: specialRequests, // Saved combined string
      },
    });

    console.log(`[PAYMENT] Booking created | id=${booking.id} | number=${booking.bookingNumber} | type=${validated.type} | amount=${totalPrice} EUR | customer=${booking.customerEmail}`);

    // For non-TAXI bookings: create Stripe Payment Intent and store on booking
    if (validated.type !== 'TAXI') {
      if (totalPrice <= 0) {
        console.error(`[PAYMENT][STRIPE][ERROR] Skipping intent — totalPrice is ${totalPrice} for booking ${booking.id}`);
      } else {
        try {
          console.log(`[PAYMENT][STRIPE] Creating intent | bookingId=${booking.id} | amountEUR=${totalPrice} | stripeAmount=${totalPrice * 100}`);
          const intent = await createPaymentIntent(totalPrice, 'eur', {
            bookingId:     booking.id,
            bookingNumber: booking.bookingNumber,
            customerEmail: booking.customerEmail,
          });
          await prisma.booking.update({
            where: { id: booking.id },
            data:  { paymentIntentId: intent.id },
          });
          console.log(`[PAYMENT][STRIPE] Intent created | intentId=${intent.id} | status=${intent.status} | bookingId=${booking.id}`);
        } catch (stripeErr: unknown) {
          const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
          console.error(`[PAYMENT][STRIPE][ERROR] Intent creation failed | bookingId=${booking.id} | error=${msg}`);
        }
      }
    }

    // Send booking confirmation to customer and admin for every booking type
    const emailData = {
      bookingNumber:   booking.bookingNumber,
      customerName:    booking.customerName,
      customerEmail:   booking.customerEmail,
      customerPhone:   booking.customerPhone,
      type:            booking.type,
      pickupDate:      booking.pickupDate,
      pickupTime:      booking.pickupTime,
      pickupLocation:  booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation || undefined,
      passengers:      booking.passengers,
      totalPrice:      booking.totalPrice,
      currency:        booking.currency,
      specialRequests: booking.specialRequests || undefined,
    };
    Promise.all([
      sendBookingConfirmation(emailData).catch((err) => console.error(`[PAYMENT][EMAIL][ERROR] Booking confirmation to ${booking.customerEmail} failed:`, err)),
      sendAdminBookingNotification(emailData).catch((err) => console.error('[PAYMENT][EMAIL][ERROR] Admin notification failed:', err)),
    ]);

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error details:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
