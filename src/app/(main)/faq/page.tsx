'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown, Search, HelpCircle, Car, MapPin, CreditCard, Clock, Shield, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

// FAQ categories and questions
const faqCategories = [
  {
    id: 'booking',
    name: 'Booking & Reservations',
    icon: Clock,
    questions: [
      {
        q: 'How do I book a taxi or tour?',
        a: 'You can book through our website using the booking form, call us directly, or send us a WhatsApp message. We recommend booking at least 24 hours in advance for airport transfers and tours, though we also accommodate last-minute requests when possible.',
      },
      {
        q: 'Can I modify or cancel my booking?',
        a: 'Yes, you can modify or cancel your booking up to 24 hours before the scheduled pickup time for a full refund. Cancellations within 24 hours may incur a 50% cancellation fee. For same-day cancellations, please contact us directly.',
      },
      {
        q: 'Do I need to pay in advance?',
        a: 'For most services, we accept payment upon completion of the ride. However, for tours and advance bookings, we may require a deposit to secure your reservation. We accept credit cards, debit cards, and cash (EUR, USD).',
      },
      {
        q: 'Will my driver wait if my flight is delayed?',
        a: 'Yes! For airport pickups, we monitor all flight arrivals in real-time. If your flight is delayed, your driver will wait at no extra charge. We track your flight automatically once you provide your flight number.',
      },
      {
        q: 'How far in advance should I book a tour?',
        a: 'We recommend booking tours at least 2-3 days in advance, especially during peak season (June-August) and for Hot Air Balloon tours. Popular tours can fill up quickly, so earlier booking is better.',
      },
    ],
  },
  {
    id: 'services',
    name: 'Services & Tours',
    icon: Car,
    questions: [
      {
        q: 'What types of vehicles do you offer?',
        a: 'We offer a range of vehicles including comfortable sedans for 1-3 passengers, spacious SUVs for up to 6 passengers, and luxury minivans for groups up to 8. All vehicles are well-maintained, heated, and equipped with Wi-Fi.',
      },
      {
        q: 'Do you offer child seats?',
        a: 'Yes, we provide child seats and booster seats free of charge. Please let us know the age and weight of your children when booking so we can prepare the appropriate seats.',
      },
      {
        q: 'Can I customize a tour itinerary?',
        a: 'Absolutely! We specialize in private, customizable tours. Our guides can adjust routes and stops based on your interests, whether you want to spend more time at ancient sites, explore hidden gems, or watch the sunrise hot-air balloons in Cappadocia.',
      },
      {
        q: 'What is included in your tours?',
        a: 'Our tours include private transportation, an English-speaking guide, hotel pickup and drop-off, entrance fees to listed sites, and specified meals. Multi-day packages also include domestic flights and 4-star accommodation with breakfast.',
      },
      {
        q: 'Do you offer airport transfers?',
        a: 'Yes, private airport transfers from Istanbul Airport (IST) and Sabiha Gökçen (SAW) to your hotel are our specialty. The journey takes approximately 45-60 minutes. We offer both private and shared transfer options.',
      },
    ],
  },
  {
    id: 'pricing',
    name: 'Pricing & Payment',
    icon: CreditCard,
    questions: [
      {
        q: 'How is the price calculated?',
        a: 'Prices are based on distance and type of service. Airport transfers have fixed prices, while tours are priced by duration and type. City taxi rides use a combination of base fare plus per-kilometer rate.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, Apple Pay, Google Pay, and cash in EUR or USD. Card payments are processed securely.',
      },
      {
        q: 'Are there any hidden fees?',
        a: 'No hidden fees! The price quoted is the price you pay. Tips are appreciated but not required. Additional stops or extended waiting time may incur extra charges, which will always be communicated upfront.',
      },
      {
        q: 'Do you offer group discounts?',
        a: 'Yes, we offer discounts for groups and multi-day bookings. Contact us directly for custom quotes for larger groups or extended tours.',
      },
      {
        q: 'Can I get a receipt for my business trip?',
        a: 'Yes, we provide detailed receipts for all rides, which can be emailed to you. These receipts include all necessary information for business expense reporting.',
      },
    ],
  },
  {
    id: 'locations',
    name: 'Destinations & Routes',
    icon: MapPin,
    questions: [
      {
        q: 'Where do you operate?',
        a: 'We operate throughout Turkey, with our main base in Istanbul. We cover all popular destinations including Cappadocia, Pamukkale, Ephesus, Gallipoli and the Mediterranean coast, and more. For remote locations, please contact us for availability.',
      },
      {
        q: 'How long does the Cappadocia tour take?',
        a: 'Our private Cappadocia day tours typically take 7-8 hours, including stops at the Göreme Open-Air Museum, the fairy chimneys of Paşabağ (Monks Valley), Devrent Valley and a traditional pottery workshop in Avanos. We can extend or shorten based on your preferences.',
      },
      {
        q: 'Do you offer multi-day tours across Turkey?',
        a: 'Yes! We offer multi-day packages such as our 6 Days Turkey Tour covering Gallipoli, Troy, Ephesus, Pamukkale and Cappadocia. These typically range from 4-10 days and can be fully customized. Accommodation and domestic flights are included.',
      },
      {
        q: 'Can you take us to Cappadocia?',
        a: 'Yes, Cappadocia trips are very popular. We can arrange a domestic flight from Istanbul plus private transfers, a guided tour on arrival, or a return transfer to the airport. Entrance tickets to some sites are extra, but we can advise on booking.',
      },
    ],
  },
  {
    id: 'safety',
    name: 'Safety & Policies',
    icon: Shield,
    questions: [
      {
        q: 'Are your drivers licensed?',
        a: 'All our drivers are fully licensed, professionally trained, and have extensive knowledge of Turkey\'s roads and weather conditions. Many have years of experience and speak multiple languages.',
      },
      {
        q: 'What happens in bad weather?',
        a: 'Safety is our priority. In severe weather conditions, we may need to modify routes or reschedule tours. For airport transfers, we closely monitor conditions and communicate any changes. In extreme cases, we offer full refunds or rebooking.',
      },
      {
        q: 'Is smoking allowed in your vehicles?',
        a: 'All our vehicles are non-smoking. This ensures a clean, comfortable environment for all passengers, especially those with allergies or sensitivities.',
      },
      {
        q: 'Can I bring luggage?',
        a: 'Yes! Our vehicles can accommodate standard luggage. For airport transfers, please let us know how many bags you have so we can ensure the right vehicle. Extra-large items may require a larger vehicle.',
      },
      {
        q: 'What COVID-19 measures are in place?',
        a: 'We follow all current health guidelines. Our vehicles are regularly sanitized, and we provide hand sanitizer. Masks are optional unless required by local regulations.',
      },
    ],
  },
  {
    id: 'contact',
    name: 'Contact & Support',
    icon: Phone,
    questions: [
      {
        q: 'How can I contact you?',
        a: 'You can reach us by phone (+90 530 123 45 67), WhatsApp, email (info@travelstoreturkey.com), or through the contact form on our website. We aim to respond to all inquiries within 2 hours during business hours.',
      },
      {
        q: 'What are your operating hours?',
        a: 'We operate 24/7 for airport transfers. For tours and city taxi services, we\'re available from 6:00 AM to midnight. After-hours services are available by prior arrangement.',
      },
      {
        q: 'Do you have a customer service hotline?',
        a: 'Yes, our customer service line (+90 530 123 45 67) is available 24/7 for emergencies and booking inquiries. For non-urgent matters, email or WhatsApp usually gets the fastest response.',
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  const toggleQuestion = (id: string) => {
    setOpenQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  // Filter questions based on search and category
  const filteredCategories = faqCategories
    .filter((cat) => activeCategory === 'all' || cat.id === activeCategory)
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (q) =>
          searchQuery === '' ||
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-secondary text-white py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center size-12 sm:size-16 bg-primary/20 rounded-2xl mb-4 sm:mb-6">
              <HelpCircle className="size-6 sm:size-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-300">
              Find answers to common questions about our taxi services, tours, booking process, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-20 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-600 outline-none transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                activeCategory === 'all'
                  ? 'bg-primary text-black'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
              )}
            >
              All Topics
            </button>
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  activeCategory === cat.id
                    ? 'bg-primary text-black'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                )}
              >
                <cat.icon className="size-4" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-4 bg-background-light dark:bg-background-dark">
        <div className="max-w-4xl mx-auto">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="size-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search or browse all categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-4 px-6 py-2 bg-primary text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <category.icon className="size-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {category.name}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {category.questions.map((faq, idx) => {
                      const questionId = `${category.id}-${idx}`;
                      const isOpen = openQuestions.includes(questionId);
                      return (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleQuestion(questionId)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <span className="font-medium text-slate-900 dark:text-white pr-4">
                              {faq.q}
                            </span>
                            <ChevronDown
                              className={cn(
                                'size-5 text-slate-400 shrink-0 transition-transform',
                                isOpen && 'rotate-180'
                              )}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4">
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {faq.a}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-10 sm:py-16 px-4 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-black mb-4">
            Still Have Questions?
          </h2>
          <p className="text-slate-800 mb-8">
            Can't find the answer you're looking for? Our friendly team is here to help.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="tel:+905301234567"
              className="px-8 py-3 bg-white/30 text-black font-bold rounded-xl hover:bg-white/50 transition-colors"
            >
              Call +90 530 123 45 67
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
