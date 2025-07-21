'use client';

import { Search, User, Gamepad2, Calendar, Star } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import type { ISearchResult, ISearchResponse } from '@/lib/types';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [results, setResults] = useState<ISearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove unused search hook since we're using URL params directly

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderUserResult = (user: ISearchResult) => (
    <div
      key={`user-${user.id}`}
      className="flex items-center space-x-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-foreground truncate">
            {user.first_name ?? ''} {user.last_name ?? ''}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            User
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">@{user.username ?? 'unknown'}</p>
        <p className="text-xs text-muted-foreground">Joined {formatDate(user.created_at)}</p>
      </div>
    </div>
  );

  const renderGameLogResult = (gameLog: ISearchResult) => (
    <div
      key={`game-log-${gameLog.id}`}
      className="flex items-center space-x-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-foreground truncate">
            Game Log #{gameLog.game_id ?? 'unknown'}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Game Log
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>@{gameLog.username ?? 'unknown'}</span>
          </span>
          {gameLog.rating_for_game !== undefined && gameLog.rating_for_game !== null && (
            <span className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>{gameLog.rating_for_game}/5</span>
            </span>
          )}
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(gameLog.created_at)}</span>
          </span>
        </div>
        {gameLog.classification && (
          <p className="text-xs text-muted-foreground mt-1">
            Classification: {gameLog.classification}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Global Search</h1>

        {/* Search Results Summary */}
        {query && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing results for:{' '}
              <span className="font-medium text-foreground">&quot;{query}&quot;</span>
            </p>
          </div>
        )}
      </div>

      {/* Search Results */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-2 text-muted-foreground">Searching...</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {results && query && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {results.data.totalUsers + results.data.totalGameLogs} results for &quot;{query}
              &quot;
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{results.data.totalUsers} users</span>
              <span>{results.data.totalGameLogs} game logs</span>
            </div>
          </div>

          {/* Users Section */}
          {results.data.users.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Users ({results.data.totalUsers})</span>
              </h2>
              <div className="space-y-3">{results.data.users.map(renderUserResult)}</div>
            </div>
          )}

          {/* Game Logs Section */}
          {results.data.gameLogs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Gamepad2 className="w-5 h-5" />
                <span>Game Logs ({results.data.totalGameLogs})</span>
              </h2>
              <div className="space-y-3">{results.data.gameLogs.map(renderGameLogResult)}</div>
            </div>
          )}

          {/* No Results */}
          {results.data.users.length === 0 && results.data.gameLogs.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try searching for a different term or check your spelling.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!query && !loading && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Start searching</h3>
          <p className="text-muted-foreground">
            Enter a search term above to find users and game logs.
          </p>
        </div>
      )}
    </div>
  );
}

function SearchPageFallback() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Global Search</h1>
      </div>
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
