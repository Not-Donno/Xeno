'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';

const statusTabs: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const statusVariant = (status: OrderStatus) => {
  switch (status) {
    case 'DELIVERED': return 'success' as const;
    case 'CANCELLED': return 'danger' as const;
    case 'SHIPPED': return 'info' as const;
    case 'REFUNDED': return 'danger' as const;
    default: return 'warning' as const;
  }
};

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const limit = 10;

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get<{ orders: Order[]; total: number; totalPages: number }>(
        `/orders?${params.toString()}`,
        token
      );
      setOrders(res.orders || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    setExpandedOrder(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-950">Order History</h1>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              'px-4 py-2 text-sm rounded-md border transition-colors',
              statusFilter === tab.value
                ? 'bg-brand-950 text-white border-brand-950'
                : 'bg-white text-brand-600 border-brand-200 hover:border-brand-400'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <EmptyState
          title="Error loading orders"
          description={error}
          action={{ label: 'Retry', onClick: fetchOrders }}
        />
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div className="card p-8">
          <EmptyState
            title="No orders found"
            description={statusFilter ? 'No orders with this status.' : 'You have not placed any orders yet.'}
            action={{ label: 'Start Shopping', onClick: () => (window.location.href = '/products') }}
          />
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              {/* Order Header */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-brand-50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm font-medium text-brand-900">{order.orderNumber}</p>
                    <p className="text-xs text-brand-500 mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-brand-900">{formatPrice(order.total)}</span>
                  <svg
                    className={cn('w-5 h-5 text-brand-400 transition-transform', expandedOrder === order.id && 'rotate-180')}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-brand-100 p-4">
                  {/* Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 rounded-md bg-brand-50 overflow-hidden shrink-0">
                          {item.product.images?.[0] && (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="text-sm font-medium text-brand-900 hover:text-brand-600 line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-brand-500 mt-1">
                            {item.variant.color} / {item.variant.size} &middot; Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-brand-900">{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-brand-50 rounded-md p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-600">Discount</span>
                        <span className="font-medium text-green-600">-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-brand-600">Shipping</span>
                      <span className="font-medium">{formatPrice(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-600">Tax</span>
                      <span className="font-medium">{formatPrice(order.tax)}</span>
                    </div>
                    <hr className="border-brand-200" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="secondary" size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-brand-600">Page {page} of {totalPages}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
