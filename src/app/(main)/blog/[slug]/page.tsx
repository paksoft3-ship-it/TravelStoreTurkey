import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, User, Tag, Facebook, Twitter, Linkedin, BookmarkPlus } from 'lucide-react';
import prisma from '@/lib/db';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  try {
    const post = await prisma.blogPost.findFirst({ where: { slug, status: 'PUBLISHED' } });
    return post;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | TravelStore Turkey Blog`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  // Related posts
  let relatedPosts: Array<{ id: string; title: string; slug: string; featuredImage: string | null; category: string }> = [];
  try {
    relatedPosts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED', slug: { not: slug } },
      orderBy: { publishedAt: 'desc' },
      take: 2,
      select: { id: true, title: true, slug: true, featuredImage: true, category: true },
    });
  } catch {}

  return (
    <>
      {/* Hero */}
      <section className="relative h-[280px] sm:h-[400px] lg:h-[500px]">
        {post.featuredImage ? (
          <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-slate-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 pb-12 w-full">
            <Link href="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="size-4" />
              Back to Blog
            </Link>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-black text-xs font-bold rounded-full mb-4">
              <Tag className="size-3" />
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-slate-600 flex items-center justify-center">
                  <User className="size-4 text-white" />
                </div>
                {post.author}
              </span>
              {post.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-8">
            {/* Share Sidebar */}
            <aside className="hidden lg:flex flex-col gap-3 sticky top-24 h-fit">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Share</span>
              <button className="size-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Facebook className="size-4" />
              </button>
              <button className="size-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors">
                <Twitter className="size-4" />
              </button>
              <button className="size-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors">
                <Linkedin className="size-4" />
              </button>
              <button className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                <BookmarkPlus className="size-4" />
              </button>
            </aside>

            {/* Article Content */}
            <article className="flex-1 prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 font-medium">{post.excerpt}</p>
              <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </article>
          </div>

          {/* Mobile Share */}
          <div className="lg:hidden flex items-center justify-center gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-500">Share:</span>
            <button className="size-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <Facebook className="size-4" />
            </button>
            <button className="size-10 rounded-full bg-sky-500 text-white flex items-center justify-center">
              <Twitter className="size-4" />
            </button>
            <button className="size-10 rounded-full bg-blue-700 text-white flex items-center justify-center">
              <Linkedin className="size-4" />
            </button>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-primary rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-black mb-2">Ready to Explore Turkey?</h3>
            <p className="text-slate-800 mb-6">Book your private tour or transfer with us today.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/booking" className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                Book Now
              </Link>
              <Link href="/tours" className="px-6 py-3 bg-white/30 text-black font-bold rounded-xl hover:bg-white/50 transition-colors">
                View Tours
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 px-4 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-white dark:bg-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40">
                    {relatedPost.featuredImage ? (
                      <Image
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-700" />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{relatedPost.category}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 mt-1">
                      {relatedPost.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
