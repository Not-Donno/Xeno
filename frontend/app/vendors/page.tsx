'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Rating } from '@/components/ui/Rating';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Vendor } from '@/lib/types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get<{ vendors: Vendor[] }>(`/vendors?search=${search}&limit=20`)
      .then((res) => setVendors(res.vendors))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="container-x py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-950">Vendors</h1>
          <p className="text-sm text-brand-500 mt-1">Discover our marketplace sellers</p>
        </div>
        <input
          type="text"
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-64"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="w-16 h-16 bg-brand-100 rounded-full mx-auto mb-3" />
              <div className="h-4 bg-brand-100 rounded w-3/4 mx-auto" />
              <div className="h-3 bg-brand-100 rounded w-1/2 mx-auto mt-2" />
            </div>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <EmptyState title="No vendors found" description="Try a different search term." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.slug}`}
              className="card p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-brand-100 flex items-center justify-center mb-4 overflow-hidden">
                {vendor.logoUrl ? (
                  <Image src={vendor.logoUrl} alt={vendor.name} width={80} height={80} className="object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-brand-400">{vendor.name[0]}</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-brand-900">{vendor.name}</h3>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Rating value={vendor.rating} size="sm" />
                <span className="text-xs text-brand-400">({vendor.totalSales})</span>
              </div>
              <p className="text-xs text-brand-500 mt-2">{vendor._count?.products || 0} products</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
