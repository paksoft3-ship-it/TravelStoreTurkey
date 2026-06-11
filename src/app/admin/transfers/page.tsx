'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TransferRoute {
  id: string;
  name: string;
  category: string;
  from: string | null;
  to: string | null;
  description: string | null;
  duration: string | null;
  distance: string | null;
  passengers: string | null;
  price: number;
  largeGroupPrice: number;
  features: string[];
  popular: boolean;
  active: boolean;
  sortOrder: number;
}

const CATEGORIES = [
  { id: 'PRIVATE_TRANSFER', label: 'Private Transfers', color: 'bg-blue-100 text-blue-700' },
  { id: 'BLUE_LAGOON', label: 'Cappadocia Packages', color: 'bg-teal-100 text-teal-700' },
  { id: 'AIRPORT_BLUE_LAGOON', label: 'Airport ↔ Cappadocia', color: 'bg-purple-100 text-purple-700' },
  { id: 'AIRPORT', label: 'Airport Transfers', color: 'bg-amber-100 text-amber-700' },
];

const emptyForm = {
  name: '',
  category: 'PRIVATE_TRANSFER',
  from: '',
  to: '',
  description: '',
  duration: '',
  distance: '',
  passengers: '',
  price: 0,
  largeGroupPrice: 0,
  featuresText: '',
  popular: false,
  active: true,
  sortOrder: 0,
};

