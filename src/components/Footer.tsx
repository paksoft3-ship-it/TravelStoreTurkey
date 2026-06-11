import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';

const quickLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Packages', href: '/tours' },
  { name: 'Reviews', href: '/reviews' },
  { name: 'Blog', href: '/blog' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

const serviceLinks = [
  { name: '6 Days Turkey Tour', href: '/tours/6-days-turkey-tour' },
  { name: 'Istanbul City Tour', href: '/tours' },
  { name: 'Cappadocia Tour', href: '/tours' },
  { name: 'Airport Transfers', href: '/booking?type=AIRPORT_TRANSFER' },
  { name: 'Custom Packages', href: '/contact' },
];

const WHATSAPP = '905301234567';

export function Footer() {
  return (
    <footer className="bg-navyDark text-slate-300 py-10 md:py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-5">
              <span className="font-display text-2xl font-bold text-white">
                TravelStore<span className="text-gold"> Turkey</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              Private Turkey tours, 3–4 day packages, airport transfers and custom
              travel experiences — crafted by local experts to make your journey
              effortless and memorable.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="size-10 rounded-full bg-white/5 hover:bg-terracotta hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="size-5" />
              </a>
              <a
                href="#"
                className="size-10 rounded-full bg-white/5 hover:bg-terracotta hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-terracotta transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-6">Our Services</h4>
            <ul className="space-y-4 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-terracotta transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-whatsapp/90 hover:bg-whatsapp text-white font-semibold text-sm px-4 py-2.5 rounded-lg mb-6 transition-colors"
            >
              <Phone className="size-4" />
              WhatsApp Us · 24/7
            </a>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="size-5 text-gold mt-0.5 shrink-0" />
                <span>Sultanahmet, Fatih, 34122 Istanbul, Türkiye</span>
              </li>
              <li>
                <a
                  href="tel:+905301234567"
                  className="flex items-center gap-3 hover:text-terracotta transition-colors"
                >
                  <Phone className="size-5 text-gold shrink-0" />
                  <span>+90 530 123 45 67</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:booking@travelstoreturkey.com"
                  className="flex items-center gap-3 hover:text-terracotta transition-colors"
                >
                  <Mail className="size-5 text-gold shrink-0" />
                  <span>booking@travelstoreturkey.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} TravelStore Turkey. All rights reserved.</p>

          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <Link href="/refund-policy" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
