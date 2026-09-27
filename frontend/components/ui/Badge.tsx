import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        variant === 'default' && 'bg-brand-100 text-brand-700',
        variant === 'success' && 'bg-green-100 text-green-800',
        variant === 'warning' && 'bg-yellow-100 text-yellow-800',
        variant === 'danger' && 'bg-red-100 text-red-800',
        variant === 'info' && 'bg-blue-100 text-blue-800',
        className
      )}
    >
      {children}
    </span>
  );
}
