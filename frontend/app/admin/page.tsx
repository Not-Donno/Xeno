'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order, User, Product, Vendor } from '@/lib/types';

interface DashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVendors: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [topVendors, setTopVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<{
          stats: DashboardStats;
          recentOrders: Order[];
          recentUsers: User[];
          topProducts: Product[];
          topVendors: Vendor[];
        }>('/admin/dashboard', token);
        if (cancelled) return;
        setStats(res.stats);
        setRecentOrders(res.recentOrders || []);
        setRecentUsers(res.recentUsers || []);
        setTopProducts(res.topProducts || []);
        setTopVendors(res.topVendors || []);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-surface-lighter rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="h-8 bg-surface-lighter rounded w-1/2" />
              <div className="h-3 bg-surface-lighter rounded w-2/3" />
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-surface-lighter rounded" />
            ))}
          </div>
          <div className="card p-6 animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-surface-lighter rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description={error}
        action={{ label: 'Retry', onClick: () => window.location.reload() }}
      />
    );
  }

  const statCards = [
    { label: 'Total Users', value: (stats?.totalUsers ?? 0).toLocaleString(), gradient: 'from-accent to-accent-light', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Total Vendors', value: (stats?.totalVendors ?? 0).toLocaleString(), gradient: 'from-purple-500 to-fuchsia-500', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { label: 'Total Products', value: (stats?.totalProducts ?? 0).toLocaleString(), gradient: 'from-emerald-500 to-teal-400', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Total Orders', value: (stats?.totalOrders ?? 0).toLocaleString(), gradient: 'from-orange-500 to-amber-400', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue ?? 0), gradient: 'from-green-500 to-emerald-400', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Pending Vendors', value: (stats?.pendingVendors ?? 0).toLocaleString(), gradient: 'from-yellow-500 to-orange-400', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Pending Orders', value: (stats?.pendingOrders ?? 0).toLocaleString(), gradient: 'from-red-500 to-rose-400', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-star-white">Dashboard</h1>
        <p className="text-sm text-star-blue/60 mt-1">Welcome back, here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="card card-hover p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
              </svg>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-star-white">{card.value}</div>
            <p className="text-xs text-star-blue/50 mt-2 uppercase tracking-wider font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-star-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-accent hover:text-accent-light transition-colors">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-star-blue/40 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order, i) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg animate-fade-in-up"
                  style={{ animationDelay: `${350 + i * 50}ms` }}
                >
                  <div>
                    <p className="text-sm font-medium text-star-white">{order.orderNumber}</p>
                    <p className="text-xs text-star-blue/50">
                      {order.shippingAddress?.name || '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-star-white">{formatPrice(order.total)}</p>
                    <Badge
                      variant={
                        order.status === 'DELIVERED' ? 'success' :
                        order.status === 'CANCELLED' || order.status === 'REFUNDED' ? 'danger' :
                        order.status === 'PENDING' ? 'warning' : 'info'
                      }
                      className="mt-1"
                    >
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-star-white">Recent Users</h2>
            <Link href="/admin/users" className="text-xs text-accent hover:text-accent-light transition-colors">
              View all
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-star-blue/40 text-center py-8">No users yet</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.slice(0, 5).map((user, i) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg animate-fade-in-up"
                  style={{ animationDelay: `${450 + i * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-star-white">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-star-blue/50">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === 'ADMIN' ? 'info' : user.role === 'VENDOR' ? 'warning' : 'default'}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products by Sales */}
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-star-white">Top Products by Sales</h2>
            <Link href="/admin/products" className="text-xs text-accent hover:text-accent-light transition-colors">
              View all
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-star-blue/40 text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg animate-fade-in-up"
                  style={{ animationDelay: `${550 + i * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-lighter overflow-hidden shrink-0">
                      {product.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-star-white max-w-[180px] truncate">{product.name}</p>
                      <p className="text-xs text-star-blue/50">{product.brand?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-star-white">{product.salesCount} sold</p>
                    <p className="text-xs text-star-blue/50">{formatPrice(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Vendors by Sales */}
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-star-white">Top Vendors by Sales</h2>
            <Link href="/admin/vendors" className="text-xs text-accent hover:text-accent-light transition-colors">
              View all
            </Link>
          </div>
          {topVendors.length === 0 ? (
            <p className="text-sm text-star-blue/40 text-center py-8">No vendors yet</p>
          ) : (
            <div className="space-y-3">
              {topVendors.slice(0, 5).map((vendor, i) => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg animate-fade-in-up"
                  style={{ animationDelay: `${650 + i * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface-lighter flex items-center justify-center shrink-0 overflow-hidden">
                      {vendor.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vendor.logoUrl} alt={vendor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-accent-light">{vendor.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-star-white">{vendor.name}</p>
                      <p className="text-xs text-star-blue/50">{vendor.totalSales} sales</p>
                    </div>
                  </div>
                  <Badge variant={vendor.status === 'APPROVED' ? 'success' : 'warning'}>
                    {vendor.status.charAt(0) + vendor.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
