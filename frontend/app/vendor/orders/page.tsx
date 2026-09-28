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
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

interface OrderItem {
  id: string;
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
    shippingAddress: any;
    user: { firstName: string; lastName: string; email: string };
  };
  product: { name: string; slug: string; images: { url: string }[] };
  variant: { size: string; color: string; sku: string };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
}

const PAGE_SIZE = 10;

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'danger',
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

// Allowed forward transitions from each status
const NEXT_STATUSES: Record<string, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function VendorOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get<{ items: OrderItem[]; total: number; totalPages: number }>(
        `/vendors/me/orders?${params.toString()}`,
        token
      );
      setOrders(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleStatusUpdate = async (orderItemId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderItemId);
    setError('');
    try {
      await api.patch(`/vendors/me/orders/${orderItemId}/status`, { status: newStatus }, token);
      await fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-star-white">Orders</h1>
        <p className="text-sm text-star-blue/50 mt-1">Manage and track your order fulfillments</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border',
              statusFilter === tab.value
                ? 'bg-accent text-white border-accent shadow-glow'
                : 'bg-surface-light text-star-blue/70 border-surface-border hover:border-accent/30 hover:text-star-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 animate-fade-in">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card overflow-hidden animate-fade-in">
          <div className="divide-y divide-surface-border/30">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card animate-fade-in-up">
          <EmptyState
            title="No orders found"
            description={statusFilter ? 'No orders with this status.' : 'Orders will appear here when customers purchase your products.'}
          />
        </div>
      ) : (
        <>
          <div className="card overflow-x-auto animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border/50">
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Order</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Variant</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Qty</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/30">
                {orders.map((item, i) => {
                  const nextStatuses = NEXT_STATUSES[item.status] || [];
                  const isExpanded = expandedId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={cn(
                          'hover:bg-surface-light/30 transition-colors animate-fade-in-up',
                          isExpanded && 'bg-surface-light/20'
                        )}
                        style={{ animationDelay: `${200 + i * 40}ms` }}
                      >
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="text-sm font-medium text-accent-light hover:text-accent transition-colors"
                          >
                            {item.order.orderNumber}
                          </button>
                          <p className="text-xs text-star-blue/40">
                            {item.order.user.firstName} {item.order.user.lastName}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-lighter/50 overflow-hidden shrink-0 border border-surface-border/30">
                              {item.product.images?.[0] ? (
                                <Image
                                  src={item.product.images[0].url}
                                  alt={item.product.name}
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
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-star-white truncate max-w-[180px]">{item.product.name}</p>
                              <p className="text-xs text-star-blue/40">{item.variant.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-star-blue/70">
                          {item.variant.color} / {item.variant.size}
                        </td>
                        <td className="px-4 py-3 text-sm text-star-blue/70">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-medium text-star-white">
                          {formatPrice(item.totalPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm text-star-blue/50">
                          {formatDate(item.order.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[item.status] || 'default'}>
                            {STATUS_LABELS[item.status] || item.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {nextStatuses.length > 0 && (
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) handleStatusUpdate(item.id, e.target.value as OrderStatus);
                                }}
                                disabled={updatingId === item.id}
                                className="input text-xs py-1.5 px-3 w-auto bg-surface-lighter/50"
                              >
                                <option value="">
                                  {updatingId === item.id ? 'Updating...' : 'Update status'}
                                </option>
                                {nextStatuses.map((s) => (
                                  <option key={s} value={s}>
                                    {STATUS_LABELS[s]}
                                  </option>
                                ))}
                              </select>
                            )}
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="btn btn-secondary px-3 py-1.5 text-xs rounded-lg"
                            >
                              {isExpanded ? 'Hide' : 'Details'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="px-4 py-5 bg-surface-light/20 border-t border-surface-border/20">
                            <div className="grid sm:grid-cols-3 gap-4">
                              <div>
                                <h4 className="text-xs font-semibold text-accent-light uppercase tracking-wide mb-2">
                                  Customer
                                </h4>
                                <p className="text-sm text-star-white">
                                  {item.order.user.firstName} {item.order.user.lastName}
                                </p>
                                <p className="text-sm text-star-blue/50">{item.order.user.email}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-accent-light uppercase tracking-wide mb-2">
                                  Shipping Address
                                </h4>
                                {item.order.shippingAddress ? (
                                  <div className="text-sm text-star-blue/70">
                                    <p>{item.order.shippingAddress.name}</p>
                                    <p>{item.order.shippingAddress.line1}</p>
                                    {item.order.shippingAddress.line2 && <p>{item.order.shippingAddress.line2}</p>}
                                    <p>
                                      {item.order.shippingAddress.city}, {item.order.shippingAddress.state}{' '}
                                      {item.order.shippingAddress.postalCode}
                                    </p>
                                    <p>{item.order.shippingAddress.country}</p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-star-blue/40">No address provided</p>
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-accent-light uppercase tracking-wide mb-2">
                                  Order Summary
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-star-blue/50">Order Total</span>
                                    <span className="text-star-white">{formatPrice(item.order.total)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-star-blue/50">Item Price</span>
                                    <span className="text-star-white">{formatPrice(item.unitPrice)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-star-blue/50">Quantity</span>
                                    <span className="text-star-white">{item.quantity}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-star-blue/50">Item Total</span>
                                    <span className="text-star-white font-medium">{formatPrice(item.totalPrice)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {nextStatuses.length > 0 && (
                              <div className="mt-5 pt-4 border-t border-surface-border/30">
                                <h4 className="text-xs font-semibold text-accent-light uppercase tracking-wide mb-3">
                                  Update Status
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {nextStatuses.map((s) => (
                                    <Button
                                      key={s}
                                      size="sm"
                                      variant={s === 'CANCELLED' ? 'danger' : 'accent'}
                                      loading={updatingId === item.id}
                                      onClick={() => handleStatusUpdate(item.id, s)}
                                    >
                                      Mark as {STATUS_LABELS[s]}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 animate-fade-in">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary text-sm px-4 py-2 rounded-lg"
              >
                Previous
              </button>
              <span className="text-sm text-star-blue/60 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary text-sm px-4 py-2 rounded-lg"
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
