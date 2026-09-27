'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { useWishlist } from '@/lib/wishlist';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images?.[0];

  return (
    <div className={cn('group card overflow-hidden hover:shadow-md transition-shadow', className)}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-brand-50 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discountPrice && (
              <span className="badge bg-accent text-brand-950 text-[10px] font-bold">
                SALE
              </span>
            )}
            {product.isNewArrival && (
              <span className="badge bg-brand-950 text-white text-[10px] font-bold">
                NEW
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/vendors/${product.vendor.slug}`} className="text-[11px] text-brand-400 hover:text-brand-600 uppercase tracking-wide">
          {product.vendor.name}
        </Link>
        <Link href={`/product/${product.slug}`} className="block mt-0.5">
          <h3 className="text-sm font-medium text-brand-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-1">
          <Rating value={product.rating} />
          <span className="text-[11px] text-brand-400">({product.reviewCount})</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Price price={product.price} discountPrice={product.discountPrice} size="sm" />
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleItem(product.id);
            }}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              inWishlist ? 'text-red-500' : 'text-brand-300 hover:text-red-500'
            )}
          >
            <svg className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
