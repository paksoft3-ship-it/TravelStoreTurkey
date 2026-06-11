import type { TourCategory } from '@/types';

/**
 * Static Turkey travel packages for the TravelStore Turkey demo.
 *
 * These drive the homepage "Recently Added Packages" section, the booking
 * widget package selector, and the /tours/[slug] detail page without any
 * database dependency, so the demo runs end-to-end (listing -> detail ->
 * booking) out of the box.
 *
 * The shape mirrors the Prisma `Tour` model used by the detail page so the
 * existing UI renders unchanged, plus a few extra fields (itinerary, excluded,
 * rating) used by the richer package detail layout.
 */
export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface TravelPackage {
  id: string;
  name: string;
  slug: string;
  category: TourCategory;
  duration: string;
  durationHours: number;
  shortDescription: string;
  description: string;
  price: number;
  largeGroupPrice: number;
  currency: string;
  images: string[];
  highlights: string[];
  includes: string[];
  excluded: string[];
  itinerary: ItineraryDay[];
  destinations: string[];
  featured: boolean;
  active: boolean;
  // Card-only metadata
  badge?: {
    text: string;
    type: 'popular' | 'seasonal' | 'transfer';
  };
  location?: string;
  rating?: number;
  reviews?: number;
}

export const packages: TravelPackage[] = [
  {
    id: 'pkg-6-days-turkey-tour',
    name: '6 Days Turkey Tour – Best Turkey Tour Package',
    slug: '6-days-turkey-tour',
    category: 'MULTI_DAY',
    duration: '6 Days / 5 Nights',
    durationHours: 144,
    shortDescription:
      'Gallipoli, Troy, Pergamon, Ephesus, Pamukkale & Cappadocia — the ultimate guided journey through Turkey’s greatest sites.',
    description: `Discover the very best of Turkey on this comprehensive 6-day guided tour that weaves together the country’s most significant historical and natural treasures.

Travel from the moving WWI battlefields of Gallipoli to the legendary ruins of Troy, the towering Acropolis of Pergamon and the marble streets of Ephesus — one of the best-preserved ancient cities in the world. Bathe in the dazzling white travertine terraces of Pamukkale, then fly to Cappadocia to wander a surreal landscape of fairy chimneys, cave churches and underground cities, with an optional sunrise hot-air balloon flight.

Throughout the journey you travel with expert local guides, stay in carefully selected 4-star and cave boutique hotels, and enjoy domestic flights, daily breakfasts and many included meals. A truly complete introduction to Turkey’s history, culture and natural wonders.

A best seller on TripAdvisor — and a portion of every tour supports UNICEF and local shelters.`,
    price: 1520,
    largeGroupPrice: 1390,
    currency: 'EUR',
    images: [
      '/images/packages/turkey6-main.webp',
      '/images/packages/turkey6-canakkale-memorial.webp',
      '/images/packages/turkey6-cappadocia-cave.webp',
      '/images/packages/turkey6-gallipoli-cemetery.webp',
      '/images/packages/turkey6-anzac-ceremony.webp',
    ],
    highlights: [
      'Guided WWI battlefields tour at Gallipoli',
      'Troy’s ancient ruins & the Trojan Horse',
      'Pergamon Acropolis, Library & Altar of Zeus',
      'Ephesus marble streets & Celsus Library',
      'Pamukkale’s white travertine terraces & Hierapolis',
      'Cappadocia fairy chimneys & optional balloon ride',
    ],
    includes: [
      'Airport transfers',
      'Domestic flight tickets with taxes',
      'Luxury bus transportation',
      'Cave boutique hotel in Cappadocia (2 nights, breakfast)',
      'Hotel in Kuşadası (2 nights, breakfast)',
      'Hotel in Çanakkale/Eceabat (1 night, breakfast)',
      'Professional licensed guides & entrance fees',
      'Specified meals (breakfasts, lunches, dinner)',
      'Full travel insurance · vegetarian options',
    ],
    excluded: [
      'Personal expenses',
      'Dinners not mentioned in the itinerary',
      'Alcoholic beverages',
      'Tips for driver and guide',
      'Optional hot-air balloon ride',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Gallipoli Tour from Istanbul · Overnight in Çanakkale',
        description:
          'Early pickup from your Istanbul hotel and a scenic drive to the Gallipoli Peninsula. After lunch in Eceabat, an expert guide leads you through the battlefields, trenches and memorials, sharing the stories of Mustafa Kemal Atatürk and the ANZAC forces. Evening transfer to your hotel in Çanakkale.',
      },
      {
        day: 2,
        title: 'Troy & Pergamon · Transfer to Kuşadası',
        description:
          'Explore the ancient city of Troy (levels I–IX), its 3,700-year-old walls and the life-size Trojan Horse. After lunch, discover Pergamon’s Acropolis, Library, Temples of Athena and Trajan, the Altar of Zeus and the steep Hellenistic theatre, before transferring to Kuşadası.',
      },
      {
        day: 3,
        title: 'Pamukkale & Hierapolis · Overnight in Kuşadası',
        description:
          'Drive to Pamukkale and tour the UNESCO-listed ancient city of Hierapolis — the Temple of Apollo, grand Roman theatre and Martyrion of St. Philip — then walk the famous white travertine terraces. Free time to swim in the antique Cleopatra’s Pool before returning to Kuşadası.',
      },
      {
        day: 4,
        title: 'Ephesus · Evening Flight to Cappadocia',
        description:
          'A fully guided tour of Ephesus: the site of the Temple of Artemis (one of the Seven Wonders of the Ancient World), the Grand Amphitheatre, the Celsus Library and the House of the Virgin Mary. Transfer to Izmir Airport for your flight to Cappadocia, with greeting and hotel transfer on arrival.',
      },
      {
        day: 5,
        title: 'Optional Balloon Ride & Cappadocia Green Tour',
        description:
          'Begin with an optional sunrise hot-air balloon flight over the fairy chimneys and valleys. The Green Tour explores southern Cappadocia, including Uçhisar Castle and a scenic hike through the Rose Valley (Kızılçukur) past red rock formations and ancient cave dwellings.',
      },
      {
        day: 6,
        title: 'Cappadocia Red Tour · Return Flight to Istanbul',
        description:
          'The Red Tour visits the UNESCO-listed Göreme Open-Air Museum and its cave churches, a traditional pottery workshop in Avanos, the Çavuşin village, Devrent (Imagination) Valley and the Paşabağ (Monks Valley) fairy chimneys. Evening transfer to the airport for your return flight to Istanbul.',
      },
    ],
    destinations: [
      'Istanbul',
      'Gallipoli',
      'Çanakkale',
      'Troy',
      'Pergamon',
      'Kuşadası',
      'Pamukkale',
      'Ephesus',
      'Cappadocia',
    ],
    featured: true,
    active: true,
    badge: { text: '6 Days', type: 'popular' },
    location: 'Istanbul → Cappadocia',
    rating: 4.9,
    reviews: 412,
  },
];

export function getPackageBySlug(slug: string): TravelPackage | undefined {
  return packages.find((p) => p.slug === slug && p.active);
}

export function getPackageSlugs(): string[] {
  return packages.filter((p) => p.active).map((p) => p.slug);
}

/** Lightweight shape for the booking widget package selector. */
export function getPackageOptions() {
  return packages
    .filter((p) => p.active)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      largeGroupPrice: p.largeGroupPrice,
      currency: p.currency,
    }));
}
