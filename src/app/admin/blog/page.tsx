'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Save,
  ArrowLeft,
  Tag,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
  views: number;
  author: string;
  publishedAt: string | null;
  createdAt: string;
}

const categories = ['Travel Tips', 'Destinations', 'News', 'Local Guide', 'Company Updates', 'general'];

const statusConfig = {
  PUBLISHED: { label: 'Published', style: 'bg-green-50 text-green-700 border-green-200' },
  DRAFT: { label: 'Draft', style: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
};

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Travel Tips',
  status: 'DRAFT',
  featuredImage: '',
  author: 'Admin',
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/blog?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPosts(data.posts);
      setError(null);
    } catch {
      setError('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleNewPost = () => {
    setEditingPost(null);
    setFormData(emptyForm);
    setShowEditor(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      status: post.status,
      featuredImage: post.featuredImage || '',
      author: post.author,
    });
    setShowEditor(true);
  };

  const handleSave = async (status: string) => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error('Title, excerpt, and content are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, status };
      const url = editingPost ? `/api/admin/blog/${editingPost.id}` : '/api/admin/blog';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Save failed');
      }

      toast.success(editingPost ? 'Post updated' : 'Post created');
      setShowEditor(false);
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Post deleted');
      setPosts(posts.filter((p) => p.id !== id));
    } catch {
      toast.error('Failed to delete post');
    }
  };

  if (showEditor) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowEditor(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingPost ? 'Edit Post' : 'New Post'}
              </h2>
              <p className="text-sm text-slate-500">Create and publish blog content</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('DRAFT')}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave('PUBLISHED')}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })
                }
                placeholder="Enter post title..."
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-lg font-medium focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">/blog/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Write a brief summary..."
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content</label>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <button className="p-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                    <Bold className="size-4" />
                  </button>
                  <button className="p-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                    <Italic className="size-4" />
                  </button>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1" />
                  <button className="p-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                    <List className="size-4" />
                  </button>
                  <button className="p-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                    <LinkIcon className="size-4" />
                  </button>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your post content here... (Markdown supported)"
                  rows={15}
                  className="w-full px-4 py-3 text-sm focus:outline-none dark:bg-slate-800 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Featured Image</h4>
              <ImageUpload
                value={formData.featuredImage}
                onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                aspect="video"
              />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Author</h4>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Category</h4>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Status</h4>
              <div className="space-y-2">
                {(['DRAFT', 'PUBLISHED'] as const).map((s) => (
                  <label key={s} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={formData.status === s}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Blog Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Create and manage blog posts for your website
          </p>
        </div>
        <button
          onClick={handleNewPost}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-yellow-400 transition-all"
        >
          <Plus className="size-4" />
          New Post
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: posts.length, color: 'text-slate-900' },
          { label: 'Published', value: posts.filter((p) => p.status === 'PUBLISHED').length, color: 'text-green-600' },
          { label: 'Drafts', value: posts.filter((p) => p.status === 'DRAFT').length, color: 'text-yellow-600' },
          { label: 'Total Views', value: posts.reduce((acc, p) => acc + p.views, 0).toLocaleString(), color: 'text-blue-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className={cn('text-2xl font-bold', stat.color, 'dark:text-white')}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Drafts</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertCircle className="size-12 text-red-500" />
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          <button onClick={fetchPosts} className="px-4 py-2 bg-primary text-black rounded-lg font-semibold">
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4">Post</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {posts.map((post) => {
                  const status = statusConfig[post.status];
                  return (
                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {post.featuredImage ? (
                            <div className="relative size-16 rounded-lg overflow-hidden shrink-0">
                              <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="size-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                              <FileText className="size-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{post.title}</h4>
                            <p className="text-sm text-slate-500 line-clamp-1">{post.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full">
                          <Tag className="size-3" />
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{post.author}</td>
                      <td className="px-6 py-4">
                        <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-bold border', status.style)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{post.views.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="size-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No posts found</h3>
              <p className="text-slate-500">Create your first blog post to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
