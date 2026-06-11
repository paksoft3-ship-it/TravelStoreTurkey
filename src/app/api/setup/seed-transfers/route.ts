import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

const transfersData = [
  // ── AIRPORT ──────────────────────────────────────────────────
  {
    name: 'KEF ↔ Istanbul (1–4 pax)',
    category: 'AIRPORT',
    from: 'Istanbul International Airport',
    to: 'Istanbul',
    description: 'Private airport transfer between Istanbul Airport and Istanbul city centre.',
    duration: '45 min',
    distance: '47 km',
    passengers: '1–4 passengers',
    price: 20000,
    largeGroupPrice: 25000,
    features: ['Flight tracking', 'Meet & greet at arrivals', 'Door-to-door service', 'Free WiFi', 'Luggage assistance'],
    popular: true,
    active: true,
    sortOrder: 1,
  },
  {
    name: 'KEF ↔ Istanbul (5–8 pax)',
    category: 'AIRPORT',
    from: 'Istanbul International Airport',
    to: 'Istanbul',
    description: 'Large group airport transfer between Istanbul Airport and Istanbul city centre.',
    duration: '45 min',
    distance: '47 km',
    passengers: '5–8 passengers',
    price: 25000,
    largeGroupPrice: 0,
    features: ['Flight tracking', 'Meet & greet at arrivals', 'Spacious van', 'Free WiFi', 'Luggage assistance'],
    popular: false,
    active: true,
    sortOrder: 2,
  },

  // ── AIRPORT ↔ BLUE LAGOON ────────────────────────────────────
  {
    name: 'KEF ↔ Cappadocia (1–4 pax)',
    category: 'AIRPORT_BLUE_LAGOON',
    from: 'Istanbul International Airport',
    to: 'Cappadocia, Cappadocia',
    description: 'Direct transfer between Istanbul Airport and the Cappadocia — only 20 km apart.',
    duration: '20–25 min',
    distance: '20 km',
    passengers: '1–4 passengers',
    price: 15000,
    largeGroupPrice: 18000,
    features: ['Direct route', 'Flight tracking', 'Luggage storage assistance', 'Meet & greet'],
    popular: true,
    active: true,
    sortOrder: 1,
  },
  {
    name: 'KEF ↔ Cappadocia (5–8 pax)',
    category: 'AIRPORT_BLUE_LAGOON',
    from: 'Istanbul International Airport',
    to: 'Cappadocia, Cappadocia',
    description: 'Large group direct transfer between Istanbul Airport and the Cappadocia.',
    duration: '20–25 min',
    distance: '20 km',
    passengers: '5–8 passengers',
    price: 18000,
    largeGroupPrice: 0,
    features: ['Direct route', 'Flight tracking', 'Luggage storage assistance', 'Spacious van'],
    popular: false,
    active: true,
    sortOrder: 2,
  },

  // ── BLUE LAGOON PACKAGES ─────────────────────────────────────
  {
    name: 'Istanbul → Cappadocia (One-way)',
    category: 'BLUE_LAGOON',
    from: 'Istanbul',
    to: 'Cappadocia, Cappadocia',
    description: 'One-way private transfer from Istanbul to the Cappadocia.',
    duration: '50 min',
    distance: '48 km',
    passengers: '1–4 passengers',
    price: 20000,
    largeGroupPrice: 25000,
    features: ['Door-to-door pickup', 'Professional driver', 'Free WiFi', 'Luggage assistance'],
    popular: false,
    active: true,
    sortOrder: 1,
  },
  {
    name: 'Istanbul ↔ Cappadocia (Roundtrip)',
    category: 'BLUE_LAGOON',
    from: 'Istanbul',
    to: 'Cappadocia, Cappadocia',
    description: 'Roundtrip private transfer between Istanbul and the Cappadocia.',
    duration: '50 min each way',
    distance: '48 km each way',
    passengers: '1–4 passengers',
    price: 39000,
    largeGroupPrice: 48000,
    features: ['Door-to-door service', 'Wait & return', 'Free WiFi', 'Luggage assistance'],
    popular: true,
    active: true,
    sortOrder: 2,
  },
  {
    name: 'KEF → Cappadocia → Istanbul',
    category: 'BLUE_LAGOON',
    from: 'Istanbul International Airport',
    to: 'Istanbul (via Cappadocia)',
    description: 'Arrive at KEF, relax at Cappadocia, continue to Istanbul. Perfect for arrivals.',
    duration: '~3 hours',
    distance: '68 km total',
    passengers: '1–4 passengers',
    price: 40000,
    largeGroupPrice: 50000,
    features: ['Flight tracking', 'Luggage storage at lagoon', 'Door-to-door final drop', 'Free WiFi'],
    popular: false,
    active: true,
    sortOrder: 3,
  },
  {
    name: 'Istanbul → Cappadocia → KEF',
    category: 'BLUE_LAGOON',
    from: 'Istanbul',
    to: 'Istanbul International Airport (via Cappadocia)',
    description: 'Start in Istanbul, enjoy the Cappadocia, then depart from KEF. Perfect for departures.',
    duration: '~3 hours',
    distance: '68 km total',
    passengers: '1–4 passengers',
    price: 40000,
    largeGroupPrice: 50000,
    features: ['Hotel pickup', 'Luggage storage at lagoon', 'Airport drop-off', 'Free WiFi'],
    popular: false,
    active: true,
    sortOrder: 4,
  },

  // ── PRIVATE TRANSFERS ────────────────────────────────────────
  {
    name: 'Istanbul ↔ Cappadocia',
    category: 'PRIVATE_TRANSFER',
    from: 'Istanbul',
    to: 'Cappadocia, Cappadocia',
    description: 'Private transfer between Istanbul and the Cappadocia.',
    duration: '50 min',
    distance: '48 km',
    passengers: '1–4 passengers',
    price: 20000,
    largeGroupPrice: 25000,
    features: ['Door-to-door service', 'Professional driver', 'Free WiFi', 'Child seats available'],
    popular: true,
    active: true,
    sortOrder: 1,
  },
  {
    name: 'Istanbul City Transfer',
    category: 'PRIVATE_TRANSFER',
    from: 'Istanbul',
    to: 'Any Istanbul location',
    description: 'Private transfer within the Istanbul city area.',
    duration: '15–30 min',
    distance: 'Varies',
    passengers: '1–4 passengers',
    price: 10500,
    largeGroupPrice: 14000,
    features: ['Any pickup/drop-off', 'Professional driver', 'Free WiFi', 'Card payment'],
    popular: false,
    active: true,
    sortOrder: 2,
  },
  {
    name: 'Istanbul ↔ Cappadocia (Large Group)',
    category: 'PRIVATE_TRANSFER',
    from: 'Istanbul',
    to: 'Cappadocia, Cappadocia',
    description: 'Large group private transfer between Istanbul and the Cappadocia.',
    duration: '50 min',
    distance: '48 km',
    passengers: '5–8 passengers',
    price: 25000,
    largeGroupPrice: 0,
    features: ['Spacious van', 'Door-to-door service', 'Free WiFi', 'Luggage assistance'],
    popular: false,
    active: true,
    sortOrder: 3,
  },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: { name: string; status: string }[] = [];

    for (const t of transfersData) {
      const existing = await prisma.transferRoute.findFirst({
        where: { name: t.name, category: t.category },
      });
      if (existing) {
        await prisma.transferRoute.update({
          where: { id: existing.id },
          data: { largeGroupPrice: t.largeGroupPrice },
        });
        results.push({ name: t.name, status: 'updated largeGroupPrice' });
      } else {
        await prisma.transferRoute.create({ data: t });
        results.push({ name: t.name, status: 'created' });
      }
    }

    return NextResponse.json({ message: 'Transfer seed complete', results });
  } catch (error) {
    console.error('Seed transfers error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
