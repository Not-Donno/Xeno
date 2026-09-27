'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Input';
import type { Product, Category, Brand } from '@/lib/types';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [sports, setSports] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    sport: searchParams.get('sport') || '',
    type: searchParams.get('type') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || '',
    minRating: searchParams.get('minRating') || '',
    inStock: searchParams.get('inStock') || '',
    onSale: searchParams.get('onSale') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  useEffect(() => {
    api.get<{ categories: Category[] }>('/categories?type=SPORT').then((r) => setSports(r.categories)).catch(() => {});
    api.get<{ categories: Category[] }>('/categories?type=PRODUCT_TYPE').then((r) => setProductTypes(r.categories)).catch(() => {});
    api.get<{ brands: Brand[] }>('/brands').then((r) => setBrands(r.brands)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', String(page));
    params.set('limit', '12');

    try {
      const res = await api.get<{ products: Product[]; total: number; totalPages: number }>(
        `/products?${params.toString()}`
      );
      setProducts(res.products);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '', sport: '', type: '', brand: '', minPrice: '', maxPrice: '',
      size: '', color: '', minRating: '', inStock: '', onSale: '', sort: 'newest',
    });
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => value && key !== 'sort').length;

  return (
    <div className="container-x py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-950">All Products</h1>
          <p className="text-sm text-brand-500 mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn btn-secondary text-sm"
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <Select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            options={[
              { value: 'newest', label: 'Newest' },
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'rating', label: 'Top Rated' },
              { value: 'popular', label: 'Most Popular' },
              { value: 'name', label: 'Name A-Z' },
            ]}
            className="w-40"
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-56 shrink-0`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-brand-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-brand-500 hover:text-brand-950">
                  Clear all
                </button>
              )}
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search products..."
                className="input text-sm"
              />
            </div>

            {/* Sport */}
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1">Sport</label>
              <Select
                value={filters.sport}
                onChange={(e) => updateFilter('sport', e.target.value)}
                options={[
                  { value: '', label: 'All Sports' },
                  ...sports.map((s) => ({ value: s.slug, label: s.name })),
                ]}
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1">Category</label>
              <Select
                value={filters.type}
                onChange={(e) => updateFilter('type', e.target.value)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...productTypes.map((t) => ({ value: t.slug, label: t.name })),
                ]}
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1">Brand</label>
              <Select
                value={filters.brand}
                onChange={(e) => updateFilter('brand', e.target.value)}
                options={[
                  { value: '', label: 'All Brands' },
                  ...brands.map((b) => ({ value: b.slug, label: b.name })),
                ]}
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="input text-sm w-1/2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="input text-sm w-1/2"
                />
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1">Size</label>
              <input
                type="text"
                value={filters.size}
                onChange={(e) => updateFilter('size', e.target.value)}
                placeholder="e.g. M, 10"
                className="input text-sm"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1">Color</label>
              <input
                type="text"
                value={filters.color}
                onChange={(e) => updateFilter('color', e.target.value)}
                placeholder="e.g. Black"
                className="input text-sm"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1">Min Rating</label>
              <Select
                value={filters.minRating}
                onChange={(e) => updateFilter('minRating', e.target.value)}
                options={[
                  { value: '', label: 'Any Rating' },
                  { value: '4', label: '4+ Stars' },
                  { value: '3', label: '3+ Stars' },
                  { value: '2', label: '2+ Stars' },
                ]}
              />
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-brand-700">
                <input
                  type="checkbox"
                  checked={filters.inStock === 'true'}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                  className="rounded border-brand-300"
                />
                In Stock Only
              </label>
              <label className="flex items-center gap-2 text-sm text-brand-700">
                <input
                  type="checkbox"
                  checked={filters.onSale === 'true'}
                  onChange={(e) => updateFilter('onSale', e.target.checked ? 'true' : '')}
                  className="rounded border-brand-300"
                />
                On Sale Only
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search terms."
              action={{ label: 'Clear Filters', onClick: clearFilters }}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary text-sm px-3 py-1.5"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-brand-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary text-sm px-3 py-1.5"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container-x py-8"><ProductGridSkeleton count={12} /></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
