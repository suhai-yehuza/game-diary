import React from 'react';

import type { IErrorDisplayProps } from '@/types';

const variantClasses = {
  default:
    'bg-semantic-error/10 border-semantic-error/20 text-semantic-error dark:bg-semantic-error/20 dark:border-semantic-error/30 dark:text-semantic-error',
  danger:
    'bg-semantic-error/10 border-semantic-error/20 text-semantic-error dark:bg-semantic-error/20 dark:border-semantic-error/30 dark:text-semantic-error',
  destructive:
    'bg-semantic-error/10 border-semantic-error/20 text-semantic-error dark:bg-semantic-error/20 dark:border-semantic-error/30 dark:text-semantic-error',
  warning:
    'bg-semantic-warning/10 border-semantic-warning/20 text-semantic-warning dark:bg-semantic-warning/20 dark:border-semantic-warning/30 dark:text-semantic-warning',
};

export function ErrorDisplay({
  error,
  title = 'An error occurred',
  onRetry,
  variant = 'default',
  className = '',
  showRetry = true,
}: IErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error';

  return (
    <div className={`p-4 border rounded-md ${variantClasses[variant]} ${className}`}>
      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm mb-4">{errorMessage}</p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-brand-primary text-text-inverse rounded-md hover:bg-brand-primary-hover transition-colors text-sm"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Convenience components for common use cases
export function PageErrorDisplay({
  error,
  title = 'Something went wrong',
  onRetry,
}: {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <ErrorDisplay error={error} title={title} onRetry={onRetry} />
    </div>
  );
}

export function CardErrorDisplay({
  error,
  title = 'Error loading content',
  onRetry,
}: {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <ErrorDisplay error={error} title={title} onRetry={onRetry} />
    </div>
  );
}

export function InlineErrorDisplay({
  error,
  title,
  onRetry,
}: {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-4">
      <ErrorDisplay error={error} title={title} onRetry={onRetry} showRetry={false} />
    </div>
  );
}
