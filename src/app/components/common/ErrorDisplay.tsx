import React from 'react';

import { ErrorDisplay as NewErrorDisplay, InlineError } from '@/app/components/ui/error-states';
import type { IErrorDisplayProps } from '@/types';

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
    <NewErrorDisplay
      title={title}
      message={errorMessage}
      onRetry={showRetry ? onRetry : undefined}
      variant={variant === 'default' ? 'default' : 'minimal'}
      className={className}
    />
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

export function InlineErrorDisplay({ error }: { error: string | Error }) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error';

  return <InlineError message={errorMessage} />;
}
