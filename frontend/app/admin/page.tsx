'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { Order, User, Product, Vendor } from '@/lib/types';

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVendors: number;
  pendingOrders: number;
}

interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: Order[];
  recentUsers: User[];
  topProducts: Product[];
  topVendors: Vendor[];
  dailySales: DailySales[];
}

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="card p-5">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-20" />
      </div>
    );
  }
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-brand-500">{label}</span>
        <span className="text-brand-300">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-brand-950">{value}</p>
    </div>
  );
}

function orderStatusBadge(status: string) {
  const map: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    CONFIRMED: { variant: 'info', label: 'Confirmed' },
    PROCESSING: { variant: 'info', label: 'Processing' },
    SHIPPED: { variant: 'info', label: 'Shipped' },
    OUT_FOR_DELIVERY: { variant: 'info', label: 'Out for Delivery' },
    DELIVERED: { variant: 'success', label: 'Delivered' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
    REFUNDED: { variant: 'danger', label: 'Refunded' },
  };
  const s = map[status] || { variant: 'default' as const, label: status };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<DashboardData>('/admin/dashboard', token)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (error) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description={error}
        action={{ label: 'Retry', onClick: () => window.location.reload() }}
      />
    );
  }

  const stats = data?.stats;
  const maxRevenue = Math.max(...(data?.dailySales || []).map((d) => d.revenue), 1);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard
          label="Total Users"
          value={stats ? stats.totalUsers.toLocaleString() : ''}
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Vendors"
          value={stats ? stats.totalVendors.toLocaleString() : ''}
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          label="Total Products"
          value={stats ? stats.totalProducts.toLocaleString() : ''}
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={stats ? stats.totalOrders.toLocaleString() : ''}
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Total Revenue"
          value={stats ? formatPrice(stats.totalRevenue) : ''}
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Pending Vendors"
          value={stats ? stats.pendingVendors.toLocaleString() : ''}
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Pending Orders"
          value={stats ? stats.pendingOrders.toLocaleString() : ''}
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Sales Chart + Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-brand-900 mb-6">Daily Sales</h3>
          {loading ? (
            <div className="flex items-end gap-2 h-40">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} className="flex-1" />
              ))}
            </div>
          ) : !data?.dailySales?.length ? (
            <p className="text-sm text-brand-400 text-center py-16">No sales data available</p>
          ) : (
            <div className="flex items-end gap-1.5 h-40">
              {data.dailySales.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-brand-950 rounded-t hover:bg-accent transition-colors cursor-pointer"
                      style={{ height: `${Math.max((day.revenue / maxRevenue) * 140, 2)}px` }}
                      title={`${formatDate(day.date)}: ${formatPrice(day.revenue)} (${day.orders} orders)`}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {formatPrice(day.revenue)}
                    </div>
                  </div>
                  <span className="text-[10px] text-brand-400">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Vendors */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-brand-900 mb-4">Top Vendors</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.topVendors?.length ? (
            <p className="text-sm text-brand-400 text-center py-8">No vendors yet</p>
          ) : (
            <div className="space-y-3">
              {data.topVendors.map((vendor, i) => (
                <div key={vendor.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-brand-300 w-4">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-brand-600">
                      {vendor.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-900 truncate">{vendor.name}</p>
                    <p className="text-xs text-brand-400">{vendor.totalSales} sales</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-950">
                    {formatPrice(vendor.totalSales)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders + Recent Users + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h3 className="text-sm font-semibold text-brand-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-brand-500 hover:text-brand-950">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="px-6 pb-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.recentOrders?.length ? (
            <p className="text-sm text-brand-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-brand-100 bg-brand-50/50">
                    <th className="text-left px-6 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Order</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Items</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Total</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-brand-50/50">
                      <td className="px-6 py-3 font-medium text-brand-950">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-brand-700">
                        {order.shippingAddress?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-brand-600">{order.items.length}</td>
                      <td className="px-4 py-3 font-medium text-brand-950">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">{orderStatusBadge(order.status)}</td>
                      <td className="px-4 py-3 text-brand-500">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h3 className="text-sm font-semibold text-brand-900">Recent Users</h3>
            <Link href="/admin/users" className="text-xs text-brand-500 hover:text-brand-950">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="px-6 pb-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.recentUsers?.length ? (
            <p className="text-sm text-brand-400 text-center py-8">No users yet</p>
          ) : (
            <div className="divide-y divide-brand-100">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-brand-600">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-brand-400 truncate">{user.email}</p>
                  </div>
                  <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'VENDOR' ? 'info' : 'default'}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h3 className="text-sm font-semibold text-brand-900">Top Products by Sales</h3>
          <Link href="/admin/products" className="text-xs text-brand-500 hover:text-brand-950">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="px-6 pb-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data?.topProducts?.length ? (
          <p className="text-sm text-brand-400 text-center py-8">No products yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-brand-100 bg-brand-50/50">
                  <th className="text-left px-6 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Vendor</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Sales</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {data.topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-brand-100 overflow-hidden shrink-0">
                          {product.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium text-brand-950 truncate max-w-[200px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-700">{product.vendor?.name}</td>
                    <td className="px-4 py-3 font-medium text-brand-950">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-brand-600">{product.salesCount}</td>
                    <td className="px-4 py-3 text-brand-600">
                      {product.rating.toFixed(1)} ({product.reviewCount})
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
