'use client';

import { Search } from 'lucide-react';

interface ISearchEmptyStateProps {
  hasQuery: boolean;
}

export function SearchEmptyState({ hasQuery }: ISearchEmptyStateProps) {
  if (hasQuery) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
        <p className="text-muted-foreground">
          Try searching for a different term or check your spelling.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Start searching</h3>
      <p className="text-muted-foreground">
        Enter a search term above to find users and game logs.
      </p>
    </div>
  );
}
