import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const revalidate = 3600;

const defaultPricing = {
  // Airport Transfer
  airportTransferPrice: 20000,
  airportTransferLargeGroupPrice: 25000,
  // Hourly Hire
  hourlyHireRate: 12000,
  hourlyHireLargeGroupRate: 15000,
  // Custom Tour
  customTourBasePrice: 60000,
  customTourLargeGroupPrice: 75000,
  // Private Tour fallback (individual prices set per-tour in Tours admin)
  privateTourBasePrice: 45000,
  // Cappadocia
  blueLagoonTransferPrice: 20000,
  blueLagoonRoundtripPrice: 39000,
  blueLagoonComboPrice: 40000,
  blueLagoonComboLargeGroupPrice: 50000,
  kefBlueLagoonPrice: 15000,
  cruisePortPrice: 25000,
  cityTourBasePrice: 10500,
  // Add-on fees
  premiumCarFee: 5000,
  childSeatFee: 2000,
  extraStopFee: 7000,
  extraTimeFee: 14000,
  // Time surcharges (percent, e.g. 25 = +25%)
  nightSurchargePercent: 25,
  earlyMorningSurchargePercent: 15,
  peakHoursSurchargePercent: 10,
};

const pricingKeys = Object.keys(defaultPricing);

// GET - Public pricing settings (no auth required)
export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: pricingKeys } },
    });

    const pricing: Record<string, number> = { ...defaultPricing };
    for (const s of settings) {
      if (pricingKeys.includes(s.key)) {
        pricing[s.key] = parseFloat(s.value) || defaultPricing[s.key as keyof typeof defaultPricing];
      }
    }

    return NextResponse.json({ pricing });
  } catch (error) {
    console.error('Public settings GET error:', error);
    return NextResponse.json({ pricing: defaultPricing });
  }
}
