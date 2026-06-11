# Iceland Taxi & Tours

A complete Next.js 14+ application for a premium taxi and tour service in Iceland. Features include online booking, payment processing with Stripe, admin dashboard, and full SEO optimization.

## Features

- **Public Website**
  - Homepage with booking widget
  - Tours catalog with filters
  - Multi-step booking flow
  - Pricing page with FAQ
  - About and Contact pages

- **Admin Dashboard**
  - Dashboard overview with stats
  - Booking management
  - Driver management
  - Fleet management
  - Settings

- **Payment System**
  - Stripe integration
  - Secure checkout
  - Webhook handling for payment status

- **SEO & Marketing**
  - Google Analytics integration
  - Google Tag Manager support
  - Google Ads conversion tracking
  - Sitemap generation
  - Meta tags optimization

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Google Analytics/Tag Manager accounts (optional)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables by editing `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/iceland_taxi_tours"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Google Tag Manager
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"

# Google Ads
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-XXXXXXXXXX"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

3. Set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Access

After seeding the database, you can access the admin panel at `/admin/login`:

- **Email**: admin@icetaxi.is
- **Password**: admin123

## Project Structure

```
src/
├── app/
│   ├── (main)/           # Public pages (home, tours, booking, etc.)
│   ├── admin/            # Admin dashboard pages
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # Reusable components
│   ├── ui/              # UI components (Button, Card, Input, etc.)
│   ├── forms/           # Form components
│   └── admin/           # Admin-specific components
├── lib/                  # Utility functions and configurations
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Prisma client
│   ├── stripe.ts        # Stripe utilities
│   ├── utils.ts         # Helper functions
│   └── validations.ts   # Zod schemas
└── types/               # TypeScript type definitions
```

## Stripe Webhook Setup

For local development, use Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

For production, set up a webhook endpoint in your Stripe dashboard pointing to:
`https://your-domain.com/api/stripe/webhook`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables
4. Deploy

### Other Platforms

Build the production version:

```bash
npm run build
npm start
```

## Google Ads & Analytics Setup

1. **Google Analytics**: Create a GA4 property and add the Measurement ID to `NEXT_PUBLIC_GA_MEASUREMENT_ID`

2. **Google Tag Manager**: Create a container and add the ID to `NEXT_PUBLIC_GTM_ID`

3. **Google Ads**:
   - Add your Conversion ID to `NEXT_PUBLIC_GOOGLE_ADS_ID`
   - Update the conversion label in `src/lib/analytics.ts`

## License

This project is private and proprietary.

## Support

For questions or support, contact: support@icetaxi.is
# TaxiProject
# TravelStoreTurkey
