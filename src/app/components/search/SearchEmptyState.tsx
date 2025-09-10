'use client';

import { Search } from 'lucide-react';

import type { ISearchEmptyStateProps } from '@/types';

export function SearchEmptyState({ hasQuery }: ISearchEmptyStateProps) {
  if (hasQuery) {
    return (
      <div className="text-center py-12" data-testid="empty">
        <Search className="w-12 h-12 text-theme-secondary mx-auto mb-4" data-testid="search-icon" />
        <h3 className="text-lg font-medium text-theme-primary mb-2">No results found</h3>
        <p className="text-theme-secondary">
          Try searching for a different term or check your spelling.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12" data-testid="empty">
      <Search className="w-12 h-12 text-theme-secondary mx-auto mb-4" data-testid="search-icon" />
      <h3 className="text-lg font-medium text-theme-primary mb-2">Start searching</h3>
      <p className="text-theme-secondary">Enter a search term above to find users and game logs.</p>
    </div>
  );
}
