import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { OrganizationSchema } from '@/components/StructuredData';
import { Providers } from './providers';

// Elegant editorial serif for headings
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});



// Clean sans-serif for body
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F1E8' },
    { media: '(prefers-color-scheme: dark)', color: '#082F45' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'TravelStore Turkey | Turkey Tours, Packages & Airport Transfers',
    template: '%s | TravelStore Turkey',
  },
  description:
    'Book private Turkey tours, 3–4 day packages, airport transfers, taxi pickups, VIP vans and custom travel experiences with local experts.',
  keywords: [
    'Turkey tours',
    'Turkey travel packages',
    'Istanbul tour',
    'Cappadocia tour',
    'Istanbul airport transfer',
    'Sabiha Gokcen transfer',
    'Pamukkale tour',
    'private tours Turkey',
    'Turkey travel agency',
  ],
  authors: [{ name: 'TravelStore Turkey' }],
  creator: 'TravelStore Turkey',
  publisher: 'TravelStore Turkey',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'TravelStore Turkey',
    title: 'TravelStore Turkey | Turkey Tours, Packages & Airport Transfers',
    description:
      'Book private Turkey tours, 3–4 day packages, airport transfers and custom travel experiences with local experts.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TravelStore Turkey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TravelStore Turkey',
    description:
      'Private Turkey tours, 3–4 day packages, airport transfers and custom travel experiences with local experts.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
        <GoogleAnalytics />
        <OrganizationSchema />
      </body>
    </html>
  );
}
