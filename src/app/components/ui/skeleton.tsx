import * as React from 'react';

import { cn } from '@/lib/utils';

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
  )
);
Skeleton.displayName = 'Skeleton';

// Pre-built skeleton components for common patterns
export const SkeletonCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-lg border bg-card p-4 space-y-3', className)} {...props}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
);
SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonTable = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: 5 }).map((_, _i) => (
        <div key={`skeleton-item-${Math.random()}`} className="flex space-x-4">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
);
SkeletonTable.displayName = 'SkeletonTable';

export const SkeletonList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { count?: number }
>(({ className, count = 3, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-4', className)} {...props}>
    {Array.from({ length: count }).map((_, _i) => (
      <div key={`skeleton-list-${Math.random()}`} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
));
SkeletonList.displayName = 'SkeletonList';

export const SkeletonButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => (
  <Skeleton
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center',
      {
        'h-8 w-20': size === 'sm',
        'h-10 w-24': size === 'md',
        'h-12 w-32': size === 'lg',
      },
      className
    )}
    {...props}
  />
));
SkeletonButton.displayName = 'SkeletonButton';

export const SkeletonAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => (
  <Skeleton
    ref={ref}
    className={cn(
      'rounded-full',
      {
        'h-8 w-8': size === 'sm',
        'h-10 w-10': size === 'md',
        'h-12 w-12': size === 'lg',
      },
      className
    )}
    {...props}
  />
));
SkeletonAvatar.displayName = 'SkeletonAvatar';

export { Skeleton };
