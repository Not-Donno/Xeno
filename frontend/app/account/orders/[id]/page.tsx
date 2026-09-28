'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/lib/types';

const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function OrderDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<{ order: Order }>(`/orders/${id}`)
      .then((res) => setOrder(res.order))
      .catch((err: any) => setError(err.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-surface-lighter rounded animate-pulse" />
        <div className="card p-6 space-y-4 animate-pulse">
          <div className="h-4 bg-surface-lighter rounded w-1/3" />
          <div className="h-4 bg-surface-lighter rounded w-1/2" />
          <div className="h-32 bg-surface-lighter rounded" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-x py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-star-white">Order not found</h1>
          <p className="text-star-blue/50 mt-2">{error}</p>
          <Link href="/account/orders" className="inline-block mt-4">
            <button className="btn btn-primary">Back to Orders</button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/account/orders" className="text-star-blue/50 hover:text-accent transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-star-white">{order.orderNumber}</h1>
      </div>

      {/* Status Timeline */}
      {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
        <div className="card p-6 animate-fade-in-up">
          <h2 className="text-sm font-semibold text-star-white mb-6 uppercase tracking-wider">Order Status</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                        isCompleted
                          ? 'bg-accent text-white shadow-glow'
                          : 'bg-surface-lighter text-star-blue/30'
                      } ${isCurrent ? 'scale-110' : ''}`}
                    >
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] text-center leading-tight max-w-[60px] ${isCompleted ? 'text-accent' : 'text-star-blue/30'}`}>
                      {step.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${i < currentStepIndex ? 'bg-accent' : 'bg-surface-lighter'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="card p-6 animate-fade-in-up animation-delay-200">
        <h2 className="text-sm font-semibold text-star-white mb-5 uppercase tracking-wider">Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-3 bg-surface-light/50 rounded-lg">
              <div className="w-16 h-16 bg-surface-lighter rounded-lg overflow-hidden shrink-0">
                {item.product.images?.[0] && (
                  <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.product.slug}`} className="text-sm font-medium text-star-white hover:text-accent transition-colors">
                  {item.product.name}
                </Link>
                <p className="text-xs text-star-blue/50 mt-1">
                  {item.variant.color} / {item.variant.size}
                </p>
                <p className="text-xs text-star-blue/40 mt-0.5">
                  Sold by <Link href={`/vendors/${item.vendor.slug}`} className="hover:text-accent transition-colors">{item.vendor.name}</Link>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-star-white">{formatPrice(item.totalPrice)}</p>
                <p className="text-xs text-star-blue/40 mt-1">x{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 animate-fade-in-up animation-delay-400">
          <h2 className="text-sm font-semibold text-star-white mb-4 uppercase tracking-wider">Shipping Address</h2>
          <div className="text-sm text-star-blue/70 space-y-1">
            <p className="font-medium text-star-white">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="card p-6 animate-fade-in-up animation-delay-600">
          <h2 className="text-sm font-semibold text-star-white mb-4 uppercase tracking-wider">Order Summary</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-star-blue/60">Subtotal</span>
              <span className="text-star-white">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-star-blue/60">Discount</span>
                <span className="text-emerald-400">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-star-blue/60">Shipping</span>
              <span className="text-star-white">{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-star-blue/60">Tax</span>
              <span className="text-star-white">{formatPrice(order.tax)}</span>
            </div>
            <hr className="border-surface-border" />
            <div className="flex justify-between text-base font-bold">
              <span className="text-star-white">Total</span>
              <span className="text-accent">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-star-blue/40">Payment</span>
              <span className={order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div className="container-x py-8">
        <div className="h-8 w-48 bg-surface-lighter rounded animate-pulse mb-6" />
        <div className="card p-6 animate-pulse space-y-4">
          <div className="h-4 bg-surface-lighter rounded w-1/3" />
          <div className="h-32 bg-surface-lighter rounded" />
        </div>
      </div>
    }>
      <OrderDetailContent />
    </Suspense>
  );
}
