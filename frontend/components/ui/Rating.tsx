import React from 'react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function Rating({ value, max = 5, size = 'sm', showValue, className }: RatingProps) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  const textClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          className={cn(
            sizeClass,
            'transition-colors duration-200',
            i < Math.round(value) ? 'text-amber-400' : 'text-surface-border'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {showValue && <span className={cn('ml-1.5 text-star-blue/60', textClass)}>{value.toFixed(1)}</span>}
    </div>
  );
}
