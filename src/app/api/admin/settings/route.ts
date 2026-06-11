import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const settingsSchema = z.object({
  siteName: z.string().optional(),
  siteDescription: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  googleTagManagerId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterHandle: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  tripAdvisorUrl: z.string().optional(),
  stripePublishableKey: z.string().optional(),
  currency: z.enum(['ISK', 'EUR', 'USD', 'GBP']).optional(),
  timezone: z.string().optional(),
  bookingEmailNotifications: z.boolean().optional(),
  autoConfirmBookings: z.boolean().optional(),
  // Pricing fields
  airportTransferPrice: z.number().optional(),
  airportTransferLargeGroupPrice: z.number().optional(),
  blueLagoonTransferPrice: z.number().optional(),
  blueLagoonRoundtripPrice: z.number().optional(),
  blueLagoonComboPrice: z.number().optional(),
  blueLagoonComboLargeGroupPrice: z.number().optional(),
  kefBlueLagoonPrice: z.number().optional(),
  cruisePortPrice: z.number().optional(),
  cityTourBasePrice: z.number().optional(),
  privateTourBasePrice: z.number().optional(),
  customTourBasePrice: z.number().optional(),
  customTourLargeGroupPrice: z.number().optional(),
  hourlyHireRate: z.number().optional(),
  hourlyHireLargeGroupRate: z.number().optional(),
  premiumCarFee: z.number().optional(),
  childSeatFee: z.number().optional(),
  extraStopFee: z.number().optional(),
  extraTimeFee: z.number().optional(),
  nightSurchargePercent: z.number().optional(),
  earlyMorningSurchargePercent: z.number().optional(),
  peakHoursSurchargePercent: z.number().optional(),
});

const defaultSettings: Record<string, string> = {
  siteName: 'TravelStore Turkey',
  siteDescription: 'Premium taxi and tour services in Turkey',
  contactEmail: 'info@travelstoreturkey.com',
  contactPhone: '+90 530 123 45 67',
  address: 'Istanbul, Turkey',
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  googleTagManagerId: '',
  facebookPixelId: '',
  metaTitle: 'TravelStore Turkey - Premium Private Tours & Transfers',
  metaDescription:
    'Experience Turkey with our premium private tours and airport transfers. Cappadocia, Hot Air Balloon, South Coast and more.',
  ogImage: '/og-image.jpg',
  twitterHandle: '@travelstoreturkey',
  facebookUrl: 'https://facebook.com/travelstoreturkey',
  instagramUrl: 'https://instagram.com/travelstoreturkey',
  tripAdvisorUrl: '',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  currency: 'ISK',
  timezone: 'Atlantic/Istanbul',
  bookingEmailNotifications: 'true',
  autoConfirmBookings: 'false',
  airportTransferPrice: '20000',
  airportTransferLargeGroupPrice: '25000',
  blueLagoonTransferPrice: '20000',
  blueLagoonRoundtripPrice: '39000',
  blueLagoonComboPrice: '40000',
  blueLagoonComboLargeGroupPrice: '50000',
  kefBlueLagoonPrice: '15000',
  cruisePortPrice: '25000',
  cityTourBasePrice: '10500',
  privateTourBasePrice: '45000',
  customTourBasePrice: '60000',
  customTourLargeGroupPrice: '75000',
  hourlyHireRate: '12000',
  hourlyHireLargeGroupRate: '15000',
  premiumCarFee: '5000',
  childSeatFee: '2000',
  extraStopFee: '7000',
  extraTimeFee: '14000',
  nightSurchargePercent: '25',
  earlyMorningSurchargePercent: '15',
  peakHoursSurchargePercent: '10',
};

const BOOLEAN_KEYS = new Set(['bookingEmailNotifications', 'autoConfirmBookings']);
const NUMERIC_KEYS = new Set([
  'airportTransferPrice', 'airportTransferLargeGroupPrice',
  'blueLagoonTransferPrice', 'blueLagoonRoundtripPrice', 'blueLagoonComboPrice', 'blueLagoonComboLargeGroupPrice',
  'kefBlueLagoonPrice', 'cruisePortPrice', 'cityTourBasePrice',
  'privateTourBasePrice', 'customTourBasePrice', 'customTourLargeGroupPrice',
  'hourlyHireRate', 'hourlyHireLargeGroupRate',
  'premiumCarFee', 'childSeatFee', 'extraStopFee', 'extraTimeFee',
  'nightSurchargePercent', 'earlyMorningSurchargePercent', 'peakHoursSurchargePercent',
]);

function parseValue(key: string, value: string): any {
  if (BOOLEAN_KEYS.has(key)) return value === 'true';
  if (NUMERIC_KEYS.has(key)) return parseFloat(value) || 0;
  return value;
}

// GET - Get all settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbSettings = await prisma.setting.findMany();
    const dbMap: Record<string, string> = {};
    for (const s of dbSettings) {
      dbMap[s.key] = s.value;
    }

    // Merge defaults with DB values
    const settings: Record<string, any> = {};
    for (const key of Object.keys(defaultSettings)) {
      const raw = dbMap[key] ?? defaultSettings[key];
      settings[key] = parseValue(key, raw);
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // Persist each key-value pair to DB
    await Promise.all(
      Object.entries(validatedData).map(([key, val]) => {
        if (val === undefined) return Promise.resolve();
        const value = String(val);
        return prisma.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        });
      })
    );

    // Return merged settings
    const dbSettings = await prisma.setting.findMany();
    const dbMap: Record<string, string> = {};
    for (const s of dbSettings) {
      dbMap[s.key] = s.value;
    }

    const settings: Record<string, any> = {};
    for (const key of Object.keys(defaultSettings)) {
      const raw = dbMap[key] ?? defaultSettings[key];
      settings[key] = parseValue(key, raw);
    }

    revalidatePath('/pricing');
    revalidatePath('/services');
    revalidatePath('/services/private-transfers');
    revalidatePath('/services/sightseeing-tours');
    revalidatePath('/booking');

    return NextResponse.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
