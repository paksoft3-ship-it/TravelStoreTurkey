'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  CarTaxiFront,
  LayoutDashboard,
  Calendar,
  Car,
  Users,
  Settings,
  LogOut,
  FileText,
  MessageSquare,
  BarChart3,
  Menu,
  X,
  Map,
  ArrowLeftRight,
  ScrollText,
  LayoutList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Fleet', href: '/admin/fleet', icon: Car },
  { name: 'Drivers', href: '/admin/drivers', icon: Users },
  { name: 'Tours', href: '/admin/tours', icon: Map },
  { name: 'Transfers', href: '/admin/transfers', icon: ArrowLeftRight },
  { name: 'Pricing Overview', href: '/admin/pricing-overview', icon: LayoutList },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Pages', href: '/admin/pages', icon: ScrollText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  // Don't show admin layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar-bg flex-col shrink-0 transition-all duration-300 sticky top-0 h-screen z-50">
        <div className="py-6 px-4 shrink-0">
          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-2 px-2">
            <span className="font-display text-xl font-bold text-white">
              TravelStore<span className="text-gold"> Turkey</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-black'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon className={cn('size-5', isActive && 'fill-current')} />
                  <span
                    className={cn(
                      'text-sm',
                      isActive ? 'font-semibold' : 'font-medium'
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

        {/* User Profile Bottom */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div
              className="size-9 rounded-full bg-cover bg-center shrink-0 border border-slate-700 bg-slate-600"
            />
            <div className="flex flex-col flex-1">
              <p className="text-white text-sm font-medium leading-none">
                {session?.user?.name || 'Admin User'}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {session?.user?.role || 'Admin'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-72 bg-sidebar-bg flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between gap-6 py-6 px-4 shrink-0">
          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-2 px-2">
            <span className="font-display text-xl font-bold text-white">
              TravelStore<span className="text-gold"> Turkey</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-black'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <item.icon className={cn('size-5', isActive && 'fill-current')} />
                <span
                  className={cn(
                    'text-sm',
                    isActive ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Bottom */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div
              className="size-9 rounded-full bg-cover bg-center shrink-0 border border-slate-700 bg-slate-600"
            />
            <div className="flex flex-col flex-1">
              <p className="text-white text-sm font-medium leading-none">
                {session?.user?.name || 'Admin User'}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {session?.user?.role || 'Admin'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="size-6" />
          </button>
          <span className="text-lg font-bold text-slate-900 dark:text-white">TravelStore Turkey Admin</span>
          <Link
            href="/admin/settings"
            className="p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings className="size-5" />
          </Link>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto">
          {children}

          {/* Admin Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>Developed by</span>
              <a
                href="https://paksoft.com.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 group"
              >
                <div className="flex items-center text-primary group-hover:text-yellow-500 transition-colors">
                  {/* Custom Crescent Icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 -rotate-12">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.08-1.38-.7.13-1.42.21-2.16.21-5.52 0-10-4.48-10-10S9.42 2.83 14.92 2.83c.74 0 1.46.08 2.16.21C15.58 2.5 13.85 2 12 2z" />
                  </svg>
                  <span className="font-bold ml-1">PakSoft</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
