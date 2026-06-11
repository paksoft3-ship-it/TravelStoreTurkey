import { Metadata } from 'next';
import { ToursContent } from './ToursContent';

export const metadata: Metadata = {
  title: 'Private Tours',
  description:
    'Explore Turkey with our premium private tours. Cappadocia, Hot Air Balloon, South Coast, and custom tours tailored to your schedule.',
};

export default function ToursPage() {
  return <ToursContent />;
}
