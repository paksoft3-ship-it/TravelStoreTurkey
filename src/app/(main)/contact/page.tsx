import { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with TravelStore Turkey. 24/7 customer support for bookings, inquiries, and assistance.',
};

export default function ContactPage() {
  return (
    <div className="py-12 sm:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="section-title">Get in Touch</h1>
          <p className="section-subtitle">
            Have questions? We're here to help 24/7. Reach out to us through any of
            the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-8 shadow-card">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MapPin className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Address</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Sultanahmet, Fatih, 34122 Istanbul, Turkey
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Phone className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Phone</h3>
                    <a
                      href="tel:+905301234567"
                      className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                      +90 530 123 45 67
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Email</h3>
                    <a
                      href="mailto:booking@travelstoreturkey.com"
                      className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                      booking@travelstoreturkey.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Operating Hours
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      24/7 - We're always available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl h-56 sm:h-72 lg:h-80 overflow-hidden shadow-card">
              <iframe
                src="https://maps.google.com/maps?q=Sultanahmet,%20Fatih,%20Istanbul,%20Turkey&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-8 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="size-6 text-primary" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Send us a Message
              </h2>
            </div>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+90 530 123 45 67"
                  className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Send className="size-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
