'use client';

import { useState, useEffect } from 'react';
import { FileText, Edit, ExternalLink, Loader2, AlertCircle, RefreshCw, Eye, EyeOff, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
}

const PAGE_LABELS: Record<string, string> = {
  'refund-policy': 'Refund Policy',
  'privacy-policy': 'Privacy Policy',
  'terms-and-conditions': 'Terms & Conditions',
  'cookie-policy': 'Cookie Policy',
};

const PAGE_DESCRIPTIONS: Record<string, string> = {
  'refund-policy': 'Required by myPOS & payment providers — explains cancellation and refund rules',
  'privacy-policy': 'GDPR required — explains how customer data is collected and used',
  'terms-and-conditions': 'Legal agreement between your business and customers',
  'cookie-policy': 'Explains what cookies your website uses',
};

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPages(data.pages);
    } catch {
      toast.error('Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const seedPages = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/admin/pages/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to seed');
      toast.success('Default pages created successfully');
      fetchPages();
    } catch {
      toast.error('Failed to create default pages');
    } finally {
      setIsSeeding(false);
    }
  };

  const openEdit = (page: Page) => {
    setEditingPage(page);
    setEditTitle(page.title);
    setEditContent(page.content);
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${editingPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Page saved successfully');
      setEditingPage(null);
      fetchPages();
    } catch {
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Legal Pages
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage your policy and legal pages — all editable without touching code
          </p>
        </div>
        {pages.length === 0 && (
          <button
            onClick={seedPages}
            disabled={isSeeding}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black rounded-lg text-sm font-bold shadow-md hover:bg-yellow-400 transition-all disabled:opacity-50"
          >
            {isSeeding ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Create Default Pages
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <strong>myPOS requirement:</strong> The Refund Policy page must explain (1) the timeframe for requesting and receiving refunds, (2) the refund method used, and (3) the exact situations when refunds are allowed or not. All pages below satisfy these requirements.
        </div>
      </div>

      {/* Empty state */}
      {pages.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-16 text-center">
          <FileText className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No pages yet</h3>
          <p className="text-slate-500 mb-6">Click "Create Default Pages" above to generate all 4 required policy pages with pre-written content.</p>
        </div>
      )}

      {/* Pages grid */}
      {pages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{page.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">/{page.slug}</p>
                  </div>
                </div>
                <span className={cn(
                  'shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border',
                  page.isActive
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                )}>
                  {page.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {PAGE_DESCRIPTIONS[page.slug] || 'Custom legal page'}
              </p>

              <p className="text-xs text-slate-400">Last saved: {formatDate(page.updatedAt)}</p>

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => openEdit(page)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors"
                >
                  <Edit className="size-4" />
                  Edit Content
                </button>
                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <ExternalLink className="size-4" />
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setEditingPage(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit: {editingPage.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">/{editingPage.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button onClick={() => setEditingPage(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className={cn('flex-1 overflow-hidden flex gap-0', showPreview ? 'divide-x divide-slate-200 dark:divide-slate-700' : '')}>
              {/* Editor side */}
              <div className={cn('flex flex-col', showPreview ? 'w-1/2' : 'w-full')}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Page Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col flex-1 p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-500">HTML Content</label>
                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">HTML</span>
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-mono bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-primary focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                    placeholder="Enter HTML content here..."
                    spellCheck={false}
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Tip: Use <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;h2&gt;</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;h3&gt;</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;p&gt;</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;ul&gt;&lt;li&gt;</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;strong&gt;</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;a href=&quot;&quot;&gt;</code> tags.
                  </p>
                </div>
              </div>

              {/* Preview side */}
              {showPreview && (
                <div className="w-1/2 flex flex-col overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <span className="text-xs font-semibold text-slate-500">Live Preview</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">{editTitle}</h1>
                    <div
                      className="prose prose-slate dark:prose-invert max-w-none
                        prose-h2:text-xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:dark:text-white prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-h2:dark:border-slate-700
                        prose-h3:text-base prose-h3:font-semibold prose-h3:text-slate-800 prose-h3:dark:text-slate-200 prose-h3:mt-5 prose-h3:mb-2
                        prose-p:text-slate-600 prose-p:dark:text-slate-300 prose-p:leading-relaxed prose-p:mb-3
                        prose-ul:text-slate-600 prose-ul:dark:text-slate-300 prose-ul:my-3
                        prose-li:mb-1.5
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-slate-900 prose-strong:dark:text-white"
                      dangerouslySetInnerHTML={{ __html: editContent }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setEditingPage(null)}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
