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
import { Input, Select } from '@/components/ui/Input';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

const PAGE_SIZE = 10;

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  ACTIVE: 'success',
  DRAFT: 'warning',
  INACTIVE: 'danger',
  PENDING: 'info',
};

export default function VendorProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status) params.set('status', status);
      const res = await api.get<{ products: Product[]; total: number; totalPages: number }>(
        `/products/vendor/me?${params.toString()}`,
        token
      );
      setProducts(res.products);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm((c) => (c === id ? null : c)), 3000);
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/products/vendor/me/${id}`, token);
      setDeleteConfirm(null);
      await fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const getStock = (product: Product) => {
    if (!product.variants?.length) return 0;
    return product.variants.reduce((sum, v) => sum + v.stock, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold text-star-white">Products</h1>
          <p className="text-sm text-star-blue/50 mt-1">{total} products total</p>
        </div>
        <Link href="/vendor/products/new">
          <Button variant="accent">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex-1">
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'PENDING', label: 'Pending' },
          ]}
          className="sm:w-48"
        />
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
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="card animate-fade-in-up">
          <EmptyState
            title="No products found"
            description={debouncedSearch || status ? 'Try adjusting your filters.' : 'Create your first product to start selling.'}
            action={!debouncedSearch && !status ? { label: 'Add Product', href: '/vendor/products/new' } : undefined}
          />
        </div>
      ) : (
        <>
          <div className="card overflow-x-auto animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border/50">
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Brand</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Stock</th>
                  <th className="text-left text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-star-blue/50 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/30">
                {products.map((product, i) => {
                  const stock = getStock(product);
                  const primaryImage = product.images?.[0];
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-surface-light/30 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${200 + i * 40}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-surface-lighter/50 overflow-hidden shrink-0 border border-surface-border/30">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.url}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-star-blue/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-star-white truncate max-w-[200px]">{product.name}</p>
                            <p className="text-xs text-star-blue/40">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-star-blue/70">{product.brand?.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-star-white">{formatPrice(product.price)}</span>
                        {product.discountPrice && (
                          <span className="block text-xs text-emerald-400">{formatPrice(product.discountPrice)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-sm', stock <= 5 ? 'text-red-400 font-medium' : 'text-star-blue/70')}>
                          {stock}
                        </span>
                        {stock <= 5 && <span className="block text-xs text-red-400/60">Low</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[product.status] || 'default'}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/product/${product.slug}`}
                            className="btn btn-secondary px-3 py-1.5 text-xs rounded-lg"
                          >
                            View
                          </Link>
                          <Link
                            href={`/vendor/products/${product.id}/edit`}
                            className="btn btn-secondary px-3 py-1.5 text-xs rounded-lg"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting}
                            className={cn(
                              'btn px-3 py-1.5 text-xs rounded-lg transition-all duration-300',
                              deleteConfirm === product.id
                                ? 'bg-red-600 text-white hover:bg-red-700 shadow-glow'
                                : 'btn-secondary hover:border-red-500/30 hover:text-red-400'
                            )}
                          >
                            {deleteConfirm === product.id ? 'Confirm?' : 'Delete'}
                          </button>
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
