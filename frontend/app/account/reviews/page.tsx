'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import type { Review, Order } from '@/lib/types';

export default function ReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [form, setForm] = useState({ rating: 5, title: '', body: '', productId: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);

  const fetchReviews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get<{ reviews: Review[] }>('/reviews/admin/all?status=APPROVED', token);
      setReviews(res.reviews || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchDeliveredOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get<{ orders: Order[] }>('/orders?status=DELIVERED&limit=50', token);
      setDeliveredOrders(res.orders || []);
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    fetchReviews();
    fetchDeliveredOrders();
  }, [fetchReviews, fetchDeliveredOrders]);

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setForm({
      rating: review.rating,
      title: review.title || '',
      body: review.body,
      productId: review.productId,
    });
    setShowForm(true);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.body.trim()) {
      setFormError('Review body is required');
      return;
    }

    setSaving(true);
    try {
      if (editingReview) {
        await api.patch(`/reviews/${editingReview.id}`, form, token);
      } else {
        await api.post(`/reviews/product/${form.productId}`, form, token);
      }
      await fetchReviews();
      setShowForm(false);
      setEditingReview(null);
      setForm({ rating: 5, title: '', body: '', productId: '' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`, token);
      await fetchReviews();
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReview(null);
    setForm({ rating: 5, title: '', body: '', productId: '' });
    setFormError('');
  };

  // Get unique products from delivered orders that haven't been reviewed
  const reviewedProductIds = new Set(reviews.map((r) => r.productId));
  const reviewableProducts = deliveredOrders.flatMap((order) =>
    order.items.map((item) => item.product)
  ).filter((product, index, self) =>
    index === self.findIndex((p) => p.id === product.id) && !reviewedProductIds.has(product.id)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-brand-950">My Reviews</h1>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-950">My Reviews</h1>

      {/* Write Review Form */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-brand-950 mb-4">Write a Review</h2>
        {reviewableProducts.length === 0 ? (
          <p className="text-sm text-brand-500">No delivered products available for review.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1">Select Product</label>
              <div className="flex flex-wrap gap-2">
                {reviewableProducts.slice(0, 10).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setForm({ ...form, productId: product.id })}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors ${
                      form.productId === product.id
                        ? 'border-brand-950 bg-brand-950 text-white'
                        : 'border-brand-200 hover:border-brand-400'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-brand-100 overflow-hidden shrink-0">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="truncate max-w-[150px]">{product.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {form.productId && (
              <Button variant="primary" onClick={() => setShowForm(true)}>Write Review</Button>
            )}
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-brand-950 mb-4">
              {editingReview ? 'Edit Review' : 'Write a Review'}
            </h2>
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1"
                    >
                      <svg
                        className={`w-6 h-6 ${star <= form.rating ? 'text-yellow-400' : 'text-brand-200'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Review title"
              />
              <Textarea
                label="Review *"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Share your experience with this product"
                required
              />
              <div className="flex gap-3">
                <Button type="submit" variant="primary" loading={saving}>
                  {editingReview ? 'Update Review' : 'Submit Review'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <EmptyState
          title="Error loading reviews"
          description={error}
          action={{ label: 'Retry', onClick: fetchReviews }}
        />
      )}

      {/* Empty */}
      {!loading && !error && reviews.length === 0 && (
        <div className="card p-8">
          <EmptyState
            title="No reviews yet"
            description="Share your experience with products you have purchased."
          />
        </div>
      )}

      {/* Reviews List */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Rating value={review.rating} size="sm" />
                    <span className="text-xs text-brand-400">{formatDate(review.createdAt)}</span>
                    <Badge variant="success">{review.status}</Badge>
                  </div>
                  {review.title && (
                    <h3 className="text-sm font-semibold text-brand-900 mb-1">{review.title}</h3>
                  )}
                  <p className="text-sm text-brand-600">{review.body}</p>
                  {review.response && (
                    <div className="mt-3 pl-4 border-l-2 border-brand-200">
                      <p className="text-xs font-medium text-brand-500">Vendor Response:</p>
                      <p className="text-sm text-brand-600 mt-1">{review.response.body}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(review)}
                    className="text-xs text-brand-500 hover:text-brand-950"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
