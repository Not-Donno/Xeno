'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Rating } from '@/components/ui/Rating';
import { cn, formatDate, truncate } from '@/lib/utils';
import type { Review, PaginatedResponse } from '@/lib/types';

const PAGE_SIZE = 15;

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PENDING', label: 'Pending' },
];

function reviewStatusBadge(status: string) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    APPROVED: 'success',
    REJECTED: 'danger',
    PENDING: 'warning',
  };
  return <Badge variant={map[status] || 'default'}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
}

export default function AdminReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    if (status) params.set('status', status);
    try {
      const res = await api.get<PaginatedResponse<Review>>(`/admin/reviews?${params.toString()}`, token);
      setReviews(res.reviews || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [token, page, status]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const moderate = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/reviews/${id}/moderate`, { status: newStatus }, token);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    } catch (err: any) {
      alert(err.message || 'Failed to moderate review');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-950">Reviews</h2>
        <p className="text-sm text-brand-500 mt-1">{total} total reviews</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-brand-100">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              status === tab.value
                ? 'border-brand-950 text-brand-950'
                : 'border-transparent text-brand-500 hover:text-brand-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load reviews"
            description={error}
            action={{ label: 'Retry', onClick: fetchReviews }}
          />
        ) : reviews.length === 0 ? (
          <EmptyState title="No reviews found" description="No reviews match the selected filter." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-100 bg-brand-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Rating</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Review</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-brand-50/50">
                      <td className="px-6 py-3 text-brand-700 max-w-[160px] truncate">
                        {review.productId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-semibold text-brand-600">
                              {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                            </span>
                          </div>
                          <span className="text-brand-900">
                            {review.user?.firstName} {review.user?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Rating value={review.rating} size="sm" />
                      </td>
                      <td className="px-4 py-3 max-w-[280px]">
                        {review.title && (
                          <p className="font-medium text-brand-900 text-xs mb-0.5">{review.title}</p>
                        )}
                        <p className="text-brand-600 text-xs">{truncate(review.body, 100)}</p>
                      </td>
                      <td className="px-4 py-3">{reviewStatusBadge(review.status)}</td>
                      <td className="px-4 py-3 text-brand-500">
                        {review.createdAt ? formatDate(review.createdAt) : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {review.status !== 'APPROVED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              loading={actionLoading === review.id}
                              onClick={() => moderate(review.id, 'APPROVED')}
                            >
                              Approve
                            </Button>
                          )}
                          {review.status !== 'REJECTED' && (
                            <Button
                              variant="danger"
                              size="sm"
                              loading={actionLoading === review.id}
                              onClick={() => moderate(review.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-brand-100">
                <p className="text-sm text-brand-500">
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
