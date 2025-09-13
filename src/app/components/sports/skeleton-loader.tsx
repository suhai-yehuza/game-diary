'use client';

import type { ISkeletonLoaderProps } from '@/types';

export function SkeletonLoader({
  count = 6,
  className = '',
  variant = 'card',
}: ISkeletonLoaderProps) {
  const renderSkeletonItem = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="bg-surface-card rounded-lg p-4 shadow-sm border border-theme-primary animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-bg-theme-secondary rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-bg-theme-secondary rounded w-3/4" />
                <div className="h-3 bg-bg-theme-secondary rounded w-1/2" />
              </div>
              <div className="w-16 h-6 bg-bg-theme-secondary rounded" />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="flex items-center space-x-4 p-4 animate-pulse">
            <div className="w-10 h-10 bg-bg-theme-secondary rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-bg-theme-secondary rounded w-1/3" />
              <div className="h-3 bg-bg-theme-secondary rounded w-1/4" />
            </div>
            <div className="w-12 h-4 bg-bg-theme-secondary rounded" />
          </div>
        );

      case 'table':
        return (
          <div className="flex items-center space-x-4 p-3 border-b border-theme-primary animate-pulse">
            <div className="w-8 h-8 bg-bg-theme-secondary rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-bg-theme-secondary rounded w-1/4" />
              <div className="h-3 bg-bg-theme-secondary rounded w-1/6" />
            </div>
            <div className="w-16 h-4 bg-bg-theme-secondary rounded" />
            <div className="w-12 h-4 bg-bg-theme-secondary rounded" />
          </div>
        );

      default:
        return <div className="bg-gray-300 dark:bg-gray-600 rounded animate-pulse h-20" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderSkeletonItem()}</div>
      ))}
    </div>
  );
}

// Specific skeleton components for different data types
export function PlayerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
        </div>
        <div className="flex flex-col space-y-2">
          <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
        <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20" />
        </div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8" />
        <div className="flex items-center space-x-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20" />
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16" />
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="w-24 h-8 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
    </div>
  );
}
