import React from 'react';
import Link from 'next/link';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-star-blue/40">{icon}</div>}
      <h3 className="text-lg font-semibold text-star-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-star-blue/60 mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="primary">{action.label}</Button>
          </Link>
        ) : (
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
