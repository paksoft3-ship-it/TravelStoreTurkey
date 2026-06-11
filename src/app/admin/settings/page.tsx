'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  CreditCard,
  Bell,
  Mail,
  Globe,
  Palette,
  Save,
  Check,
  ChevronRight,
  MapPin,
  Phone,
  Clock,
  Banknote,
  Percent,
  Car,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SettingsTab = 'general' | 'pricing' | 'notifications' | 'appearance';

interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  timezone: string;
  currency: string;
  bookingEmailNotifications: boolean;
  autoConfirmBookings: boolean;
  cityTourBasePrice: number;
  customTourBasePrice: number;
  customTourLargeGroupPrice: number;
  premiumCarFee: number;
  childSeatFee: number;
  extraStopFee: number;
  extraTimeFee: number;
  nightSurchargePercent: number;
  earlyMorningSurchargePercent: number;
  peakHoursSurchargePercent: number;
  [key: string]: any;
}

const defaultSettings: Settings = {
  siteName: 'TravelStore Turkey',
  siteDescription: 'Premium taxi and tour services in Turkey',
  contactEmail: 'info@travelstoreturkey.com',
  contactPhone: '+90 530 123 45 67',
  address: 'Istanbul, Turkey',
  timezone: 'Atlantic/Istanbul',
  currency: 'ISK',
  bookingEmailNotifications: true,
  autoConfirmBookings: false,
  cityTourBasePrice: 10500,
  customTourBasePrice: 60000,
  customTourLargeGroupPrice: 75000,
  premiumCarFee: 5000,
  childSeatFee: 2000,
  extraStopFee: 7000,
  extraTimeFee: 14000,
  nightSurchargePercent: 25,
  earlyMorningSurchargePercent: 15,
  peakHoursSurchargePercent: 10,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setSettings({ ...defaultSettings, ...data.settings });
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      toast.success('Settings saved successfully');
    } catch {
      setSaveStatus('idle');
      toast.error('Failed to save settings');
    }
  };

  const set = (key: string, value: any) => setSettings((prev) => ({ ...prev, [key]: value }));

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Building2 },
    { id: 'pricing' as const, label: 'Pricing', icon: CreditCard },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage your application preferences and configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all',
            saveStatus === 'saved'
              ? 'bg-green-500 text-white'
              : 'bg-primary text-black hover:bg-yellow-400 shadow-primary/20'
          )}
        >
          {saveStatus === 'saving' ? (
            <>
              <div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Saving...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Check className="size-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-64 flex lg:flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === tab.id
                  ? 'bg-primary text-black shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
              )}
            >
              <tab.icon className="size-5" />
              <span className="flex-1">{tab.label}</span>
              <ChevronRight className={cn('size-4 hidden lg:block', activeTab === tab.id ? 'opacity-100' : 'opacity-0')} />
            </button>
          ))}
        </nav>

        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Company Information</h3>
                <p className="text-sm text-slate-500">Basic information about your business</p>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Building2 className="size-4 text-slate-400" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => set('siteName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Mail className="size-4 text-slate-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => set('contactEmail', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Phone className="size-4 text-slate-400" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) => set('contactPhone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <MapPin className="size-4 text-slate-400" />
                    Business Address
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => set('address', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Clock className="size-4 text-slate-400" />
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => set('timezone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                      <option value="Atlantic/Istanbul">Turkey (GMT+0)</option>
                      <option value="Europe/London">London (GMT+0/+1)</option>
                      <option value="Europe/Paris">Paris (GMT+1/+2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Banknote className="size-4 text-slate-400" />
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => set('currency', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                      <option value="ISK">ISK - Euro</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Settings */}
          {activeTab === 'pricing' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Pricing Configuration</h3>
                <p className="text-sm text-slate-500">Booking add-on fees and time surcharges. Route prices are managed separately.</p>
              </div>

              {/* Info banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <Car className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Transfer & Tour route prices are managed elsewhere</p>
                  <p className="text-blue-700 dark:text-blue-400">
                    Edit transfer and Cappadocia prices in <strong>Transfers</strong> (including hourly hire rates).
                    Edit sightseeing tour prices in <strong>Tours</strong>.
                    Only booking add-ons and surcharges are configured here.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Percent className="size-5" />
                  Custom Tour Base Prices (ISK)
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'customTourBasePrice', label: 'Custom Tour — Small Group (1–4 pax)' },
                    { key: 'customTourLargeGroupPrice', label: 'Custom Tour — Large Group (5–8 pax)' },
                    { key: 'cityTourBasePrice', label: 'City Tour fallback base price' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={settings[key]}
                          onChange={(e) => set(key, parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2.5 pr-14 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">ISK</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                  Individual sightseeing tour prices are set in the <strong>Tours</strong> section.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Banknote className="size-5" />
                  Booking Add-on Fees (ISK)
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'premiumCarFee', label: 'Premium / Luxury Vehicle upgrade' },
                    { key: 'childSeatFee', label: 'Child / Booster Seat (per seat)' },
                    { key: 'extraStopFee', label: 'Extra Stop' },
                    { key: 'extraTimeFee', label: 'Extra Time' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={settings[key]}
                          onChange={(e) => set(key, parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2.5 pr-14 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">ISK</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Clock className="size-5" />
                  Time-Based Surcharges (%)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Enter as a whole number — e.g. 25 means +25% added to the base price.</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { key: 'nightSurchargePercent', label: 'Night Rate (22:00–06:00)' },
                    { key: 'earlyMorningSurchargePercent', label: 'Early Morning (06:00–08:00)' },
                    { key: 'peakHoursSurchargePercent', label: 'Peak Hours (08–09 & 17–19)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={settings[key]}
                          onChange={(e) => set(key, parseInt(e.target.value) || 0)}
                          min="0"
                          max="100"
                          className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Notification Preferences</h3>
                <p className="text-sm text-slate-500">Configure how you receive alerts and updates</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mail className="size-5" />
                  Booking Notifications
                </h4>
                <div className="space-y-4">
                  {[
                    { key: 'bookingEmailNotifications', label: 'Email notifications for new bookings', description: 'Receive email when a new booking is made' },
                    { key: 'autoConfirmBookings', label: 'Auto-confirm bookings', description: 'Automatically confirm bookings without manual review' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={!!settings[item.key]}
                          onChange={(e) => set(item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/50 transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Appearance</h3>
                <p className="text-sm text-slate-500">Customize the look and feel of your dashboard</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Appearance settings such as theme and brand colors are configured in the codebase (tailwind.config.js).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
