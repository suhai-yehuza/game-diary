import React from 'react';

import type { ILoadingSpinnerProps } from '@/lib/types/components.types';

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
  ariaLabel = 'Loading...',
}: ILoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    muted: 'text-gray-400',
    white: 'text-white',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label={ariaLabel}
      data-testid="loading-spinner"
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

// Skeleton loader for content
export function SkeletonLoader({
  className = '',
  lines = 1,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }, (_, i) => `line-${i}-${Date.now()}`).map(uniqueId => (
        <div key={uniqueId} className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 last:mb-0" />
      ))}
    </div>
  );
}

// Card skeleton for floating components
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-500 rounded w-32" />
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => `card-item-${i}-${Date.now()}`).map(uniqueId => (
            <div key={uniqueId} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Convenience components for common use cases
export function PageLoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <LoadingSpinner size="lg" color="primary" data-testid="loading-spinner" />
      <p className="text-gray-600 dark:text-gray-400 text-lg">{text}</p>
    </div>
  );
}

export function CardLoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <LoadingSpinner size="md" color="primary" data-testid="loading-spinner" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
    </div>
  );
}

export function InlineLoadingSpinner() {
  return <LoadingSpinner size="sm" color="primary" data-testid="loading-spinner" />;
}
