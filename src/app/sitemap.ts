import { MetadataRoute } from 'next';
import prisma from '@/lib/db';
import { getPackageSlugs } from '@/data/packages';

// Static pages
const staticPages = [
  { path: '', priority: 1, changeFrequency: 'weekly' as const },
  { path: '/tours', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/booking', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
];

// Static tour/package pages (fallback when the database is unavailable)
const tourPages = getPackageSlugs();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelstoreturkey.com';
  const now = new Date();

  // Static pages
  const staticSitemap: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Tour pages
  const tourSitemap: MetadataRoute.Sitemap = tourPages.map((slug) => ({
    url: `${baseUrl}/tours/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic tour pages from database
  let dynamicTours: MetadataRoute.Sitemap = [];
  try {
    const tours = await prisma.tour.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });

    dynamicTours = tours.map((tour) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: tour.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    // Database might not be available during build
    console.log('Could not fetch tours from database for sitemap');
  }

  // Combine all sitemaps, using database tours if available, otherwise static
  const allTours = dynamicTours.length > 0 ? dynamicTours : tourSitemap;

  return [
    ...staticSitemap,
    ...allTours,
  ];
}
