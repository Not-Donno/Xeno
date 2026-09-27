'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Rating } from '@/components/ui/Rating';
import { Select } from '@/components/ui/Input';
import type { Vendor, Product } from '@/lib/types';

export default function VendorStorePage() {
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
        <div className="h-48 bg-brand-100 animate-pulse" />
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
      <div className="relative h-48 md:h-64 bg-brand-900 overflow-hidden">
        {vendor.bannerUrl && (
          <Image src={vendor.bannerUrl} alt={vendor.name} fill className="object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="container-x">
        {/* Vendor Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
              {vendor.logoUrl ? (
                <Image src={vendor.logoUrl} alt={vendor.name} width={96} height={96} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-400">
                  {vendor.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-brand-950">{vendor.name}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-brand-500">
                <div className="flex items-center gap-1">
                  <Rating value={vendor.rating} size="sm" showValue />
                </div>
                <span>{vendor._count?.products || 0} products</span>
                <span>{vendor.totalSales} sales</span>
              </div>
            </div>
          </div>
          {vendor.description && (
            <p className="mt-4 text-brand-600 max-w-2xl">{vendor.description}</p>
          )}
          {vendor.socialLinks && (
            <div className="flex gap-3 mt-3">
              {vendor.socialLinks.website && (
                <a href={vendor.socialLinks.website} target="_blank" rel="noopener" className="text-sm text-brand-500 hover:text-brand-950">
                  Website
                </a>
              )}
              {vendor.socialLinks.instagram && (
                <span className="text-sm text-brand-500">Instagram: {vendor.socialLinks.instagram}</span>
              )}
            </div>
          )}
        </div>

        {/* Tabs & Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4 border-b border-brand-100">
            {['all', 'shoes', 'clothing', 'accessories'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${
                  activeTab === tab ? 'border-brand-950 text-brand-950' : 'border-transparent text-brand-500'
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
