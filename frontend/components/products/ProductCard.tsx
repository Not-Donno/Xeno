'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { useWishlist } from '@/lib/wishlist';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images?.[0];

  return (
    <div
      className={cn(
        'group card card-hover overflow-hidden',
        className
      )}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-surface-lighter overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-accent/40">
              <Icon name="box" size={48} />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.discountPrice && (
              <span className="badge bg-accent text-white text-[10px] font-bold shadow-glow">
                SALE
              </span>
            )}
            {product.isNewArrival && (
              <span className="badge bg-cosmic-500 text-white text-[10px] font-bold">
                NEW
              </span>
            )}
          </div>
          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleItem(product.id);
            }}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full transition-all duration-300',
              inWishlist
                ? 'bg-red-500 text-white shadow-lg scale-110'
                : 'bg-surface-light/80 text-star-blue/60 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100'
            )}
          >
            <svg className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link
          href={`/vendors/${product.vendor.slug}`}
          className="text-[11px] text-accent/70 hover:text-accent uppercase tracking-wider font-medium transition-colors"
        >
          {product.vendor.name}
        </Link>
        <Link href={`/product/${product.slug}`} className="block mt-1">
          <h3 className="text-sm font-medium text-star-white line-clamp-2 group-hover:text-accent transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-1.5">
          <Rating value={product.rating} />
          <span className="text-[11px] text-star-blue/50">({product.reviewCount})</span>
        </div>
        <div className="mt-3">
          <Price price={product.price} discountPrice={product.discountPrice} size="sm" />
        </div>
      </div>
    </div>
  );
}
