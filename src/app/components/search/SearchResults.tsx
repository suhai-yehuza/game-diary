'use client';

import { User, Trophy, Gamepad2, Building2, Search, RotateCcw, Settings } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

import { GameLogSearchResult } from '@/app/components/search/GameLogSearchResult';
import { GameSearchResult } from '@/app/components/search/GameSearchResult';
import { PlayerSearchResult } from '@/app/components/search/PlayerSearchResult';
import { SearchAnalytics, useSearchAnalytics } from '@/app/components/search/SearchAnalytics';
import { TeamSearchResult } from '@/app/components/search/TeamSearchResult';
import { UserSearchResult } from '@/app/components/search/UserSearchResult';
import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';
import type { ISearchResultsProps, IResultType } from '@/types';

export function SearchResults({ results, query }: ISearchResultsProps) {
  const [activeFilter, setActiveFilter] = useState<IResultType>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'name'>('relevance');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchStartTime] = useState(Date.now());
  const { trackSearchInteraction } = useSearchAnalytics();

  // Helper function to get count for each filter type
  const getFilterCount = useCallback(
    (filter: IResultType): number => {
      switch (filter) {
        case 'all':
          // Use total from API response
          return results.total || 0;
        case 'users':
          return results.facets?.type?.find(f => f.value === 'users')?.count || 0;
        case 'games':
          return results.facets?.type?.find(f => f.value === 'games')?.count || 0;
        case 'gameLogs':
          return results.facets?.type?.find(f => f.value === 'gameLogs')?.count || 0;
        case 'teams':
          return results.facets?.type?.find(f => f.value === 'teams')?.count || 0;
        case 'players':
          return results.facets?.type?.find(f => f.value === 'players')?.count || 0;
        default:
          return 0;
      }
    },
    [results.total, results.facets]
  );

  // Enhanced search insights
  const searchInsights = useMemo(() => {
    const total = getFilterCount('all');
    const mostRelevant =
      total > 0
        ? (Object.entries({
            users: results.results?.filter(r => r.type === 'user').length || 0,
            games: results.results?.filter(r => r.type === 'game').length || 0,
            gameLogs: results.results?.filter(r => r.type === 'gameLog').length || 0,
            teams: results.results?.filter(r => r.type === 'team').length || 0,
            players: results.results?.filter(r => r.type === 'player').length || 0,
          }).sort(([, a], [, b]) => b - a)[0][0] as IResultType)
        : null;

    return { total, mostRelevant };
  }, [results.results, getFilterCount]);

  const handleFilterChange = useCallback(
    (filter: IResultType) => {
      setActiveFilter(filter);
      trackSearchInteraction('filter_change', { filter, query });
    },
    [query, trackSearchInteraction]
  );

  const handleSortChange = useCallback(
    (sort: 'relevance' | 'date' | 'name') => {
      setSortBy(sort);
      trackSearchInteraction('sort_change', { sort, query });
    },
    [query, trackSearchInteraction]
  );

  return (
    <SearchAnalytics
      query={query}
      resultsCount={searchInsights.total}
      searchTime={Date.now() - searchStartTime}
      category="search_results"
      filters={{ activeFilter, sortBy }}
    >
      <div className="max-w-4xl mx-auto space-y-8" data-testid="search-results">
        {/* Modern Results Header */}
        <div className="bg-gradient-to-r from-surface-card to-bg-theme-secondary rounded-xl p-4 sm:p-6 border border-theme-primary shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-theme-primary">Search Results</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-theme-secondary">
                <span className="font-medium">
                  {formatNumberShort(searchInsights.total)} results found
                </span>
                <span className="hidden sm:inline">•</span>
                <span>
                  Results for:&nbsp;
                  <span className="font-medium text-theme-primary">&quot;{query}&quot;</span>
                </span>
                {searchInsights.mostRelevant && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>Most relevant category: {searchInsights.mostRelevant}</span>
                  </>
                )}
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-theme-secondary bg-surface-card border border-theme-primary rounded-md hover:bg-bg-theme-secondary transition-colors"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                </span>
                <span className="sm:hidden">{showAdvancedFilters ? 'Hide' : 'Advanced'}</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="border-t border-theme-primary pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Sort by
                  </label>
                  <select
                    value={`Sort by ${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}`}
                    onChange={e => {
                      const value = e.target.value.replace('Sort by ', '').toLowerCase() as
                        | 'relevance'
                        | 'date'
                        | 'name';
                      handleSortChange(value);
                    }}
                    className="w-full px-3 py-2 text-sm bg-surface-card border border-theme-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="Sort by Relevance">Sort by Relevance</option>
                    <option value="Sort by Date">Sort by Date</option>
                    <option value="Sort by Name">Sort by Name</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'bg-semantic-info/10 text-semantic-info border border-semantic-info/30 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-bg-theme-secondary border border-transparent'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All ({formatNumberShort(searchInsights.total)})
            </button>
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'users'
                  ? 'bg-semantic-success/10 text-semantic-success border border-semantic-success/30 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-bg-theme-secondary border border-transparent'
              }`}
              onClick={() => handleFilterChange('users')}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className={activeFilter === 'users' ? 'bg-semantic-success' : ''}>
                Users ({formatNumberShort(getFilterCount('users'))})
              </span>
            </button>
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'games'
                  ? 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/30 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-bg-theme-secondary border border-transparent'
              }`}
              onClick={() => handleFilterChange('games')}
            >
              <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className={activeFilter === 'games' ? 'text-semantic-info' : ''}>
                Games ({formatNumberShort(getFilterCount('games'))})
              </span>
            </button>
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'gameLogs'
                  ? 'bg-semantic-info/10 text-semantic-info border border-semantic-info/30 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-bg-theme-secondary border border-transparent'
              }`}
              onClick={() => handleFilterChange('gameLogs')}
            >
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
              Game Logs ({formatNumberShort(getFilterCount('gameLogs'))})
            </button>
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'teams'
                  ? 'bg-semantic-info/10 text-semantic-info border border-semantic-info/30 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-bg-theme-secondary border border-transparent'
              }`}
              onClick={() => handleFilterChange('teams')}
            >
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
              Teams ({formatNumberShort(getFilterCount('teams'))})
            </button>
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'players'
                  ? 'bg-semantic-success/10 text-semantic-success border border-semantic-success/30 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-bg-theme-secondary border border-transparent'
              }`}
              onClick={() => handleFilterChange('players')}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              Players ({formatNumberShort(getFilterCount('players'))})
            </button>
          </div>
        </div>

        {/* Search Tips for short queries */}
        {query.length <= 2 && searchInsights.total > 0 && (
          <div className="bg-semantic-info/10 border border-semantic-info/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-semantic-info mb-3">Search Tips</h3>
            <ul className="space-y-2 text-sm text-semantic-info">
              <li>• Use quotes for exact phrases (e.g., &quot;Lakers vs Warriors&quot;)</li>
              <li>• Search by team names, player names, or game dates</li>
              <li>• Try longer search terms for more specific results</li>
            </ul>
          </div>
        )}

        {/* Results Content */}
        {searchInsights.total === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-theme-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-primary mb-2">
              No results found for &quot;{query}&quot;
            </h3>
            <p className="text-theme-secondary mb-6">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
            <div className="space-y-2 text-sm text-theme-muted">
              <p>• Check your spelling</p>
              <p>• Try different or more general keywords</p>
              <p>• Use fewer words in your search</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Users Section */}
            {(activeFilter === 'all' || activeFilter === 'users') &&
              getFilterCount('users') > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-theme-primary mb-4">
                    Users ({formatNumberShort(getFilterCount('users'))})
                  </h2>
                  <div className="space-y-3">
                    {results.results
                      ?.filter(r => r.type === 'user')
                      .map(user => (
                        <UserSearchResult key={user.id} user={user} />
                      ))}
                  </div>
                </div>
              )}

            {/* Games Section */}
            {(activeFilter === 'all' || activeFilter === 'games') &&
              getFilterCount('games') > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-theme-primary mb-4">
                    Games ({formatNumberShort(getFilterCount('games'))})
                  </h2>
                  <div className="space-y-3">
                    {results.results
                      ?.filter(r => r.type === 'game')
                      .map(game => (
                        <GameSearchResult key={game.id} game={game} />
                      ))}
                  </div>
                </div>
              )}

            {/* Game Logs Section */}
            {(activeFilter === 'all' || activeFilter === 'gameLogs') &&
              getFilterCount('gameLogs') > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-theme-primary mb-4">
                    Game Logs ({formatNumberShort(getFilterCount('gameLogs'))})
                  </h2>
                  <div className="space-y-3">
                    {results.results
                      ?.filter(r => r.type === 'gameLog')
                      .map(gameLog => (
                        <GameLogSearchResult key={gameLog.id} gameLog={gameLog} />
                      ))}
                  </div>
                </div>
              )}

            {/* Teams Section */}
            {(activeFilter === 'all' || activeFilter === 'teams') &&
              getFilterCount('teams') > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-theme-primary mb-4">
                    Teams ({formatNumberShort(getFilterCount('teams'))})
                  </h2>
                  <div className="space-y-3">
                    {results.results
                      ?.filter(r => r.type === 'team')
                      .map(team => (
                        <TeamSearchResult key={team.id} team={team} />
                      ))}
                  </div>
                </div>
              )}

            {/* Players Section */}
            {(activeFilter === 'all' || activeFilter === 'players') &&
              getFilterCount('players') > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-theme-primary mb-4">
                    Players ({formatNumberShort(getFilterCount('players'))})
                  </h2>
                  <div className="space-y-3">
                    {results.results
                      ?.filter(r => r.type === 'player')
                      .map(player => (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <PlayerSearchResult key={player.id} player={player as any} />
                      ))}
                  </div>
                </div>
              )}

            {/* View All Results Button */}
            {activeFilter !== 'all' && searchInsights.total > getFilterCount(activeFilter) && (
              <div className="text-center pt-6">
                <button
                  onClick={() => handleFilterChange('all')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-medium rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  View All {formatNumberShort(searchInsights.total)} Results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SearchAnalytics>
  );
}
