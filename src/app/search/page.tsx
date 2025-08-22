'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import { useMobileDetection, SearchBar } from '@/app/components/layout/components/SearchBar';
import { SearchEmptyState, SearchResults } from '@/app/components/search';
import type { ISearchResponse } from '@/lib/types';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useMobileDetection();
  const query = searchParams.get('q') ?? '';
  const [_searchInput, _setSearchInput] = useState(query);
  const [results, setResults] = useState<ISearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (query && query.length >= 2) {
      void performSearch(query);
    } else {
      setResults(null);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = (await response.json()) as ISearchResponse;
      setResults(data);
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const _handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams(searchParams);
    params.set('q', searchQuery.trim());
    router.push(`/search?${params.toString()}`);
  };

  // Auto-focus search on mobile when page loads
  useEffect(() => {
    if (isMobile && !query) {
      setIsSearchFocused(true);
    }
  }, [isMobile, query]);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Input - Show prominently on mobile or when no query */}
      {(isMobile || !query) && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <SearchBar
              autoFocus={isMobile && !query}
              isFocused={isSearchFocused}
              setIsFocused={setIsSearchFocused}
            />
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-2 text-muted-foreground">Searching...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {results && query && <SearchResults results={results} query={query} />}

        {/* Empty State - Only show when no query and not on mobile (mobile has search input above) */}
        {!query && !loading && !isMobile && <SearchEmptyState hasQuery={false} />}
      </div>
    </div>
  );
}

function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-2 text-muted-foreground">Loading search...</span>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
