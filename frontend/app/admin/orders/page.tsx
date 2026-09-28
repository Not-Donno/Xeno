'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { Order, OrderStatus, PaginatedResponse } from '@/lib/types';

const PAGE_SIZE = 15;

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

function statusBadge(status: string) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    PROCESSING: 'info',
    SHIPPED: 'info',
    OUT_FOR_DELIVERY: 'info',
    DELIVERED: 'success',
    CANCELLED: 'danger',
    REFUNDED: 'danger',
  };
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return <Badge variant={map[status] || 'default'}>{label}</Badge>;
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    if (status) params.set('status', status);
    try {
      const res = await api.get<PaginatedResponse<Order>>(`/admin/orders?${params.toString()}`, token);
      setOrders(res.orders || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token, page, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}`, { status: newStatus }, token);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-bold text-star-white">Orders</h2>
        <p className="text-sm text-star-blue/60 mt-1">{total} total orders</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1 border-b border-surface-border animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <button
          onClick={() => {
            setStatus('');
            setPage(1);
          }}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            status === '' ? 'border-accent text-accent' : 'border-transparent text-star-blue/50 hover:text-star-white'
          )}
        >
          All
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              status === s ? 'border-accent text-accent' : 'border-transparent text-star-blue/50 hover:text-star-white'
            )}
          >
            {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load orders"
            description={error}
            action={{ label: 'Retry', onClick: fetchOrders }}
          />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders found" description="No orders match the selected filter." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-light/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Order</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Items</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr
                        className="hover:bg-surface-light/50 cursor-pointer transition-colors"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <td className="px-6 py-3 font-medium text-star-white">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-star-blue/80">
                          {order.shippingAddress?.name || '—'}
                          <span className="block text-xs text-star-blue/40">
                            {order.shippingAddress?.email || ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-star-blue/70">{order.items.length}</td>
                        <td className="px-4 py-3 font-medium text-star-white">{formatPrice(order.total)}</td>
                        <td className="px-4 py-3">{statusBadge(order.status)}</td>
                        <td className="px-4 py-3 text-star-blue/60">{formatDate(order.createdAt)}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                              options={ORDER_STATUSES.map((s) => ({
                                value: s,
                                label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                              }))}
                              className="w-40 py-1.5 text-xs"
                              disabled={actionLoading === order.id}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                              {expandedOrder === order.id ? 'Hide' : 'Details'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedOrder === order.id && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-surface-light/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                              {/* Order items */}
                              <div>
                                <h4 className="text-xs font-semibold text-star-blue/50 uppercase tracking-wider mb-3">
                                  Items
                                </h4>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                      <div>
                                        <span className="font-medium text-star-white">{item.product?.name}</span>
                                        <span className="text-star-blue/40 ml-2">
                                          {item.variant?.color} / {item.variant?.size}
                                        </span>
                                      </div>
                                      <span className="text-star-blue/70">
                                        {item.quantity} x {formatPrice(item.unitPrice)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t border-surface-border mt-3 pt-3 space-y-1 text-sm">
                                  <div className="flex justify-between text-star-blue/70">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                  </div>
                                  {order.discount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                      <span>Discount</span>
                                      <span>-{formatPrice(order.discount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-star-blue/70">
                                    <span>Shipping</span>
                                    <span>{formatPrice(order.shipping)}</span>
                                  </div>
                                  <div className="flex justify-between text-star-blue/70">
                                    <span>Tax</span>
                                    <span>{formatPrice(order.tax)}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold text-star-white pt-1">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                  </div>
                                </div>
                              </div>
                              {/* Shipping address */}
                              <div>
                                <h4 className="text-xs font-semibold text-star-blue/50 uppercase tracking-wider mb-3">
                                  Shipping Address
                                </h4>
                                {order.shippingAddress ? (
                                  <div className="text-sm text-star-blue/80 space-y-1">
                                    <p className="font-medium text-star-white">{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.line1}</p>
                                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                                    <p>
                                      {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                                      {order.shippingAddress.postalCode}
                                    </p>
                                    <p>{order.shippingAddress.country}</p>
                                    <p className="text-star-blue/50">{order.shippingAddress.phone}</p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-star-blue/40">No address provided</p>
                                )}
                                {order.notes && (
                                  <div className="mt-4">
                                    <h4 className="text-xs font-semibold text-star-blue/50 uppercase tracking-wider mb-2">
                                      Notes
                                    </h4>
                                    <p className="text-sm text-star-blue/80">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border">
                <p className="text-sm text-star-blue/60">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
