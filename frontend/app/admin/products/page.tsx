'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils';
import type { Product, PaginatedResponse } from '@/lib/types';

const PAGE_SIZE = 15;

function productStatusBadge(status: string) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    PENDING: 'warning',
    REJECTED: 'danger',
    OUT_OF_STOCK: 'info',
  };
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return <Badge variant={map[status] || 'default'}>{label}</Badge>;
}

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status) params.set('status', status);
    try {
      const res = await api.get<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`, token);
      setProducts(res.products || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleStatus = async (product: Product) => {
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setActionLoading(product.id);
    try {
      await api.patch(`/admin/products/${product.id}/status`, { status: newStatus }, token);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p)));
    } catch (err: any) {
      alert(err.message || 'Failed to update product');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProduct = async (id: string) => {
    setActionLoading(id);
    try {
      await api.delete(`/admin/products/${id}`, token);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-bold text-star-white">Products</h2>
        <p className="text-sm text-star-blue/60 mt-1">{total} total products</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-star-blue/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input pl-10 w-72"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
          ]}
          className="w-44"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load products"
            description={error}
            action={{ label: 'Retry', onClick: fetchProducts }}
          />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-light/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Brand</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Stock</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {products.map((product) => {
                    const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
                    return (
                      <tr key={product.id} className="hover:bg-surface-light/50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg bg-surface-lighter overflow-hidden shrink-0">
                              {product.images?.[0] && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-star-white max-w-[220px] truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-star-blue/40">{product.vendor?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-star-blue/80">{product.brand?.name}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-star-white">{formatPrice(product.price)}</span>
                          {product.discountPrice && (
                            <span className="text-xs text-star-blue/40 line-through ml-2">
                              {formatPrice(product.discountPrice)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-star-blue/70">{totalStock}</td>
                        <td className="px-4 py-3">{productStatusBadge(product.status)}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              loading={actionLoading === product.id}
                              onClick={() => toggleStatus(product)}
                            >
                              {product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </Button>
                            {deleteConfirm === product.id ? (
                              <>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  loading={actionLoading === product.id}
                                  onClick={() => deleteProduct(product.id)}
                                >
                                  Confirm
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(product.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
