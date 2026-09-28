'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  {
    href: '/vendor',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/vendor/products',
    label: 'Products',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: '/vendor/products/new',
    label: 'New Product',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/vendor/orders',
    label: 'Orders',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/vendor/analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/vendor/profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: '/vendor/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user || user.role !== 'VENDOR') {
      router.replace('/auth/login');
    }
  }, [authLoading, token, user, router]);

  if (authLoading || !token || !user || user.role !== 'VENDOR') {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-star-blue/60 animate-pulse">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/vendor') return pathname === '/vendor';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-space-950">
      {/* Background stars effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-[15%] w-1 h-1 bg-white rounded-full animate-twinkle opacity-60" />
        <div className="absolute top-[30%] left-[70%] w-0.5 h-0.5 bg-star-blue rounded-full animate-twinkle animation-delay-200 opacity-40" />
        <div className="absolute top-[60%] left-[40%] w-1.5 h-1.5 bg-white rounded-full animate-twinkle animation-delay-400 opacity-30" />
        <div className="absolute top-[80%] left-[85%] w-0.5 h-0.5 bg-accent-light rounded-full animate-twinkle animation-delay-600 opacity-50" />
        <div className="absolute top-[15%] left-[55%] w-1 h-1 bg-white rounded-full animate-twinkle animation-delay-200 opacity-40" />
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen fixed left-0 top-0 z-40 glass border-r border-surface-border/50">
          <div className="p-6 border-b border-surface-border/50">
            <Link href="/vendor" className="flex items-center gap-2.5 animate-fade-in">
              <span className="text-xl font-bold tracking-tight text-gradient">XENO</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent/20 text-accent-light border border-accent/30">
                VENDOR
              </span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ animationDelay: `${index * 80}ms` }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 animate-fade-in-up',
                  isActive(link.href)
                    ? 'bg-accent/15 text-accent-light border border-accent/25 shadow-glow'
                    : 'text-star-blue/70 hover:bg-surface-light/50 hover:text-star-white border border-transparent'
                )}
              >
                <span className={cn(
                  'transition-transform duration-300',
                  isActive(link.href) ? 'scale-110' : 'group-hover:scale-110'
                )}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-surface-border/50">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-star-blue/50 hover:text-accent-light transition-colors rounded-lg hover:bg-surface-light/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Store
            </Link>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-surface-border/50 z-40">
          <div className="flex justify-around py-2">
            {NAV_LINKS.slice(0, 5).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1.5 text-[10px] font-medium transition-colors rounded-lg min-w-[56px]',
                  isActive(link.href) ? 'text-accent-light' : 'text-star-blue/50'
                )}
              >
                {link.icon}
                {link.label.split(' ')[0]}
              </Link>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          {/* Top bar */}
          <header className="sticky top-0 z-30 glass border-b border-surface-border/50">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <span className="lg:hidden text-lg font-bold tracking-tight text-gradient">XENO</span>
                <h1 className="hidden lg:block text-lg font-semibold text-star-white">Vendor Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/vendors/${user.vendor?.slug || ''}`}
                  className="text-sm text-star-blue/60 hover:text-accent-light transition-colors hidden sm:block"
                >
                  View Store
                </Link>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-cosmic-500 flex items-center justify-center text-xs font-bold text-white shadow-glow">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
