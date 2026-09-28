'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { ProductCard } from '@/components/products/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/lib/types';

export default function WishlistPage() {
  const { token } = useAuth();
  const { items, removeItem, refresh } = useWishlist();
  const { addItem } = useCart();
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleMoveToCart = async (productId: string) => {
    const item = items.find((i) => i.product.id === productId);
    if (!item?.product.variants?.length) return;
    setMovingId(productId);
    try {
      await addItem(item.product.variants[0].id, 1);
      await removeItem(productId);
      await refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setMovingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-x py-16 animate-fade-in">
        <EmptyState
          title="Your wishlist is empty"
          description="Save items you love to find them later."
          action={{ label: 'Discover Products', onClick: () => (window.location.href = '/products') }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-star-white">My Wishlist</h1>
      <p className="text-sm text-star-blue/50">{items.length} item{items.length > 1 ? 's' : ''} saved</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
        {items.map((item, i) => (
          <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <ProductCard product={item.product} />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleMoveToCart(item.product.id)}
                disabled={movingId === item.product.id}
                className="btn btn-primary text-xs flex-1"
              >
                {movingId === item.product.id ? 'Moving...' : 'Move to Cart'}
              </button>
              <button
                onClick={() => removeItem(item.product.id)}
                className="btn btn-secondary text-xs px-3"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
