'use client';

import { useState, useEffect } from 'react';
import {
  Map,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Check,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MultiImageUpload } from '@/components/admin/ImageUpload';

interface Tour {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  duration: string;
  durationHours: number;
  price: number;
  largeGroupPrice: number;
  currency: string;
  category: string;
  highlights: string[];
  includes: string[];
  images: string[];
  featured: boolean;
  active: boolean;
  createdAt: string;
}

const CATEGORIES = ['FULL_DAY', 'HALF_DAY', 'EVENING', 'MULTI_DAY', 'TRANSFER'];

const categoryLabels: Record<string, string> = {
  FULL_DAY: 'Full Day',
  HALF_DAY: 'Half Day',
  EVENING: 'Evening',
  MULTI_DAY: 'Multi Day',
  TRANSFER: 'Transfer',
};

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  duration: '',
  durationHours: 1,
  price: 0,
  largeGroupPrice: 0,
  currency: 'ISK',
  category: 'HALF_DAY',
  highlightsText: '',
  includesText: '',
  images: [] as string[],
  featured: false,
  active: true,
};

type FormData = typeof emptyForm;

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Tour | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const fetchTours = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (categoryFilter) params.set('category', categoryFilter);
      if (activeFilter) params.set('active', activeFilter);

      const res = await fetch(`/api/admin/tours?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTours(data.tours);
      setError(null);
    } catch {
      setError('Failed to load tours');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTours(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setIsLoading(true); fetchTours(); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter, activeFilter]);

  const openNew = () => {
    setEditingTour(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      name: tour.name,
      slug: tour.slug,
      description: tour.description,
      shortDescription: tour.shortDescription,
      duration: tour.duration,
      durationHours: tour.durationHours,
      price: tour.price,
      largeGroupPrice: tour.largeGroupPrice,
      currency: tour.currency,
      category: tour.category,
      highlightsText: tour.highlights.join('\n'),
      includesText: tour.includes.join('\n'),
      images: tour.images,
      featured: tour.featured,
      active: tour.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.shortDescription || !formData.duration || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        shortDescription: formData.shortDescription,
        duration: formData.duration,
        durationHours: formData.durationHours,
        price: formData.price,
        largeGroupPrice: formData.largeGroupPrice,
        currency: formData.currency,
        category: formData.category,
        highlights: formData.highlightsText.split('\n').map(s => s.trim()).filter(Boolean),
        includes: formData.includesText.split('\n').map(s => s.trim()).filter(Boolean),
        images: formData.images,
        featured: formData.featured,
        active: formData.active,
      };

      const url = editingTour ? `/api/admin/tours/${editingTour.id}` : '/api/admin/tours';
      const method = editingTour ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Save failed');
      }

      toast.success(editingTour ? 'Tour updated' : 'Tour created');
      setShowModal(false);
      fetchTours();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save tour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (tour: Tour) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tours/${tour.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Tour deleted');
      setShowDeleteConfirm(null);
      fetchTours();
    } catch {
      toast.error('Failed to delete tour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (key: keyof FormData, value: any) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tour Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Create and manage your tour offerings
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-yellow-400 transition-all"
        >
          <Plus className="size-4" />
          Add Tour
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tours', value: tours.length },
          { label: 'Active', value: tours.filter(t => t.active).length },
          { label: 'Featured', value: tours.filter(t => t.featured).length },
          { label: 'Inactive', value: tours.filter(t => !t.active).length },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input
            type="text"
            placeholder="Search tours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{categoryLabels[c]}</option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertCircle className="size-12 text-red-500" />
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          <button onClick={fetchTours} className="px-4 py-2 bg-primary text-black rounded-lg font-semibold">Retry</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4">Tour</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {tour.featured && <Star className="size-4 text-primary shrink-0" fill="currentColor" />}
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{tour.name}</p>
                          <p className="text-sm text-slate-500 line-clamp-1">{tour.shortDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full">
                        {categoryLabels[tour.category] || tour.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{tour.duration}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      <span className="font-bold">{tour.price.toLocaleString()}</span>
                      {tour.largeGroupPrice > 0 && (
                        <span className="block text-xs text-slate-400">5–8 pax: {tour.largeGroupPrice.toLocaleString()}</span>
                      )}
                      <span className="text-xs text-slate-400"> {tour.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex px-2.5 py-1 rounded-full text-xs font-bold border',
                        tour.active
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      )}>
                        {tour.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(tour)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(tour)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tours.length === 0 && (
            <div className="text-center py-12">
              <Map className="size-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No tours found</h3>
              <p className="text-slate-500">Add your first tour to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingTour ? 'Edit Tour' : 'Add New Tour'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => set('name', e.target.value)}
                    onBlur={() => { if (!formData.slug) set('slug', generateSlug(formData.name)); }}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="Cappadocia Tour"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => set('slug', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white font-mono"
                    placeholder="golden-circle-tour"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => set('category', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{categoryLabels[c]}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description *</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => set('shortDescription', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="Brief one-line description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                    placeholder="Full tour description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (text) *</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => set('duration', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="e.g. 6 Hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    value={formData.durationHours}
                    onChange={(e) => set('durationHours', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Small Group Price — 1–4 pax *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Large Group Price — 5–8 pax
                  </label>
                  <input
                    type="number"
                    value={formData.largeGroupPrice}
                    onChange={(e) => set('largeGroupPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    placeholder="0 = same as small group price"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => set('currency', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="ISK">ISK</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Highlights <span className="text-slate-400">(one per line)</span>
                  </label>
                  <textarea
                    value={formData.highlightsText}
                    onChange={(e) => set('highlightsText', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                    placeholder="Gullfoss Waterfall&#10;Geysir Area&#10;Thingvellir National Park"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Includes <span className="text-slate-400">(one per line)</span>
                  </label>
                  <textarea
                    value={formData.includesText}
                    onChange={(e) => set('includesText', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                    placeholder="Private luxury vehicle&#10;Professional driver-guide&#10;WiFi on board"
                  />
                </div>

                <div className="md:col-span-2">
                  <MultiImageUpload
                    label="Tour Images"
                    value={formData.images}
                    onChange={(urls) => set('images', urls)}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => set('featured', e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => set('active', e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {editingTour ? 'Update Tour' : 'Create Tour'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Delete Tour</h3>
              <p className="text-center text-slate-500 mb-6">
                Are you sure you want to permanently delete <span className="font-semibold">{showDeleteConfirm.name}</span>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
