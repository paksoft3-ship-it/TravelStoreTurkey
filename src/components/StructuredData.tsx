import Script from 'next/script';

// Organization structured data
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://travelstoreturkey.com/#organization',
    name: 'TravelStore Turkey',
    alternateName: 'TravelStore Turkey',
    description:
      'Private Turkey tours, 3–4 day packages, airport transfers, taxi pickups, VIP vans and custom travel experiences with local experts.',
    url: 'https://travelstoreturkey.com',
    logo: 'https://travelstoreturkey.com/logo-travelstore.webp',
    image: 'https://travelstoreturkey.com/og-image.jpg',
    telephone: '+90 530 123 45 67',
    email: 'booking@travelstoreturkey.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sultanahmet, Fatih',
      postalCode: '34122',
      addressLocality: 'Istanbul',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.0082,
      longitude: 28.9784,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    priceRange: '$$',
    sameAs: [
      'https://facebook.com/travelstoreturkey',
      'https://instagram.com/travelstoreturkey',
      'https://tripadvisor.com/travelstoreturkey',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '2000',
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Tour/Service structured data
interface TourSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  duration: string;
  url: string;
}

export function TourSchema({
  name,
  description,
  image,
  price,
  currency,
  duration,
  url,
}: TourSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name,
    description,
    image,
    url,
    provider: {
      '@type': 'LocalBusiness',
      name: 'TravelStore Turkey',
      '@id': 'https://travelstoreturkey.com/#organization',
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
    },
    touristType: 'Adventure tourist',
    itinerary: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Pickup from your accommodation',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: name,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Return to your accommodation',
        },
      ],
    },
  };

  return (
    <Script
      id={`tour-schema-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ structured data
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb structured data
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Service structured data
interface ServiceSchemaProps {
  name: string;
  description: string;
  price: number;
  currency: string;
  areaServed: string[];
}

export function ServiceSchema({
  name,
  description,
  price,
  currency,
  areaServed,
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'TravelStore Turkey',
      '@id': 'https://travelstoreturkey.com/#organization',
    },
    areaServed: areaServed.map((area) => ({
      '@type': 'City',
      name: area,
    })),
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
    },
  };

  return (
    <Script
      id={`service-schema-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Blog post structured data
interface BlogPostSchemaProps {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: string;
  url: string;
}

export function BlogPostSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author,
  url,
}: BlogPostSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image,
    datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TravelStore Turkey',
      logo: {
        '@type': 'ImageObject',
        url: 'https://travelstoreturkey.com/logo-travelstore.webp',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <Script
      id={`blog-schema-${title.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
