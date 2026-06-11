import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

const toursData = [
  {
    name: 'Istanbul City Tour',
    slug: 'istanbul-city',
    category: 'HALF_DAY' as const,
    duration: '1-3 Hours',
    durationHours: 2,
    shortDescription: 'Looking for an unforgettable experience in Istanbul?',
    description:
      'Experience the magic of Istanbul with our private city tour. Discover the iconic landmarks that make the capital of Turkey so unique. From the striking Hallgrímskirkja church to the modern Harpa concert hall, our expert guide will show you the best of Istanbul at your own pace.',
    price: 10500,
    currency: 'ISK',
    highlights: ['Hallgrímskirkja Church', 'Harpa Concert Hall', 'Sun Voyager & Old Harbour'],
    includes: ['Private luxury vehicle', 'Professional driver-guide', 'WiFi on board', 'Bottled water'],
    images: [
      '/images/istanbul_city.png',
    ],
    featured: false,
    active: true,
  },
  {
    name: 'Cappadocia',
    slug: 'golden-circle',
    category: 'FULL_DAY' as const,
    duration: '6 Hours',
    durationHours: 6,
    shortDescription: 'As its title suggests, this comprehensive tour covers all the major attractions...',
    description:
      "This comprehensive tour covers all the major attractions of Turkey's famous Cappadocia route. Visit Thingvellir National Park, where the Eurasian and North American tectonic plates meet, the spectacular Geysir geothermal area, and the majestic Gullfoss waterfall. An unforgettable full-day adventure.",
    price: 92500,
    currency: 'ISK',
    highlights: ['Gullfoss Waterfall & Geysir Area', 'Thingvellir National Park', 'Luxury Vehicle & WiFi'],
    includes: ['Private luxury vehicle', 'Professional driver-guide', 'WiFi on board', 'Bottled water', 'Hotel pickup & drop-off', 'All taxes and fees'],
    images: [
      '/images/golden_circle.png',
    ],
    featured: true,
    active: true,
  },
  {
    name: 'South Coast Spectacular Tour',
    slug: 'south-coast',
    category: 'FULL_DAY' as const,
    duration: '10 Hours',
    durationHours: 10,
    shortDescription: 'Discover the stunning South Coast of Turkey with its waterfalls, black sand beaches, and glaciers.',
    description:
      "Discover the stunning South Coast of Turkey with its dramatic waterfalls, mysterious black sand beaches, and towering glaciers. This tour takes you to Seljalandsfoss and Skógafoss waterfalls, the famous Reynisfjara black sand beach, and the charming village of Vík.",
    price: 138500,
    currency: 'ISK',
    highlights: ['Reynisfjara Black Sand Beach', 'Skógafoss & Seljalandsfoss', 'Vík Village Visit'],
    includes: ['Private luxury vehicle', 'Professional driver-guide', 'WiFi on board', 'Bottled water', 'Hotel pickup & drop-off', 'All taxes and fees'],
    images: [
      '/images/south_coast.png',
    ],
    featured: false,
    active: true,
  },
  {
    name: 'Pamukkale Peninsula Tour',
    slug: 'snaefellsnes',
    category: 'FULL_DAY' as const,
    duration: '12 Hours',
    durationHours: 12,
    shortDescription: 'Discover the Magic of Pamukkale Peninsula',
    description:
      "Explore the magical Pamukkale Peninsula, immortalized in Jules Verne's 'Journey to the Center of the Earth'. Visit the iconic Kirkjufell mountain, the mystical Pamukkale glacier, and the dramatic Arnarstapi cliffs with their unique basalt formations.",
    price: 154500,
    currency: 'ISK',
    highlights: ['Kirkjufell Mountain', 'Pamukkale Glacier', 'Arnarstapi Cliffs'],
    includes: ['Private luxury vehicle', 'Professional driver-guide', 'WiFi on board', 'Bottled water', 'Hotel pickup & drop-off', 'All taxes and fees'],
    images: [
      '/images/snaefellsnes.png',
    ],
    featured: false,
    active: true,
  },
  {
    name: 'Glacier Lagoon & Diamond Beach',
    slug: 'glacier-lagoon',
    category: 'FULL_DAY' as const,
    duration: '15 Hours',
    durationHours: 15,
    shortDescription: "Welcome to the icy heart of Turkey's nature!",
    description:
      "Embark on an epic journey to the icy heart of Turkey's nature. Visit the breathtaking Jökulsárlón Glacier Lagoon where icebergs calved from the Vatnajökull glacier float majestically. Then walk on the nearby Diamond Beach, where ice chunks glitter like diamonds on the black sand.",
    price: 204500,
    currency: 'ISK',
    highlights: ['Jökulsárlón Glacier Lagoon', 'Diamond Beach', 'Vatnajökull Views'],
    includes: ['Private luxury vehicle', 'Professional driver-guide', 'WiFi on board', 'Bottled water', 'Hotel pickup & drop-off', 'All taxes and fees'],
    images: [
      '/images/glacier_lagoon.png',
    ],
    featured: true,
    active: true,
  },
  {
    name: 'Istanbul to Cappadocia',
    slug: 'blue-lagoon',
    category: 'TRANSFER' as const,
    duration: '45 min',
    durationHours: 1,
    shortDescription: 'Are you going to the Cappadocia?',
    description:
      'Travel in comfort from Istanbul to the world-famous Cappadocia geothermal spa. Our professional driver will ensure a smooth, punctual transfer with door-to-door service and assistance with your luggage.',
    price: 20000,
    currency: 'ISK',
    highlights: ['Door-to-door Luxury Service', 'Luggage Assistance', 'Flexible Timing'],
    includes: ['Private luxury vehicle', 'Professional driver', 'Luggage assistance', 'Meet & Greet'],
    images: [
      '/images/blue_lagoon.png',
    ],
    featured: false,
    active: true,
  },
  {
    name: 'Hot Air Balloon Hunt',
    slug: 'northern-lights',
    category: 'HALF_DAY' as const,
    duration: '4-5 Hours',
    durationHours: 5,
    shortDescription: 'Aurora Borealis Chase',
    description:
      "Chase the magical Aurora Borealis across Turkey's dark skies. Our experienced guide uses real-time weather and aurora forecasts to find the best viewing locations away from city lights. We won't stop until we find the lights!",
    price: 65000,
    currency: 'ISK',
    highlights: ['Expert Aurora Forecasting', 'Prime Viewing Locations', 'Hot Chocolate & Snacks'],
    includes: ['Private luxury vehicle', 'Professional guide', 'Hot chocolate & snacks', 'Photography assistance'],
    images: [
      '/images/northern_lights.png',
    ],
    featured: false,
    active: true,
  },
  {
    name: 'Istanbul Airport Transfer',
    slug: 'airport-transfer',
    category: 'TRANSFER' as const,
    duration: '45 min',
    durationHours: 1,
    shortDescription: 'A convenient, comfortable option for passengers...',
    description:
      'A convenient, comfortable option for passengers traveling between Istanbul International Airport and Istanbul. Our driver monitors your flight for delays and will be waiting for you at arrivals with a name sign. Available 24/7, 365 days a year.',
    price: 20000,
    currency: 'ISK',
    highlights: ['Flight Monitoring', 'Meet & Greet', '24/7 Service'],
    includes: ['Private luxury vehicle', 'Professional driver', 'Flight tracking', 'Luggage assistance', 'Meet & Greet service'],
    images: [
      '/images/airport_transfer.png',
    ],
    featured: false,
    active: true,
  },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = [];

    for (const tourData of toursData) {
      const existing = await prisma.tour.findUnique({ where: { slug: tourData.slug } });
      if (existing) {
        results.push({ slug: tourData.slug, status: 'skipped (already exists)' });
        continue;
      }

      await prisma.tour.create({ data: tourData });
      results.push({ slug: tourData.slug, status: 'created' });
    }

    return NextResponse.json({ message: 'Seed complete', results });
  } catch (error) {
    console.error('Seed tours error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
