'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CarTaxiFront, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Failed to send request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="size-12 bg-primary rounded-xl flex items-center justify-center">
            <CarTaxiFront className="size-7 text-slate-900" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">
              TravelStore Turkey <span className="text-primary">&</span> Tours
            </h1>
            <p className="text-slate-400 text-sm">Admin Portal</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="size-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-500 mb-6">
                If <strong>{email}</strong> is registered, we've sent a password reset link. Check your inbox (and spam folder).
              </p>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                <ArrowLeft className="size-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Forgot password?</h2>
                <p className="text-slate-500 text-sm">
                  Enter your admin email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
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
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="size-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : null}
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="size-4" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
