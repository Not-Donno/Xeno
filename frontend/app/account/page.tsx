'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useWishlist } from '@/lib/wishlist';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order, Review } from '@/lib/types';

export default function AccountPage() {
  const { token, user } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      api.get<{ orders: Order[]; total: number }>('/orders?page=1&limit=3', token),
      api.get<{ reviews: Review[] }>('/reviews/admin/all?status=APPROVED', token),
    ])
      .then(([ordersRes, reviewsRes]) => {
        setOrders(ordersRes.orders || []);
        setTotalOrders(ordersRes.total || 0);
        setReviews(reviewsRes.reviews || []);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load account data');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading account"
        description={error}
        action={{ label: 'Retry', onClick: () => window.location.reload() }}
      />
    );
  }

  const quickLinks = [
    { href: '/account/orders', label: 'View Orders', count: totalOrders },
    { href: '/account/wishlist', label: 'Wishlist', count: wishlistCount },
    { href: '/account/addresses', label: 'Addresses' },
    { href: '/account/reviews', label: 'My Reviews' },
    { href: '/account/settings', label: 'Settings' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-950">My Account</h1>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-200 flex items-center justify-center text-xl font-medium text-brand-700 overflow-hidden shrink-0">
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt="" width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <span>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-brand-950">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-brand-500">{user?.email}</p>
            {user?.createdAt && (
              <p className="text-xs text-brand-400 mt-1">
                Member since {formatDate(user.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="card p-4 hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-brand-950">
              {link.count !== undefined ? link.count : '—'}
            </p>
            <p className="text-sm text-brand-500 mt-1">{link.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-950">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-brand-600 hover:text-brand-950">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="card p-8">
            <EmptyState
              title="No orders yet"
              description="When you place an order, it will appear here."
              action={{ label: 'Start Shopping', onClick: () => (window.location.href = '/products') }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-brand-900">{order.orderNumber}</p>
                  <p className="text-xs text-brand-500 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      order.status === 'DELIVERED'
                        ? 'success'
                        : order.status === 'CANCELLED'
                        ? 'danger'
                        : order.status === 'SHIPPED'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {order.status}
                  </Badge>
                  <span className="text-sm font-medium text-brand-900">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
