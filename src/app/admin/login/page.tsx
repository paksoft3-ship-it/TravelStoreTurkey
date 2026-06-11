'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      {/* Top bar */}
      <div className="flex flex-col items-center justify-center py-10 px-4 gap-3">
        <span className="font-display text-3xl font-bold text-white">
          TravelStore<span className="text-gold"> Turkey</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Developed by</span>
          <a
            href="https://paksoft.com.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-yellow-400 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 -rotate-12">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.08-1.38-.7.13-1.42.21-2.16.21-5.52 0-10-4.48-10-10S9.42 2.83 14.92 2.83c.74 0 1.46.08 2.16.21C15.58 2.5 13.85 2 12 2z" />
            </svg>
            <span className="font-black text-2xl tracking-tight">PakSoft</span>
          </a>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Card header strip */}
            <div className="bg-primary px-8 py-6 text-center">
              <h1 className="text-xl font-black text-white">Admin Portal</h1>
              <p className="text-white/80 text-sm mt-1">Sign in to manage your dashboard</p>
            </div>

            {/* Form area */}
            <div className="px-8 py-10">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <AlertCircle className="size-5 text-red-500 shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@travelstoreturkey.com"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-600">Remember me</span>
                  </label>
                  <a
                    href="/admin/forgot-password"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  Sign In
                </Button>
              </form>

              {/* Demo credentials */}
              <div className="mt-6 rounded-lg border border-borderSoft bg-cream/60 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-navy">Demo login</p>
                <p className="text-xs text-textMuted mt-1">
                  admin@travelstoreturkey.com&nbsp;·&nbsp;TravelStore2026
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm mt-6">
            Need help? Contact{' '}
            <a href="mailto:support@travelstoreturkey.com" className="text-primary hover:underline">
              support@travelstoreturkey.com
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} TravelStore Turkey. All rights reserved.</p>
      </div>
    </div>
  );
}
