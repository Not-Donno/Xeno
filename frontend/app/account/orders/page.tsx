'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/lib/types';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400',
  CONFIRMED: 'bg-blue-500/10 text-blue-400',
  PROCESSING: 'bg-indigo-500/10 text-indigo-400',
  SHIPPED: 'bg-cyan-500/10 text-cyan-400',
  OUT_FOR_DELIVERY: 'bg-teal-500/10 text-teal-400',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
  REFUNDED: 'bg-gray-500/10 text-gray-400',
};

const statusFilters = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '10');
    if (filter !== 'All') params.set('status', filter.toUpperCase());

    api.get<{ orders: Order[]; totalPages: number }>(`/orders?${params}`)
      .then((res) => {
        setOrders(res.orders || []);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, page]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-4 bg-surface-lighter rounded w-1/3 mb-3" />
            <div className="h-3 bg-surface-lighter rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-star-white">My Orders</h1>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
              filter === s
                ? 'bg-accent text-white shadow-glow'
                : 'bg-surface-light text-star-blue/60 hover:text-star-white hover:bg-surface-lighter'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={filter !== 'All' ? 'Try a different filter.' : 'Start shopping to see your orders here.'}
          action={{ label: 'Browse Products', onClick: () => (window.location.href = '/products') }}
        />
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order, i) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="card card-hover p-5 block animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-star-white">{order.orderNumber}</p>
                    <p className="text-xs text-star-blue/50 mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`badge ${statusColors[order.status] || 'bg-surface-lighter text-star-blue/60'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-star-blue/50">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-base font-bold text-accent">{formatPrice(order.total)}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary text-sm px-4 py-2"
              >
                Previous
              </button>
              <span className="text-sm text-star-blue/50">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary text-sm px-4 py-2"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
