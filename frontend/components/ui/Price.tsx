import React from 'react';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PriceProps {
  price: number;
  discountPrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Price({ price, discountPrice, size = 'md', className }: PriceProps) {
  const hasDiscount = discountPrice != null && discountPrice < price;
  const discount = hasDiscount ? getDiscountPercentage(price, discountPrice) : 0;

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span
        className={cn(
          'font-semibold text-star-white',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-xl'
        )}
      >
        {formatPrice(hasDiscount ? discountPrice : price)}
      </span>
      {hasDiscount && (
        <>
          <span
            className={cn(
              'text-star-blue/40 line-through',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {formatPrice(price)}
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
