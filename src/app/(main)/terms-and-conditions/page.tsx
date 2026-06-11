import { Metadata } from 'next';
import prisma from '@/lib/db';
import { PolicyPageLayout } from '@/components/PolicyPageLayout';
import { getDefaultPage } from '@/lib/defaultPages';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Terms & Conditions | TravelStore Turkey',
  description: 'Terms and conditions for using TravelStore Turkey services in Turkey.',
};

const SLUG = 'terms-and-conditions';

export default async function TermsAndConditionsPage() {
  const dbPage = await prisma.page.findUnique({ where: { slug: SLUG } }).catch(() => null);
  const fallback = getDefaultPage(SLUG)!;

  const title = dbPage?.title ?? fallback.title;
  const content = dbPage?.content ?? fallback.content;
  const updatedAt = dbPage?.updatedAt ?? null;

  return <PolicyPageLayout title={title} slug={SLUG} updatedAt={updatedAt} content={content} />;
}
