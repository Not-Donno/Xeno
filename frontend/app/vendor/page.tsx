'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Rating } from '@/components/ui/Rating';
import { Textarea } from '@/components/ui/Input';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  rating: number;
}

interface RecentOrder {
  id: string;
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    createdAt: string;
    user: { firstName: string; lastName: string };
  };
  product: { name: string; slug: string; images: { url: string }[] };
  variant: { size: string; color: string };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
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

interface RecentReview {
  id: string;
  productId: string;
  user: { firstName: string; lastName: string; avatarUrl?: string };
  rating: number;
  title?: string;
  body: string;
  status: string;
  response: { id: string; body: string; createdAt: string } | null;
  createdAt: string;
  product: { name: string; slug: string };
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  recentReviews: RecentReview[];
}

const ORDER_STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'danger',
};

function StatCard({
  label,
  value,
  sub,
  icon,
  delay = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="card card-hover p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-star-blue/60">{label}</p>
          <p className="text-2xl font-bold text-star-white mt-1">{value}</p>
          {sub && <p className="text-xs text-star-blue/40 mt-1">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent-light">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function VendorDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseBody, setResponseBody] = useState('');
  const [responding, setResponding] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<DashboardData>('/vendors/me/dashboard', token);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRespond = async (reviewId: string) => {
    if (!responseBody.trim()) return;
    setResponding(true);
    try {
      await api.post(`/reviews/${reviewId}/respond`, { body: responseBody.trim() }, token);
      setRespondingTo(null);
      setResponseBody('');
      await fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to submit response');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-fade-in">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
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
        <Button variant="accent" onClick={fetchDashboard}>Retry</Button>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentOrders, topProducts, recentReviews } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-star-white">Dashboard</h1>
        <p className="text-sm text-star-blue/50 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          sub={`${stats.activeProducts} active`}
          delay={0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStockCount}
          sub="products at 5 or less"
          delay={100}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          sub={`${stats.pendingOrders} pending`}
          delay={200}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Revenue"
          value={formatPrice(stats.totalRevenue)}
          sub="all time"
          delay={300}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between p-5 border-b border-surface-border/50">
            <h2 className="text-base font-semibold text-star-white">Recent Orders</h2>
            <Link href="/vendor/orders" className="text-sm text-accent-light hover:text-accent transition-colors">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Orders will appear here when customers purchase your products."
            />
          ) : (
            <div className="divide-y divide-surface-border/30">
              {recentOrders.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 hover:bg-surface-light/30 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${300 + i * 60}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-surface-lighter/50 overflow-hidden shrink-0 border border-surface-border/30">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-star-blue/30">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-star-white truncate">{item.product.name}</p>
                    <p className="text-xs text-star-blue/50">
                      {item.order.orderNumber} &middot; {item.variant.color} / {item.variant.size} &middot; Qty {item.quantity}
                    </p>
                    <p className="text-xs text-star-blue/30 mt-0.5">{formatDate(item.order.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-star-white">{formatPrice(item.totalPrice)}</p>
                    <Badge variant={ORDER_STATUS_VARIANT[item.status] || 'default'} className="mt-1">
                      {item.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Rating */}
          <div className="card card-hover p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-base font-semibold text-star-white mb-3">Store Rating</h2>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gradient">{stats.rating.toFixed(1)}</span>
              <div>
                <Rating value={stats.rating} size="md" />
                <p className="text-xs text-star-blue/40 mt-1">Based on customer reviews</p>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="p-5 border-b border-surface-border/50">
              <h2 className="text-base font-semibold text-star-white">Low Stock Alerts</h2>
            </div>
            {stats.lowStockCount === 0 ? (
              <div className="p-5">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-emerald-400">All products are well stocked.</p>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-amber-300">
                    <span className="font-semibold">{stats.lowStockCount}</span> product{stats.lowStockCount > 1 ? 's' : ''} with low stock
                  </p>
                </div>
                <Link href="/vendor/products" className="block mt-3">
                  <Button variant="secondary" size="sm" className="w-full">Manage Inventory</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between p-5 border-b border-surface-border/50">
            <h2 className="text-base font-semibold text-star-white">Top Products</h2>
            <Link href="/vendor/analytics" className="text-sm text-accent-light hover:text-accent transition-colors">
              View analytics
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <EmptyState title="No products yet" description="Create your first product to start selling." />
          ) : (
            <div className="divide-y divide-surface-border/30">
              {topProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 hover:bg-surface-light/30 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${500 + i * 60}ms` }}
                >
                  <span className="text-sm font-bold text-accent-light/60 w-5">#{i + 1}</span>
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-star-white truncate">{product.name}</p>
                    <p className="text-xs text-star-blue/50">{product.salesCount} sold</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-star-white">{formatPrice(product.price)}</p>
                    <Rating value={product.rating} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="p-5 border-b border-surface-border/50">
            <h2 className="text-base font-semibold text-star-white">Recent Reviews</h2>
          </div>
          {recentReviews.length === 0 ? (
            <EmptyState title="No reviews yet" description="Reviews will appear here once customers rate your products." />
          ) : (
            <div className="divide-y divide-surface-border/30">
              {recentReviews.map((review, i) => (
                <div
                  key={review.id}
                  className="p-4 animate-fade-in-up"
                  style={{ animationDelay: `${600 + i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-cosmic-500/30 flex items-center justify-center text-xs font-medium text-accent-light border border-accent/20">
                        {review.user.firstName[0]}{review.user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-star-white">
                          {review.user.firstName} {review.user.lastName}
                        </p>
                        <p className="text-xs text-star-blue/40">{review.product.name}</p>
                      </div>
                    </div>
                    <Rating value={review.rating} size="sm" />
                  </div>
                  <p className="text-sm text-star-blue/70 mt-2">{review.body}</p>

                  {review.response ? (
                    <div className="mt-3 pl-4 border-l-2 border-accent/30 bg-accent/5 rounded-r-lg p-3">
                      <p className="text-xs font-medium text-accent-light">Your response:</p>
                      <p className="text-sm text-star-blue/70 mt-1">{review.response.body}</p>
                    </div>
                  ) : respondingTo === review.id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={responseBody}
                        onChange={(e) => setResponseBody(e.target.value)}
                        placeholder="Write your response..."
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="accent"
                          loading={responding}
                          onClick={() => handleRespond(review.id)}
                          disabled={!responseBody.trim()}
                        >
                          Submit Response
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setRespondingTo(null); setResponseBody(''); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(review.id)}
                      className="mt-2 text-xs font-medium text-accent-light hover:text-accent transition-colors"
                    >
                      Respond to this review
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
