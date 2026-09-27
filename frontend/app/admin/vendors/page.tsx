'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatDate } from '@/lib/utils';
import type { Vendor, PaginatedResponse } from '@/lib/types';

const PAGE_SIZE = 15;

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

function vendorStatusBadge(status: string) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    SUSPENDED: 'info',
  };
  return <Badge variant={map[status] || 'default'}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
}

export default function AdminVendorsPage() {
  const { token } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reasonModal, setReasonModal] = useState<{ id: string; action: 'REJECTED' | 'SUSPENDED' } | null>(null);
  const [reason, setReason] = useState('');

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    if (status) params.set('status', status);
    try {
      const res = await api.get<PaginatedResponse<Vendor>>(`/admin/vendors?${params.toString()}`, token);
      setVendors(res.vendors || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }, [token, page, status]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const updateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED', reasonText?: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/vendors/${id}/status`, { status: newStatus, reason: reasonText }, token);
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v)));
      setReasonModal(null);
      setReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to update vendor');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-950">Vendors</h2>
        <p className="text-sm text-brand-500 mt-1">{total} total vendors</p>
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
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load vendors"
            description={error}
            action={{ label: 'Retry', onClick: fetchVendors }}
          />
        ) : vendors.length === 0 ? (
          <EmptyState title="No vendors found" description="No vendors match the selected filter." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-100 bg-brand-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Vendor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Products</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Rating</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-brand-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-brand-50/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {vendor.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={vendor.logoUrl} alt={vendor.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-semibold text-brand-600">
                                {vendor.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-brand-950">{vendor.name}</p>
                            <p className="text-xs text-brand-400">{vendor.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-brand-600">{vendor._count?.products || 0}</td>
                      <td className="px-4 py-3 text-brand-600">
                        {vendor.rating.toFixed(1)} ({vendor.totalSales} sales)
                      </td>
                      <td className="px-4 py-3">{vendorStatusBadge(vendor.status)}</td>
                      <td className="px-4 py-3 text-brand-500">
                        {vendor.createdAt ? formatDate(vendor.createdAt) : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {vendor.status === 'PENDING' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                loading={actionLoading === vendor.id}
                                onClick={() => updateStatus(vendor.id, 'APPROVED')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                loading={actionLoading === vendor.id}
                                onClick={() => setReasonModal({ id: vendor.id, action: 'REJECTED' })}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {vendor.status === 'APPROVED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              loading={actionLoading === vendor.id}
                              onClick={() => setReasonModal({ id: vendor.id, action: 'SUSPENDED' })}
                            >
                              Suspend
                            </Button>
                          )}
                          {vendor.status === 'SUSPENDED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              loading={actionLoading === vendor.id}
                              onClick={() => updateStatus(vendor.id, 'APPROVED')}
                            >
                              Reinstate
                            </Button>
                          )}
                          {vendor.status === 'REJECTED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              loading={actionLoading === vendor.id}
                              onClick={() => updateStatus(vendor.id, 'APPROVED')}
                            >
                              Approve
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

      {/* Reason modal */}
      {reasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-brand-950 mb-1">
              {reasonModal.action === 'REJECTED' ? 'Reject Vendor' : 'Suspend Vendor'}
            </h3>
            <p className="text-sm text-brand-500 mb-4">
              Please provide a reason for this action.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason..."
              className="input min-h-[100px] mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setReasonModal(null); setReason(''); }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={actionLoading === reasonModal.id}
                onClick={() => updateStatus(reasonModal.id, reasonModal.action, reason)}
              >
                {reasonModal.action === 'REJECTED' ? 'Reject' : 'Suspend'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
