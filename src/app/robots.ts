import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelstoreturkey.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/booking/payment', '/booking/confirmation'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
