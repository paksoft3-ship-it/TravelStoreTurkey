import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, User, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import prisma from '@/lib/db';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Travel tips, Turkey guides, and news from TravelStore Turkey. Discover the best places to visit, Hot Air Balloon hunting tips, and more.',
};

const categories = ['All', 'Travel Tips', 'Destinations', 'News', 'Local Guide'];

async function getPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        category: true,
        author: true,
        publishedAt: true,
        views: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();
  const featuredPosts = posts.slice(0, 2);
  const regularPosts = posts.slice(2);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-secondary text-white py-10 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Travel Blog & <span className="text-primary">Turkey Guide</span>
            </h1>
            <p className="text-lg text-slate-300">
              Discover travel tips, destination guides, and insider knowledge to make the most of your Turkey adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  category === 'All'
                    ? 'bg-primary text-black'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="py-20 px-4 text-center">
          <p className="text-slate-500 text-lg">No blog posts published yet. Check back soon!</p>
        </section>
      ) : (
        <>
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="py-12 px-4 bg-background-light dark:bg-background-dark">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Featured Articles</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredPosts.map((post, index) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className={cn('group relative overflow-hidden rounded-2xl', index === 0 ? 'lg:row-span-2' : '')}
                    >
                      <div className={cn('relative', index === 0 ? 'h-[400px] lg:h-full' : 'h-[250px]')}>
                        {post.featuredImage ? (
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-black text-xs font-bold rounded-full mb-3">
                          <Tag className="size-3" />
                          {post.category}
                        </span>
                        <h3 className={cn('font-bold text-white mb-2 group-hover:text-primary transition-colors', index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl')}>
                          {post.title}
                        </h3>
                        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="size-3" />
                            {post.author}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All Posts */}
          {regularPosts.length > 0 && (
            <section className="py-12 px-4 bg-white dark:bg-slate-800">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Latest Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group bg-slate-50 dark:bg-slate-700/50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative h-48">
                        {post.featuredImage ? (
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-700" />
                        )}
                      </div>
                      <div className="p-6">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full mb-3">
                          {post.category}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="size-3" />
                            {post.author}
                          </span>
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Newsletter CTA */}
      <section className="py-10 sm:py-16 px-4 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-black mb-4">
            Get Turkey Travel Tips in Your Inbox
          </h2>
          <p className="text-slate-800 mb-8">
            Subscribe to our newsletter for exclusive travel tips, special offers, and Hot Air Balloon alerts.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-black/10 bg-white/50 text-black placeholder:text-black/50 focus:outline-none focus:border-black/30"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
