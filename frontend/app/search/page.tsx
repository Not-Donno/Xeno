'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Input';
import type { Product } from '@/lib/types';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('relevance');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('search', q);
    params.set('sort', sort);
    params.set('limit', '24');
    api.get<{ products: Product[] }>(`/products?${params}`)
      .then((res) => setProducts(res.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, sort]);

  return (
    <div className="container-x py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-950">
            Search results for &quot;{q}&quot;
          </h1>
          <p className="text-sm text-brand-500 mt-1">{products.length} products found</p>
        </div>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={[
            { value: 'relevance', label: 'Relevance' },
            { value: 'newest', label: 'Newest' },
            { value: 'price-asc', label: 'Price: Low to High' },
            { value: 'price-desc', label: 'Price: High to Low' },
            { value: 'rating', label: 'Top Rated' },
            { value: 'popular', label: 'Most Popular' },
          ]}
          className="w-40"
        />
      </div>

      {loading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No results found"
          description={`We couldn't find any products matching "${q}". Try different keywords.`}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-x py-8"><ProductGridSkeleton count={12} /></div>}>
      <SearchResults />
    </Suspense>
  );
}
