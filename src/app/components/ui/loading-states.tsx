import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { SkeletonCard, SkeletonTable, SkeletonList } from './skeleton';

// Enhanced loading spinner with consistent styling
export const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'brand' | 'muted';
  }
>(({ className, size = 'md', variant = 'default', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const variantClasses = {
    default: 'text-foreground',
    brand: 'text-brand-primary',
    muted: 'text-muted-foreground',
  };

  return (
    <div ref={ref} className={cn('flex items-center justify-center', className)} {...props}>
      <Loader2 className={cn('animate-spin', sizeClasses[size], variantClasses[variant])} />
    </div>
  );
});
LoadingSpinner.displayName = 'LoadingSpinner';

// Full page loading state
export const PageLoading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    message?: string;
  }
>(({ className, message = 'Loading...', ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col items-center justify-center min-h-[200px] space-y-4', className)}
    {...props}
  >
    <LoadingSpinner size="lg" variant="brand" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
));
PageLoading.displayName = 'PageLoading';

// Inline loading state
export const InlineLoading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    message?: string;
  }
>(({ className, message, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center space-x-2', className)} {...props}>
    <LoadingSpinner size="sm" variant="muted" />
    {message && <span className="text-sm text-muted-foreground">{message}</span>}
  </div>
));
InlineLoading.displayName = 'InlineLoading';

// Content loading with skeleton
export const ContentLoading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type?: 'card' | 'table' | 'list';
    count?: number;
  }
>(({ className, type = 'card', count = 3, ...props }, ref) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'table':
        return <SkeletonTable />;
      case 'list':
        return <SkeletonList count={count} />;
      case 'card':
      default:
        return (
          <div className="grid gap-4">
            {Array.from({ length: count }).map((_, _i) => (
              <SkeletonCard key={`skeleton-${Math.random()}`} />
            ))}
          </div>
        );
    }
  };

  return (
    <div ref={ref} className={cn('w-full', className)} {...props}>
      {renderSkeleton()}
    </div>
  );
});
ContentLoading.displayName = 'ContentLoading';

// Button loading state
export const ButtonLoading = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    children: React.ReactNode;
  }
>(({ className, loading = false, children, disabled, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center space-x-2',
      'disabled:opacity-50 disabled:pointer-events-none',
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <LoadingSpinner size="sm" variant="default" />}
    <span>{children}</span>
  </button>
));
ButtonLoading.displayName = 'ButtonLoading';

// Tab loading state
export const TabLoading = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-center py-8', className)} {...props}>
      <LoadingSpinner size="md" variant="brand" />
    </div>
  )
);
TabLoading.displayName = 'TabLoading';
