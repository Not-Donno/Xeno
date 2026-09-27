'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/products/ProductCard';
import type { WishlistItem } from '@/lib/types';

export default function WishlistPage() {
  const { token } = useAuth();
  const { addItem } = useCart();
  const { items, removeItem, loading: contextLoading } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [movingToCart, setMovingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .get<{ items: WishlistItem[] }>('/wishlist', token)
      .then(() => {
        // Context will handle the data
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load wishlist');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleRemove = async (productId: string) => {
    try {
      await removeItem(productId);
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
    }
  };

  const handleMoveToCart = async (productId: string) => {
    const item = items.find((i) => i.product.id === productId);
    if (!item?.product.variants?.length) {
      alert('This product has no variants available.');
      return;
    }
    const variant = item.product.variants[0];
    setMovingToCart(productId);
    try {
      await addItem(variant.id, 1);
      await removeItem(productId);
    } catch (err: any) {
      alert(err.message || 'Failed to move to cart');
    } finally {
      setMovingToCart(null);
    }
  };

  if (loading || contextLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-brand-950">My Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-brand-950">My Wishlist</h1>
        <EmptyState
          title="Error loading wishlist"
          description={error}
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-950">My Wishlist</h1>
        {items.length > 0 && (
          <span className="text-sm text-brand-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            title="Your wishlist is empty"
            description="Save items you love to your wishlist and they will appear here."
            action={{ label: 'Browse Products', onClick: () => (window.location.href = '/products') }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <ProductCard product={item.product} />
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="p-2 bg-white border border-brand-200 rounded-full shadow-sm hover:bg-red-50 hover:border-red-200 text-brand-400 hover:text-red-500 transition-colors"
                  title="Remove from wishlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => handleMoveToCart(item.product.id)}
                  disabled={movingToCart === item.product.id}
                  className="p-2 bg-white border border-brand-200 rounded-full shadow-sm hover:bg-brand-50 text-brand-400 hover:text-brand-950 transition-colors disabled:opacity-50"
                  title="Move to cart"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
