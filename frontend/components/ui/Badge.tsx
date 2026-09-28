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
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'default' && 'bg-surface-lighter text-star-blue',
        variant === 'success' && 'bg-emerald-500/10 text-emerald-400',
        variant === 'warning' && 'bg-amber-500/10 text-amber-400',
        variant === 'danger' && 'bg-red-500/10 text-red-400',
        variant === 'info' && 'bg-accent/10 text-accent-light',
        className
      )}
    >
      {children}
    </span>
  );
}
