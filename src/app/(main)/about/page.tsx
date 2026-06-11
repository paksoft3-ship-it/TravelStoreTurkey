import { Metadata } from 'next';
import Image from 'next/image';
import { Shield, Award, Users, Clock, Car, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about TravelStore Turkey - your trusted partner for premium transportation and private tours across Turkey.',
};

const values = [
  {
    icon: Shield,
    title: 'Safety First',
    description:
      'All our vehicles are regularly inspected and maintained. Our drivers are licensed and trained professionals.',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description:
      'We offer only the best vehicles in our fleet, ensuring comfort and style for every journey.',
  },
  {
    icon: Users,
    title: 'Local Expertise',
    description:
      'Our team consists of local Turkeyers who know every corner of this beautiful country.',
  },
  {
    icon: Clock,
    title: '24/7 Service',
    description:
      "Whether it's midnight or early morning, we're always available when you need us.",
  },
];

const stats = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '15+', label: 'Premium Vehicles' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '24/7', label: 'Support Available' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-secondary">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6">
            Your Trusted Partner in <span className="text-primary">Turkey</span>
          </h1>
          <p className="text-slate-200 text-lg max-w-2xl mx-auto">
            Since 2018, we've been providing premium transportation services across
            Turkey, connecting travelers with unforgettable experiences.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="section-title">Our Story</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              TravelStore Turkey was founded with a simple mission: to provide
              visitors with the most comfortable and reliable way to explore
              Turkey. What started as a small family business has grown into
              one of the country's most trusted transportation providers.
            </p>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Our team of local drivers are not just chauffeurs - they're
              ambassadors of Turkey, passionate about sharing the natural
              wonders and hidden gems of their homeland with every guest.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              From airport transfers to custom multi-day tours, we pride
              ourselves on delivering exceptional service with a personal touch.
            </p>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/images/cappadocia.jpg"
              alt="Hot air balloons over Cappadocia, Turkey"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                  {stat.value}
                </p>
                <p className="text-slate-800 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Values</h2>
            <p className="section-subtitle">
              What drives us every day to deliver the best experience for our
              guests.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card text-center"
              >
                <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="size-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Fleet</h2>
            <p className="section-subtitle">
              Premium vehicles for every occasion, from luxury sedans to
              spacious minibuses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Mercedes V-Class', capacity: '1-7 passengers', type: 'Luxury Van' },
              { name: 'Tesla Model Y', capacity: '1-4 passengers', type: 'Electric SUV' },
              { name: 'Land Rover Defender', capacity: '1-5 passengers', type: 'Adventure SUV' },
            ].map((vehicle) => (
              <div
                key={vehicle.name}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card"
              >
                <div className="h-48 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <Car className="size-16 text-slate-400" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {vehicle.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {vehicle.type} • {vehicle.capacity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="size-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Explore Turkey?
          </h2>
          <p className="text-slate-300 mb-8">
            Let us be your guide to the wonders of Turkey. Book your journey
            today and create memories that last a lifetime.
          </p>
          <a
            href="/booking"
            className="btn-primary inline-flex items-center gap-2"
          >
            Book Your Journey
          </a>
        </div>
      </section>
    </>
  );
}
