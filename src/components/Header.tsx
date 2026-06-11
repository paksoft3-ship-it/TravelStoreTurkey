'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X, Phone } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Packages', href: '/tours' },
  { name: 'Airport Transfers', href: '/booking?type=AIRPORT_TRANSFER&from=nav' },
  { name: 'Destinations', href: '/tours' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const PHONE = '+90 530 123 45 67';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white text-navy border-b border-borderSoft shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-travelstore.webp"
              alt="TravelStore Turkey"
              width={150}
              height={48}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium text-navy/80 hover:text-terracotta transition-colors',
                  pathname === item.href && 'text-terracotta'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${PHONE.replace(/\s/g, '')}`}
              className="hidden lg:flex items-center gap-2 text-sm font-semibold text-navy hover:text-terracotta transition-colors"
            >
              <Phone className="size-4 text-terracotta" />
              {PHONE}
            </a>
            <Link
              href="/booking"
              className="hidden sm:inline-flex items-center justify-center h-10 px-6 bg-terracotta hover:bg-terracotta-dark text-white text-sm font-bold rounded-lg transition-colors shadow-md shadow-terracotta/20"
            >
              Book Now
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-navy hover:text-terracotta"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-borderSoft py-4">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium text-navy/80 hover:text-terracotta transition-colors py-2',
                    pathname === item.href && 'text-terracotta'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <a
                href={`tel:${PHONE.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-sm font-semibold text-navy py-2"
              >
                <Phone className="size-4 text-terracotta" />
                {PHONE}
              </a>
              <Link
                href="/booking"
                className="btn-primary text-center mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