type FormData = typeof emptyForm;

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<TransferRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selected, setSelected] = useState<TransferRoute | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Hourly hire rates (stored in Setting model)
  const [hourlyRates, setHourlyRates] = useState({ hourlyHireRate: 12000, hourlyHireLargeGroupRate: 15000 });
  const [hourlyRatesSaving, setHourlyRatesSaving] = useState<'idle' | 'saving' | 'saved'>('idle');

  const fetchTransfers = async () => {
    try {
      const res = await fetch('/api/admin/transfers');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTransfers(data.transfers);
      setError(null);
    } catch {
      setError('Failed to load transfer routes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHourlyRates = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) return;
      const data = await res.json();
      setHourlyRates({
        hourlyHireRate: data.settings?.hourlyHireRate ?? 12000,
        hourlyHireLargeGroupRate: data.settings?.hourlyHireLargeGroupRate ?? 15000,
      });
    } catch { /* use defaults */ }
  };

  const saveHourlyRates = async () => {
    setHourlyRatesSaving('saving');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hourlyRates),
      });
      if (!res.ok) throw new Error('Failed');
      setHourlyRatesSaving('saved');
      setTimeout(() => setHourlyRatesSaving('idle'), 2000);
      toast.success('Hourly rates saved');
    } catch {
      setHourlyRatesSaving('idle');
      toast.error('Failed to save hourly rates');
    }
  };

  useEffect(() => { fetchTransfers(); fetchHourlyRates(); }, []);

  const openAdd = (category?: string) => {
    setFormData({ ...emptyForm, category: category || 'PRIVATE_TRANSFER' });
    setShowAddModal(true);
  };

  const openEdit = (t: TransferRoute) => {
    setSelected(t);
    setFormData({
      name: t.name,
      category: t.category,
      from: t.from || '',
      to: t.to || '',
      description: t.description || '',
      duration: t.duration || '',
      distance: t.distance || '',
      passengers: t.passengers || '',
      price: t.price,
      largeGroupPrice: t.largeGroupPrice,
      featuresText: t.features.join('\n'),
      popular: t.popular,
      active: t.active,
      sortOrder: t.sortOrder,
    });
    setShowEditModal(true);
  };

  const buildPayload = (f: FormData) => ({
    name: f.name,
    category: f.category,
    from: f.from || null,
    to: f.to || null,
    description: f.description || null,
    duration: f.duration || null,
    distance: f.distance || null,
    passengers: f.passengers || null,
    price: Number(f.price),
    largeGroupPrice: Number(f.largeGroupPrice),
    features: f.featuresText.split('\n').map(s => s.trim()).filter(Boolean),
    popular: f.popular,
    active: f.active,
    sortOrder: Number(f.sortOrder),
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(formData)),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success('Transfer route added');
      setShowAddModal(false);
      fetchTransfers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/transfers/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(formData)),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success('Transfer route updated');
      setShowEditModal(false);
      setSelected(null);
      fetchTransfers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/transfers/${selected.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Transfer route deleted');
      setShowDeleteConfirm(false);
      setSelected(null);
      fetchTransfers();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (t: TransferRoute) => {
    try {
      await fetch(`/api/admin/transfers/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !t.active }),
      });
      fetchTransfers();
    } catch {
      toast.error('Failed to update');
    }
  };

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: transfers.filter(t => t.category === cat.id),
  }));

  const totalActive = transfers.filter(t => t.active).length;

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertCircle className="size-12 text-red-500" />
      <p className="text-lg text-slate-600 dark:text-slate-400">{error}</p>
      <button onClick={() => { setIsLoading(true); fetchTransfers(); }}
        className="px-4 py-2 bg-primary text-black rounded-lg font-semibold">Retry</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transfer Routes & Packages
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage all transfer options shown on the website — {totalActive} active routes
          </p>
        </div>
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-yellow-400 transition-all"
        >
          <Plus className="size-4" />
          Add Route
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {grouped.map(cat => (
          <div key={cat.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{cat.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{cat.items.length}</p>
            <p className="text-xs text-slate-400 mt-1">{cat.items.filter(i => i.active).length} active</p>
          </div>
        ))}
      </div>

      {/* Hourly Hire Rates */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Hourly Hire</span>
            <span className="text-sm text-slate-500">Rate charged per hour — used by the booking calculator</span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {([
              { key: 'hourlyHireRate' as const, label: 'Small Group Rate (1–4 pax)', desc: 'per hour' },
              { key: 'hourlyHireLargeGroupRate' as const, label: 'Large Group Rate (5–8 pax)', desc: 'per hour' },
            ]).map(({ key, label, desc }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={0}
                      value={hourlyRates[key]}
                      onChange={(e) => setHourlyRates(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 pr-14 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">ISK</span>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={saveHourlyRates}
              disabled={hourlyRatesSaving === 'saving'}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all',
                hourlyRatesSaving === 'saved'
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-black hover:bg-yellow-400'
              )}
            >
              {hourlyRatesSaving === 'saving' ? (
                <><Loader2 className="size-4 animate-spin" /> Saving…</>
              ) : hourlyRatesSaving === 'saved' ? (
                <><Check className="size-4" /> Saved</>
              ) : (
                <><Save className="size-4" /> Save Hourly Rates</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grouped Sections */}
      {grouped.map(cat => (
        <div key={cat.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer select-none"
            onClick={() => setCollapsed(c => ({ ...c, [cat.id]: !c[cat.id] }))}
          >
            <div className="flex items-center gap-3">
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', cat.color)}>{cat.label}</span>
              <span className="text-sm text-slate-500">{cat.items.length} routes</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); openAdd(cat.id); }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Plus className="size-3.5" /> Add
              </button>
              {collapsed[cat.id] ? <ChevronDown className="size-4 text-slate-400" /> : <ChevronUp className="size-4 text-slate-400" />}
            </div>
          </div>

          {/* Table */}
          {!collapsed[cat.id] && (
            <div className="overflow-x-auto">
              {cat.items.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <ArrowLeftRight className="size-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No routes yet. Click <strong>Add</strong> to create one.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
                      <th className="px-6 py-3">Name / Route</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Passengers</th>
                      <th className="px-6 py-3">Price (ISK)</th>
                      <th className="px-6 py-3">Large Group (ISK)</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {cat.items.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                              {t.from && t.to && (
                                <p className="text-xs text-slate-500">{t.from} → {t.to}</p>
                              )}
                            </div>
                            {t.popular && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold shrink-0">
                                <Star className="size-3 fill-amber-500 text-amber-500" /> Popular
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{t.duration || '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{t.passengers || '—'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                          {t.price.toLocaleString()} ISK
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {t.largeGroupPrice > 0 ? `${t.largeGroupPrice.toLocaleString()} ISK` : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleActive(t)}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors',
                              t.active
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            )}
                          >
                            {t.active ? <><Check className="size-3" /> Active</> : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(t)}
                              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              onClick={() => { setSelected(t); setShowDeleteConfirm(true); }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {showAddModal ? 'Add Transfer Route' : 'Edit Transfer Route'}
                </h3>
                <button
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={showAddModal ? handleAdd : handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Route Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="e.g. Istanbul ↔ Cappadocia"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">From</label>
                    <input
                      type="text"
                      value={formData.from}
                      onChange={e => setFormData({ ...formData, from: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="Istanbul"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To</label>
                    <input
                      type="text"
                      value={formData.to}
                      onChange={e => setFormData({ ...formData, to: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="Cappadocia"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                    placeholder="Short description shown on the website"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="45 min"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Distance</label>
                    <input
                      type="text"
                      value={formData.distance}
                      onChange={e => setFormData({ ...formData, distance: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="47 km"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Passengers</label>
                    <input
                      type="text"
                      value={formData.passengers}
                      onChange={e => setFormData({ ...formData, passengers: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="1-4 pax"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (ISK) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Large Group Price (ISK)
                      <span className="text-slate-400 font-normal ml-1">(5+ pax)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.largeGroupPrice}
                      onChange={e => setFormData({ ...formData, largeGroupPrice: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="0 = not applicable"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                  <div />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Features <span className="text-slate-400 font-normal">(one per line)</span>
                  </label>
                  <textarea
                    value={formData.featuresText}
                    onChange={e => setFormData({ ...formData, featuresText: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none font-mono"
                    placeholder={"Door-to-door service\nFree WiFi\nLuggage assistance"}
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={e => setFormData({ ...formData, popular: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as Popular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={e => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                    className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {showAddModal ? 'Add Route' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Route</h3>
              <p className="text-slate-500 mb-6">
                Delete <span className="font-semibold">{selected.name}</span>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold dark:text-slate-300 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
