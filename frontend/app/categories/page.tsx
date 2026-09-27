'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import type { Category } from '@/lib/types';

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
      <h1 className="text-3xl font-bold text-brand-950 mb-10">Categories</h1>

      {/* Sport Categories */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-brand-950 mb-6">Shop by Sport</h2>
        {sports.length === 0 ? (
          <p className="text-sm text-brand-500">No sport categories available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sports.map((category) => (
              <Link
                key={category.id}
                href={`/products?sport=${category.slug}`}
                className="card p-7 flex flex-col items-center text-center hover:shadow-md transition-shadow group"
              >
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                  <Icon name={category.icon || 'trophy'} size={26} className="text-brand-700" />
                </div>
                <h3 className="text-sm font-medium text-brand-900 group-hover:text-brand-600 transition-colors">
                  {category.name}
                </h3>
                {category._count?.sportProducts !== undefined && (
                  <p className="text-xs text-brand-400 mt-1.5">
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
        <h2 className="text-xl font-semibold text-brand-950 mb-6">Shop by Category</h2>
        {productTypes.length === 0 ? (
          <p className="text-sm text-brand-500">No product categories available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {productTypes.map((category) => (
              <Link
                key={category.id}
                href={`/products?type=${category.slug}`}
                className="card p-7 flex flex-col items-center text-center hover:shadow-md transition-shadow group"
              >
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                  <Icon name={category.icon || 'box'} size={26} className="text-brand-700" />
                </div>
                <h3 className="text-sm font-medium text-brand-900 group-hover:text-brand-600 transition-colors">
                  {category.name}
                </h3>
                {category._count?.typeProducts !== undefined && (
                  <p className="text-xs text-brand-400 mt-1.5">
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
