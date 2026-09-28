'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Category } from '@/lib/types';

const sportIcons: Record<string, React.ReactNode> = {
  football: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  basketball: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15 15 0 0 1 0 20" />
      <path d="M12 2a15 15 0 0 0 0 20" />
    </svg>
  ),
  tennis: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M4.5 4.5c4 3.5 4 9.5 0 15" />
      <path d="M19.5 4.5c-4 3.5-4 9.5 0 15" />
    </svg>
  ),
  running: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="4" r="2" />
      <path d="M6 21l3-4 2-3-2-4-4 1-1 3" />
      <path d="M10 10l-3 2-2 4" />
      <path d="M10 10l4 1 3 3 3 1" />
      <path d="M13 14l-2 7" />
    </svg>
  ),
  swimming: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 16c2 0 2-1.5 4-1.5S8 16 10 16s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" />
      <path d="M2 20c2 0 2-1.5 4-1.5S8 20 10 20s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" />
      <circle cx="15" cy="5" r="2" />
      <path d="M6 12l4-4 4 2 4-1" />
    </svg>
  ),
  cricket: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 19L15 9" />
      <path d="M14 5l5 5" />
      <circle cx="17" cy="8" r="2" />
      <path d="M3 21h4" />
    </svg>
  ),
  volleyball: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2c3 3 3 7 0 10" />
      <path d="M2 12c3-1 6 1 8 5" />
      <path d="M22 12c-3-1-6 1-8 5" />
    </svg>
  ),
  golf: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21h12" />
      <path d="M12 3v14" />
      <path d="M12 3l6 4-6 4" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  default: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
};

function getSportIcon(slug: string) {
  const key = slug.toLowerCase();
  if (key.includes('football') || key.includes('soccer')) return sportIcons.football;
  if (key.includes('basketball')) return sportIcons.basketball;
  if (key.includes('tennis')) return sportIcons.tennis;
  if (key.includes('run')) return sportIcons.running;
  if (key.includes('swim')) return sportIcons.swimming;
  if (key.includes('cricket')) return sportIcons.cricket;
  if (key.includes('volleyball')) return sportIcons.volleyball;
  if (key.includes('golf')) return sportIcons.golf;
  return sportIcons.default;
}

export default function CategoriesPage() {
  const [sports, setSports] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<{ categories: Category[] }>('/categories?type=SPORT'),
      api.get<{ categories: Category[] }>('/categories?type=PRODUCT_TYPE'),
    ])
      .then(([sportsRes, typesRes]) => {
        setSports(sportsRes.categories || []);
        setProductTypes(typesRes.categories || []);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load categories');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container-x py-12">
        <Skeleton className="h-10 w-56 mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-56 mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-x py-16">
        <EmptyState
          title="Error loading categories"
          description={error}
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  return (
    <div className="container-x py-12 md:py-16">
      <h1 className="text-3xl font-bold text-star-white mb-10">Categories</h1>

      {/* Sport Categories */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-star-white mb-6">Shop by Sport</h2>
        {sports.length === 0 ? (
          <p className="text-sm text-star-blue/50">No sport categories available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sports.map((category) => (
              <Link
                key={category.id}
                href={`/products?sport=${category.slug}`}
                className="card card-hover p-7 flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-full bg-surface-lighter flex items-center justify-center mb-4 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  {getSportIcon(category.slug)}
                </div>
                <h3 className="text-sm font-medium text-star-white group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                {category._count?.sportProducts !== undefined && (
                  <p className="text-xs text-star-blue/40 mt-1.5">
                    {category._count.sportProducts} products
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Product Type Categories */}
      <section>
        <h2 className="text-xl font-semibold text-star-white mb-6">Shop by Category</h2>
        {productTypes.length === 0 ? (
          <p className="text-sm text-star-blue/50">No product categories available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {productTypes.map((category) => (
              <Link
                key={category.id}
                href={`/products?type=${category.slug}`}
                className="card card-hover p-7 flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-full bg-surface-lighter flex items-center justify-center mb-4 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  {getSportIcon(category.slug)}
                </div>
                <h3 className="text-sm font-medium text-star-white group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                {category._count?.typeProducts !== undefined && (
                  <p className="text-xs text-star-blue/40 mt-1.5">
                    {category._count.typeProducts} products
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
