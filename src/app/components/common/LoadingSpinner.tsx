import React from 'react';

import type { ILoadingSpinnerProps } from '@/lib/types';

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantClasses = {
  default: 'border-gray-300 dark:border-gray-600',
  primary: 'border-blue-600 dark:border-blue-400',
  secondary: 'border-gray-400 dark:border-gray-500',
};

export function LoadingSpinner({
  size = 'md',
  text,
  className = '',
  variant = 'default',
}: ILoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${variantClasses[variant]}`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">{text}</p>}
    </div>
  );
}

// Convenience components for common use cases
export function PageLoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="xl" text={text} variant="primary" />
    </div>
  );
}

export function CardLoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="lg" text={text} variant="primary" />
    </div>
  );
}

export function InlineLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <LoadingSpinner size="sm" text={text} variant="default" />
    </div>
  );
}
