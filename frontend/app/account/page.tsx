'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AccountPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ orders: Order[] }>('/orders?limit=3')
      .then((res) => setOrders(res.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Card */}
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-cosmic-500 flex items-center justify-center text-xl font-bold text-white shadow-glow">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-star-white">{user.firstName} {user.lastName}</h1>
            <p className="text-sm text-star-blue/50 mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{orders.length}</p>
            <p className="text-xs text-star-blue/50 mt-1">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">0</p>
            <p className="text-xs text-star-blue/50 mt-1">Wishlist</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">0</p>
            <p className="text-xs text-star-blue/50 mt-1">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">0</p>
            <p className="text-xs text-star-blue/50 mt-1">Points</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/account/orders', label: 'My Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { href: '/account/wishlist', label: 'Wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
          { href: '/account/addresses', label: 'Addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
          { href: '/account/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card card-hover p-5 flex flex-col items-center text-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
            </div>
            <span className="text-sm font-medium text-star-white">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-star-white">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-surface-lighter rounded w-1/3 mb-2" />
                <div className="h-3 bg-surface-lighter rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-star-blue/50 text-sm">No orders yet</p>
            <Link href="/products" className="inline-block mt-3 text-sm text-accent hover:underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="card card-hover p-4 flex items-center justify-between animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div>
                  <p className="text-sm font-medium text-star-white">{order.orderNumber}</p>
                  <p className="text-xs text-star-blue/50 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-star-white">{formatPrice(order.total)}</p>
                  <span
                    className={`badge mt-1 ${
                      order.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : order.status === 'CANCELLED'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
