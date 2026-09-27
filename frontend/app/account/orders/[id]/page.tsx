'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';

const statusSteps: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Order Placed' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
];

const statusVariant = (status: OrderStatus) => {
  switch (status) {
    case 'DELIVERED': return 'success' as const;
    case 'CANCELLED': return 'danger' as const;
    case 'REFUNDED': return 'danger' as const;
    case 'SHIPPED': return 'info' as const;
    case 'OUT_FOR_DELIVERY': return 'info' as const;
    default: return 'warning' as const;
  }
};

const paymentStatusVariant = (status: string) => {
  switch (status) {
    case 'PAID': return 'success' as const;
    case 'FAILED': return 'danger' as const;
    case 'REFUNDED': return 'danger' as const;
    default: return 'warning' as const;
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const orderId = params.id as string;
  const success = searchParams.get('success');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ order: Order }>(`/orders/${orderId}`, token);
      setOrder(res.order);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [token, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleSubmitReview = async (productId: string) => {
    setReviewError('');
    if (!reviewForm.body.trim()) {
      setReviewError('Review body is required');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/product/${productId}`, reviewForm, token);
      setReviewModal(null);
      setReviewForm({ rating: 5, title: '', body: '' });
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <EmptyState
        title="Order not found"
        description={error || 'The order you are looking for does not exist.'}
        action={{ label: 'Back to Orders', onClick: () => router.push('/account/orders') }}
      />
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.status === order.status);
  const isDelivered = order.status === 'DELIVERED';

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          Order placed successfully! Thank you for your purchase.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/account/orders" className="text-sm text-brand-500 hover:text-brand-950">
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-brand-950 mt-1">Order {order.orderNumber}</h1>
          <p className="text-sm text-brand-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusVariant(order.status)} className="text-sm px-3 py-1">
          {order.status}
        </Badge>
      </div>

      {/* Status Timeline */}
      {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-brand-900 mb-4">Order Status</h2>
          <div className="flex items-center">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <React.Fragment key={step.status}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2',
                        isCompleted
                          ? 'bg-brand-950 text-white border-brand-950'
                          : 'bg-white text-brand-400 border-brand-200',
                        isCurrent && 'ring-2 ring-brand-950 ring-offset-2'
                      )}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className={cn('text-[10px] mt-1 text-center max-w-[60px]', isCompleted ? 'text-brand-900 font-medium' : 'text-brand-400')}>
                      {step.label}
                    </span>
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-1', idx < currentStepIndex ? 'bg-brand-950' : 'bg-brand-200')} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-900 mb-4">Items ({order.items.length})</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-brand-100 last:border-0 last:pb-0">
                  <Link href={`/product/${item.product.slug}`} className="shrink-0">
                    <div className="w-20 h-20 rounded-md bg-brand-50 overflow-hidden">
                      {item.product.images?.[0] && (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="text-sm font-medium text-brand-900 hover:text-brand-600 line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-brand-500 mt-1">
                      {item.variant.color} / {item.variant.size}
                    </p>
                    <p className="text-xs text-brand-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-brand-900 mt-2">{formatPrice(item.totalPrice)}</p>
                  </div>
                  {isDelivered && (
                    <div className="shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setReviewModal(item.product.id);
                          setReviewForm({ rating: 5, title: '', body: '' });
                          setReviewError('');
                        }}
                      >
                        Write Review
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-900 mb-4">Shipping Address</h2>
            {order.shippingAddress && (
              <div className="text-sm text-brand-600 space-y-1">
                <p className="font-medium text-brand-900">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="text-brand-500">{order.shippingAddress.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-sm font-semibold text-brand-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
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
              <hr className="border-brand-100" />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mt-6 pt-4 border-t border-brand-100">
              <h3 className="text-xs font-semibold text-brand-900 mb-2">Payment</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-600">
                  {order.paymentMethod || 'Test Payment'}
                </span>
                <Badge variant={paymentStatusVariant(order.paymentStatus)}>
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.payment && (
                <p className="text-xs text-brand-400 mt-1">
                  Transaction: {order.payment.transactionId || 'N/A'}
                </p>
              )}
            </div>

            {order.notes && (
              <div className="mt-4 pt-4 border-t border-brand-100">
                <h3 className="text-xs font-semibold text-brand-900 mb-1">Notes</h3>
                <p className="text-sm text-brand-600">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-brand-950 mb-4">Write a Review</h2>
            {reviewError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 mb-4">
                {reviewError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1"
                    >
                      <svg
                        className={cn('w-6 h-6', star <= reviewForm.rating ? 'text-yellow-400' : 'text-brand-200')}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="input"
                  placeholder="Review title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Review *</label>
                <textarea
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="Share your experience with this product"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  loading={submittingReview}
                  onClick={() => handleSubmitReview(reviewModal)}
                >
                  Submit Review
                </Button>
                <Button variant="secondary" onClick={() => setReviewModal(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
