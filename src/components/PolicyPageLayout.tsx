import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';

interface PolicyPageLayoutProps {
  title: string;
  slug: string;
  updatedAt: Date | null;
  content: string;
}

const policyPages = [
  { title: 'Refund Policy', slug: 'refund-policy' },
  { title: 'Privacy Policy', slug: 'privacy-policy' },
  { title: 'Terms & Conditions', slug: 'terms-and-conditions' },
  { title: 'Cookie Policy', slug: 'cookie-policy' },
];

export function PolicyPageLayout({ title, slug, updatedAt, content }: PolicyPageLayoutProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Hero */}
      <div className="bg-secondary text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="size-4" />
            <span className="text-primary">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{title}</h1>
              {updatedAt && (
                <p className="text-slate-400 text-sm mt-1">
                  Last updated: {new Date(updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 sticky top-24">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Legal Pages</p>
            <nav className="flex flex-col gap-1">
              {policyPages.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${p.slug}`}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    p.slug === slug
                      ? 'bg-primary text-black font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 sm:p-10">
            <div
              className="prose prose-slate dark:prose-invert max-w-none
                prose-h2:text-xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:dark:text-white prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-h2:dark:border-slate-700
                prose-h3:text-base prose-h3:font-semibold prose-h3:text-slate-800 prose-h3:dark:text-slate-200 prose-h3:mt-5 prose-h3:mb-2
                prose-p:text-slate-600 prose-p:dark:text-slate-300 prose-p:leading-relaxed prose-p:mb-3
                prose-ul:text-slate-600 prose-ul:dark:text-slate-300 prose-ul:my-3
                prose-li:mb-1.5
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-slate-900 prose-strong:dark:text-white"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          {/* Quick contact */}
          <div className="mt-6 bg-primary/10 dark:bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-1">Have a question about this policy?</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Our team is available 24/7 to help you.</p>
            </div>
            <a
              href="mailto:booking@travelstoreturkey.com"
              className="shrink-0 px-5 py-2.5 bg-primary text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors text-sm"
            >
              Contact Us
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
