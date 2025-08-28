'use client';

import { Search } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import type { ISportsEmptyStateProps } from '@/lib/types';

// Interface moved to src/lib/types/components.types.ts

export function EmptyState({ hasActiveFilters, onClearFilters }: ISportsEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No games found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {hasActiveFilters
            ? 'Try adjusting your filters to find more games.'
            : 'There are no games available at the moment.'}
        </p>
        {hasActiveFilters && (
          <Button onClick={onClearFilters} variant="outline">
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
