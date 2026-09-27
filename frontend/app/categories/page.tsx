'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Category } from '@/lib/types';

const sportIcons: Record<string, string> = {
  'soccer': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
  'basketball': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  'running': 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7',
  'tennis': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  'fitness': 'M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z',
  'swimming': 'M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64-1.11 0-1.73-.37-2.18-.64-.37-.23-.6-.36-1.15-.36s-.78.13-1.15.36c-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36v2zM8.67 12H12v-1.67H8.67V12zm-2 0H10v-1.67H6.67V12zm10-1.67V12h3.33v-1.67H16.67z',
  'cycling': 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z',
  'default': 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z',
};

const typeIcons: Record<string, string> = {
  'footwear': 'M20 21H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2z',
  'clothing': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  'accessories': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
  'equipment': 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  'default': 'M20 21H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2z',
};

function getIcon(category: Category, type: 'SPORT' | 'PRODUCT_TYPE'): string {
  const icons = type === 'SPORT' ? sportIcons : typeIcons;
  const slug = category.slug.toLowerCase();
  return icons[slug] || icons['default'];
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
      <div className="container-x py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
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
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold text-brand-950 mb-8">Categories</h1>

      {/* Sport Categories */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-brand-950 mb-4">Shop by Sport</h2>
        {sports.length === 0 ? (
          <p className="text-sm text-brand-500">No sport categories available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sports.map((category) => (
              <Link
                key={category.id}
                href={`/products?sport=${category.slug}`}
                className="card p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-3 group-hover:bg-brand-100 transition-colors">
                  <svg
                    className="w-6 h-6 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={getIcon(category, 'SPORT')}
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-brand-900 group-hover:text-brand-600 transition-colors">
                  {category.name}
                </h3>
                {category._count?.sportProducts !== undefined && (
                  <p className="text-xs text-brand-400 mt-1">
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
        <h2 className="text-lg font-semibold text-brand-950 mb-4">Shop by Category</h2>
        {productTypes.length === 0 ? (
          <p className="text-sm text-brand-500">No product categories available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productTypes.map((category) => (
              <Link
                key={category.id}
                href={`/products?type=${category.slug}`}
                className="card p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-3 group-hover:bg-brand-100 transition-colors">
                  <svg
                    className="w-6 h-6 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={getIcon(category, 'PRODUCT_TYPE')}
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-brand-900 group-hover:text-brand-600 transition-colors">
                  {category.name}
                </h3>
                {category._count?.typeProducts !== undefined && (
                  <p className="text-xs text-brand-400 mt-1">
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
