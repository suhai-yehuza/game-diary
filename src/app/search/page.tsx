'use client';

import * as Icons from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import { useMobileDetection, SearchBar } from '@/app/components/layout/components/SearchBar';
import { SearchEmptyState } from '@/app/components/search/SearchEmptyState';
import { SearchResults } from '@/app/components/search/SearchResults';
import type { ISearchResponse } from '@/types';

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
      <div className="px-4 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
              <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Searching...
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Finding the best results for you
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <Icons.AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                    Search Error
                  </h3>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {results && query && (
            <SearchResults results={{ ...results, page: 1, limit: 20 }} query={query} />
          )}

          {/* Empty State - Only show when no query and not on mobile (mobile has search input above) */}
          {!query && !loading && !isMobile && <SearchEmptyState hasQuery={false} />}
        </div>
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
