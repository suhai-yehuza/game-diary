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
import { TAILWIND_CLASSES } from '@/lib/constants/colors';
import type { ISearchResultsProps, ResultType } from '@/lib/types';

export function SearchResults({ results, query }: ISearchResultsProps) {
  const [activeFilter, setActiveFilter] = useState<ResultType>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'name'>('relevance');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchStartTime] = useState(Date.now());
  const { trackSearchInteraction } = useSearchAnalytics();

  // Helper function to get count for each filter type
  const getFilterCount = useCallback(
    (filter: ResultType): number => {
      switch (filter) {
        case 'all':
          return (
            (results.data.totalUsers || 0) +
            (results.data.totalGames || 0) +
            (results.data.totalGameLogs || 0) +
            (results.data.totalTeams || 0) +
            (results.data.totalPlayers || 0)
          );
        case 'users':
          return results.data.totalUsers || 0;
        case 'games':
          return results.data.totalGames || 0;
        case 'gameLogs':
          return results.data.totalGameLogs || 0;
        case 'teams':
          return results.data.totalTeams || 0;
        case 'players':
          return results.data.totalPlayers || 0;
        default:
          return 0;
      }
    },
    [results.data]
  );

  // Enhanced search insights
  const searchInsights = useMemo(() => {
    const total = getFilterCount('all');
    const mostRelevant =
      total > 0
        ? (Object.entries({
            users: results.data.totalUsers || 0,
            games: results.data.totalGames || 0,
            gameLogs: results.data.totalGameLogs || 0,
            teams: results.data.totalTeams || 0,
            players: results.data.totalPlayers || 0,
          }).sort(([, a], [, b]) => b - a)[0][0] as ResultType)
        : null;

    return { total, mostRelevant };
  }, [results.data, getFilterCount]);

  const handleFilterChange = useCallback(
    (filter: ResultType) => {
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
        <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Search Results
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">
                  {formatNumberShort(searchInsights.total)} results found
                </span>
                <span className="hidden sm:inline">•</span>
                <span>
                  Results for:&nbsp;
                  <span className="font-medium text-gray-900 dark:text-white">
                    &quot;{query}&quot;
                  </span>
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
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All ({formatNumberShort(searchInsights.total)})
            </button>
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'users'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => handleFilterChange('users')}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className={activeFilter === 'users' ? 'bg-semantic-success' : ''}>
                Users ({formatNumberShort(getFilterCount('users'))})
              </span>
            </button>
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'games'
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => handleFilterChange('games')}
            >
              <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className={activeFilter === 'games' ? TAILWIND_CLASSES.status.info : ''}>
                Games ({formatNumberShort(getFilterCount('games'))})
              </span>
            </button>
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'gameLogs'
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => handleFilterChange('gameLogs')}
            >
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
              Game Logs ({formatNumberShort(getFilterCount('gameLogs'))})
            </button>
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'teams'
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700'
                  : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => handleFilterChange('teams')}
            >
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
              Teams ({formatNumberShort(getFilterCount('teams'))})
            </button>
            <button
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeFilter === 'players'
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Search Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• Use quotes for exact phrases (e.g., &quot;Lakers vs Warriors&quot;)</li>
              <li>• Search by team names, player names, or game dates</li>
              <li>• Try longer search terms for more specific results</li>
            </ul>
          </div>
        )}

        {/* Results Content */}
        {searchInsights.total === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found for &quot;{query}&quot;
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
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
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Users ({formatNumberShort(getFilterCount('users'))})
                  </h2>
                  <div className="space-y-3">
                    {results.data.users?.map(user => (
                      <UserSearchResult key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              )}

            {/* Games Section */}
            {(activeFilter === 'all' || activeFilter === 'games') &&
              getFilterCount('games') > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Games ({formatNumberShort(getFilterCount('games'))})
                  </h2>
                  <div className="space-y-3">
                    {results.data.games?.map(game => (
                      <GameSearchResult key={game.id} game={game} />
                    ))}
                  </div>
                </div>
              )}

            {/* Game Logs Section */}
            {(activeFilter === 'all' || activeFilter === 'gameLogs') &&
              getFilterCount('gameLogs') > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Game Logs ({formatNumberShort(getFilterCount('gameLogs'))})
                  </h2>
                  <div className="space-y-3">
                    {results.data.gameLogs?.map(gameLog => (
                      <GameLogSearchResult key={gameLog.id} gameLog={gameLog} />
                    ))}
                  </div>
                </div>
              )}

            {/* Teams Section */}
            {(activeFilter === 'all' || activeFilter === 'teams') &&
              getFilterCount('teams') > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Teams ({formatNumberShort(getFilterCount('teams'))})
                  </h2>
                  <div className="space-y-3">
                    {results.data.teams?.map(team => (
                      <TeamSearchResult key={team.id} team={team} />
                    ))}
                  </div>
                </div>
              )}

            {/* Players Section */}
            {(activeFilter === 'all' || activeFilter === 'players') &&
              getFilterCount('players') > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Players ({formatNumberShort(getFilterCount('players'))})
                  </h2>
                  <div className="space-y-3">
                    {results.data.players?.map(player => (
                      <PlayerSearchResult key={player.id} player={player} />
                    ))}
                  </div>
                </div>
              )}

            {/* View All Results Button */}
            {activeFilter !== 'all' && searchInsights.total > getFilterCount(activeFilter) && (
              <div className="text-center pt-6">
                <button
                  onClick={() => handleFilterChange('all')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
