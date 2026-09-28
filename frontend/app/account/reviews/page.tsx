'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EmptyState } from '@/components/ui/EmptyState';
import { Rating } from '@/components/ui/Rating';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/lib/types';

export default function ReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get<{ reviews: Review[] }>('/reviews/my', token)
      .then((res) => setReviews(res.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditBody(review.body);
  };

  const handleSave = async (reviewId: string) => {
    if (!token) return;
    setSaving(true);
    try {
      await api.patch(`/reviews/${reviewId}`, { rating: editRating, body: editBody }, token);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, rating: editRating, body: editBody } : r))
      );
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!token || !confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`, token);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-4 bg-surface-lighter rounded w-1/3 mb-3" />
            <div className="h-3 bg-surface-lighter rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-star-white">My Reviews</h1>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Review products you've purchased to share your experience."
          action={{ label: 'Browse Products', onClick: () => (window.location.href = '/products') }}
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div
              key={review.id}
              className="card p-5 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {editingId === review.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-star-blue/60 mb-2 uppercase tracking-wider">
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <svg
                            className={`w-6 h-6 ${star <= editRating ? 'text-amber-400' : 'text-surface-border'}`}
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
                    <label className="block text-xs font-medium text-star-blue/60 mb-2 uppercase tracking-wider">
                      Review
                    </label>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="input min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(review.id)}
                      disabled={saving}
                      className="btn btn-primary text-xs"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-medium text-star-white">
                        Product #{review.productId.slice(0, 8)}
                      </span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Rating value={review.rating} size="sm" />
                        <span className="text-xs text-star-blue/40">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(review)}
                        className="p-1.5 text-star-blue/40 hover:text-accent rounded-lg hover:bg-accent/10 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-1.5 text-star-blue/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="text-sm font-semibold text-star-white mt-3">{review.title}</h4>
                  )}
                  <p className="text-sm text-star-blue/60 mt-1.5 leading-relaxed">{review.body}</p>
                  {review.response && (
                    <div className="mt-4 pl-4 border-l-2 border-accent/30 bg-surface-light/30 p-3 rounded-r-lg">
                      <p className="text-xs font-medium text-accent/80">Vendor Response:</p>
                      <p className="text-sm text-star-blue/60 mt-1">{review.response.body}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
