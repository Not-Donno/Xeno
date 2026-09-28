'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Rating } from '@/components/ui/Rating';
import { Select } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import type { Vendor, Product } from '@/lib/types';

function VendorStoreContent() {
  const params = useParams();
  const slug = params.slug as string;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setLoading(true);
    api.get<{ vendor: Vendor }>(`/vendors/${slug}`)
      .then((res) => setVendor(res.vendor))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('sort', sort);
    params.set('limit', '12');
    api.get<{ products: Product[] }>(`/vendors/${slug}/products?${params}`)
      .then((res) => setProducts(res.products))
      .catch(() => {});
  }, [slug, sort]);

  if (loading) {
    return (
      <div>
        <div className="h-48 bg-surface animate-pulse" />
        <div className="container-x py-8">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container-x py-16">
        <EmptyState title="Vendor not found" description="This store does not exist." />
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-surface overflow-hidden">
        {vendor.bannerUrl && (
          <Image src={vendor.bannerUrl} alt={vendor.name} fill className="object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-space-950 to-transparent" />
      </div>

      <div className="container-x">
        {/* Vendor Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="w-24 h-24 rounded-full bg-surface-lighter border-4 border-space-950 flex items-center justify-center overflow-hidden shadow-card">
              {vendor.logoUrl ? (
                <Image src={vendor.logoUrl} alt={vendor.name} width={96} height={96} className="object-cover" />
              ) : (
                <span className="text-3xl font-bold text-accent">{vendor.name[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-star-white">{vendor.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-star-blue/60">
                <div className="flex items-center gap-1.5">
                  <Rating value={vendor.rating} size="sm" />
                  <span>({vendor.totalSales} sales)</span>
                </div>
                <span>{vendor._count?.products || 0} products</span>
              </div>
            </div>
          </div>
          {vendor.description && (
            <p className="mt-4 text-star-blue/70 max-w-2xl leading-relaxed">{vendor.description}</p>
          )}
          {vendor.socialLinks && (
            <div className="flex gap-3 mt-4">
              {vendor.socialLinks.website && (
                <a
                  href={vendor.socialLinks.website}
                  target="_blank"
                  rel="noopener"
                  className="text-sm text-accent/70 hover:text-accent transition-colors"
                >
                  Website
                </a>
              )}
              {vendor.socialLinks.instagram && (
                <span className="text-sm text-star-blue/50">Instagram: {vendor.socialLinks.instagram}</span>
              )}
            </div>
          )}
        </div>

        {/* Tabs & Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4 border-b border-surface-border">
            {['all', 'shoes', 'clothing', 'accessories'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize transition-all duration-300 ${
                  activeTab === tab
                    ? 'border-accent text-accent'
                    : 'border-transparent text-star-blue/50 hover:text-star-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={[
              { value: 'newest', label: 'Newest' },
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'popular', label: 'Most Popular' },
              { value: 'rating', label: 'Top Rated' },
            ]}
            className="w-40"
          />
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <EmptyState title="No products" description="This vendor hasn't added any products yet." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8 pb-12">
            {products.map((product, i) => (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendorStorePage() {
  return (
    <Suspense fallback={
      <div>
        <div className="h-48 bg-surface animate-pulse" />
        <div className="container-x py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-square bg-surface-lighter animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-surface-lighter rounded animate-pulse" />
                  <div className="h-3 bg-surface-lighter rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <VendorStoreContent />
    </Suspense>
  );
}
