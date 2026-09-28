'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Rating } from '@/components/ui/Rating';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

interface AnalyticsStats {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  rating: number;
}

interface TopProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salesCount: number;
  rating: number;
  images: { url: string }[];
}

interface RecentOrder {
  id: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
}

interface AnalyticsData {
  stats: AnalyticsStats;
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500',
  CONFIRMED: 'bg-blue-400',
  PROCESSING: 'bg-blue-500',
  SHIPPED: 'bg-blue-600',
  OUT_FOR_DELIVERY: 'bg-indigo-500',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function VendorAnalyticsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<AnalyticsData>('/vendors/me/dashboard', token);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-fade-in">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-400 mb-4">{error}</p>
        <Button variant="accent" onClick={fetchAnalytics}>Retry</Button>
      </div>
    );
  }

  if (!data) return null;

  const { stats, topProducts, recentOrders } = data;
  const maxSales = Math.max(...topProducts.map((p) => p.salesCount), 1);

  // Compute order status breakdown from recent orders as a sample
  const statusCounts: Record<string, number> = {};
  recentOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const totalForBreakdown = Math.max(recentOrders.length, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-star-white">Analytics</h1>
        <p className="text-sm text-star-blue/50 mt-1">Performance insights for your store</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card card-hover p-5 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <p className="text-sm text-star-blue/60">Total Revenue</p>
          <p className="text-2xl font-bold text-star-white mt-1">{formatPrice(stats.totalRevenue)}</p>
          <p className="text-xs text-emerald-400 mt-1">All time</p>
        </div>
        <div className="card card-hover p-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-star-blue/60">Total Orders</p>
          <p className="text-2xl font-bold text-star-white mt-1">{stats.totalOrders}</p>
          <p className="text-xs text-star-blue/40 mt-1">Lifetime</p>
        </div>
        <div className="card card-hover p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-star-blue/60">Pending Orders</p>
          <p className="text-2xl font-bold text-star-white mt-1">{stats.pendingOrders}</p>
          <p className="text-xs text-amber-400 mt-1">Needs attention</p>
        </div>
        <div className="card card-hover p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <p className="text-sm text-star-blue/60">Store Rating</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-gradient">{stats.rating.toFixed(1)}</span>
            <Rating value={stats.rating} size="sm" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales by Product (bar chart) */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="p-5 border-b border-surface-border/50">
            <h2 className="text-base font-semibold text-star-white">Sales by Product</h2>
            <p className="text-xs text-star-blue/40 mt-0.5">Top 5 products by units sold</p>
          </div>
          {topProducts.length === 0 ? (
            <EmptyState title="No sales data" description="Sales data will appear once products are sold." />
          ) : (
            <div className="p-5 space-y-5">
              {topProducts.map((product, i) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${300 + i * 80}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm font-medium text-star-white hover:text-accent-light transition-colors truncate max-w-[70%]"
                    >
                      {product.name}
                    </Link>
                    <span className="text-sm text-star-blue/50 shrink-0">{product.salesCount} sold</span>
                  </div>
                  <div className="w-full h-3 bg-surface-lighter/50 rounded-full overflow-hidden border border-surface-border/30">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-cosmic-400 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.max((product.salesCount / maxSales) * 100, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="p-5 border-b border-surface-border/50">
            <h2 className="text-base font-semibold text-star-white">Order Status Breakdown</h2>
            <p className="text-xs text-star-blue/40 mt-0.5">Based on recent orders</p>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" description="Order status breakdown will appear once orders come in." />
          ) : (
            <div className="p-5">
              {/* Stacked bar */}
              <div className="flex h-5 rounded-full overflow-hidden mb-6 border border-surface-border/30 shadow-card">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div
                    key={status}
                    className={cn('h-full transition-all duration-700 ease-out', STATUS_COLORS[status] || 'bg-star-blue/30')}
                    style={{ width: `${(count / totalForBreakdown) * 100}%` }}
                    title={`${STATUS_LABELS[status]}: ${count}`}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(statusCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count], i) => (
                    <div
                      key={status}
                      className="flex items-center gap-2 animate-fade-in-up"
                      style={{ animationDelay: `${400 + i * 60}ms` }}
                    >
                      <div className={cn('w-3 h-3 rounded-sm shrink-0', STATUS_COLORS[status] || 'bg-star-blue/30')} />
                      <span className="text-sm text-star-blue/70">
                        {STATUS_LABELS[status] || status}
                      </span>
                      <span className="text-sm text-star-blue/40 ml-auto">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Products Table */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="p-5 border-b border-surface-border/50">
          <h2 className="text-base font-semibold text-star-white">Top Performing Products</h2>
        </div>
        {topProducts.length === 0 ? (
          <EmptyState title="No products yet" description="Add products to see performance data." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border/50">
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">#</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Units Sold</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Rating</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/30">
                {topProducts.map((product, i) => (
                  <tr
                    key={product.id}
                    className="hover:bg-surface-light/30 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${500 + i * 60}ms` }}
                  >
                    <td className="px-4 py-3 text-sm font-bold text-accent-light/60">#{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-lighter/50 overflow-hidden shrink-0 border border-surface-border/30">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-star-blue/30">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-sm font-medium text-star-white hover:text-accent-light transition-colors truncate max-w-[200px]"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-star-blue/70">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-star-white">{product.salesCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Rating value={product.rating} size="sm" />
                        <span className="text-xs text-star-blue/40">({product.rating.toFixed(1)})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-emerald-400">
                      {formatPrice(product.price * product.salesCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
