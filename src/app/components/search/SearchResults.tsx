'use client';

import * as Icons from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

import { GameLogSearchResult } from '@/app/components/search/GameLogSearchResult';
import { GameSearchResult } from '@/app/components/search/GameSearchResult';
import { PlayerSearchResult } from '@/app/components/search/PlayerSearchResult';
import { SearchAnalytics, useSearchAnalytics } from '@/app/components/search/SearchAnalytics';
import { TeamSearchResult } from '@/app/components/search/TeamSearchResult';
import { UserSearchResult } from '@/app/components/search/UserSearchResult';
import type { ISearchResultsProps, ResultType } from '@/lib/types';

export function SearchResults({ results, query }: ISearchResultsProps) {
  const [activeFilter, setActiveFilter] = useState<ResultType>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'name'>('relevance');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchStartTime] = useState(Date.now());
  const { trackSearchInteraction } = useSearchAnalytics();

  const UserIcon =
    Icons?.User ||
    (({ className }: { className?: string }) => (
      <div data-testid="user-icon" className={className}>
        User
      </div>
    ));
  const TrophyIcon =
    Icons?.Trophy ||
    (({ className }: { className?: string }) => (
      <div data-testid="trophy-icon" className={className}>
        Trophy
      </div>
    ));
  const Gamepad2Icon =
    Icons?.Gamepad2 ||
    (({ className }: { className?: string }) => (
      <div data-testid="gamepad2-icon" className={className}>
        Gamepad2
      </div>
    ));
  const Building2Icon =
    Icons?.Building2 ||
    (({ className }: { className?: string }) => (
      <div data-testid="building2-icon" className={className}>
        Building2
      </div>
    ));

  const getFilterCount = useCallback(
    (type: ResultType) => {
      switch (type) {
        case 'users':
          return results.data.totalUsers;
        case 'games':
          return results.data.totalGames;
        case 'gameLogs':
          return results.data.totalGameLogs;
        case 'teams':
          return results.data.totalTeams;
        case 'players':
          return results.data.totalPlayers;
        case 'all':
        default:
          return (
            results.data.totalUsers +
            results.data.totalGameLogs +
            results.data.totalGames +
            results.data.totalTeams +
            results.data.totalPlayers
          );
      }
    },
    [results.data]
  );

  // Track filter changes
  const handleFilterChange = (newFilter: ResultType) => {
    if (newFilter !== activeFilter) {
      trackSearchInteraction('filter_change', {
        from: activeFilter,
        to: newFilter,
        query,
      });
      setActiveFilter(newFilter);
    }
  };

  // Track sort changes
  const handleSortChange = (newSort: 'relevance' | 'date' | 'name') => {
    if (newSort !== sortBy) {
      trackSearchInteraction('sort_change', {
        from: sortBy,
        to: newSort,
        query,
      });
      setSortBy(newSort);
    }
  };

  const shouldShowSection = (type: ResultType) => {
    if (activeFilter === 'all') return true;
    return activeFilter === type;
  };

  const getFilterButtonClass = (type: ResultType) => {
    const isActive = activeFilter === type;
    if (isActive) {
      return 'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer bg-brand-primary text-white shadow-sm hover:bg-brand-primary-dark';
    }

    // Different colors for different result types when not active
    switch (type) {
      case 'users':
        return 'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer bg-semantic-success/10 text-semantic-success border border-semantic-success/20 hover:bg-semantic-success/20';
      case 'games':
        return 'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer bg-accent-orange/10 text-accent-orange border border-accent-orange/20 hover:bg-accent-orange/20';
      case 'gameLogs':
        return 'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer bg-accent-purple/10 text-accent-purple border border-accent-purple/20 hover:bg-accent-purple/20';
      case 'teams':
        return 'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer bg-semantic-error/10 text-semantic-error border border-semantic-error/20 hover:bg-semantic-error/20';
      case 'players':
        return 'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer bg-accent-blue/10 text-accent-blue border border-accent-blue/20 hover:bg-accent-blue/20';
      case 'all':
      default:
        return 'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700';
    }
  };

  // Enhanced search insights
  const searchInsights = useMemo(() => {
    const total = getFilterCount('all');
    const mostRelevant =
      total > 0
        ? (Object.entries({
            users: results.data.totalUsers,
            games: results.data.totalGames,
            gameLogs: results.data.totalGameLogs,
            teams: results.data.totalTeams,
            players: results.data.totalPlayers,
          }).sort(([, a], [, b]) => b - a)[0][0] as ResultType)
        : null;

    return { total, mostRelevant };
  }, [results.data, getFilterCount]);

  return (
    <div className="space-y-6" data-testid="search-results">
      {/* Search Analytics */}
      <SearchAnalytics
        query={query}
        resultsCount={searchInsights.total}
        searchTime={Date.now() - searchStartTime}
        category={activeFilter}
        filters={{ sortBy, showAdvancedFilters }}
      />
      {/* Enhanced Results Summary */}
      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Search Results
            </h1>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {searchInsights.total} results found
            </span>
          </div>

          {/* Advanced Controls */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={e => handleSortChange(e.target.value as 'relevance' | 'date' | 'name')}
              className="text-sm border border-neutral-200 dark:border-neutral-600 rounded-md px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </button>
          </div>
        </div>

        {/* Search Query Display */}
        <div className="mb-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Results for:{' '}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              &quot;{query}&quot;
            </span>
          </p>
          {searchInsights.mostRelevant && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Most relevant category:{' '}
              <span className="font-medium capitalize">{searchInsights.mostRelevant}</span>
            </p>
          )}
        </div>

        {/* Enhanced Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={getFilterButtonClass('all')} onClick={() => handleFilterChange('all')}>
            All ({searchInsights.total})
          </span>
          <span
            className={getFilterButtonClass('users')}
            onClick={() => handleFilterChange('users')}
          >
            Users ({results.data.totalUsers})
          </span>
          <span
            className={getFilterButtonClass('games')}
            onClick={() => handleFilterChange('games')}
          >
            Games ({results.data.totalGames})
          </span>
          <span
            className={getFilterButtonClass('gameLogs')}
            onClick={() => handleFilterChange('gameLogs')}
          >
            Game Logs ({results.data.totalGameLogs})
          </span>
          <span
            className={getFilterButtonClass('teams')}
            onClick={() => handleFilterChange('teams')}
          >
            Teams ({results.data.totalTeams})
          </span>
          <span
            className={getFilterButtonClass('players')}
            onClick={() => handleFilterChange('players')}
          >
            Players ({results.data.totalPlayers})
          </span>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Date Range
                </label>
                <select className="w-full text-sm border border-neutral-200 dark:border-neutral-600 rounded-md px-3 py-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <option value="">Any time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="year">This year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Result Type
                </label>
                <select className="w-full text-sm border border-neutral-200 dark:border-neutral-600 rounded-md px-3 py-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <option value="">All types</option>
                  <option value="recent">Recently updated</option>
                  <option value="popular">Most popular</option>
                  <option value="verified">Verified content</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Sort Order
                </label>
                <select className="w-full text-sm border border-neutral-200 dark:border-neutral-600 rounded-md px-3 py-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Suggestions */}
      {query.length < 3 && (
        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-brand-primary mb-2">Search Tips</h3>
          <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <li>• Use quotes for exact phrases: &quot;Los Angeles Lakers&quot;</li>
            <li>• Search by team names, player names, or game dates</li>
            <li>• Try different spellings or abbreviations</li>
            <li>• Use filters to narrow down results by category</li>
          </ul>
        </div>
      )}

      {/* Users Section */}
      {shouldShowSection('users') && results.data.users.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center space-x-2">
            <UserIcon className="w-5 h-5 text-semantic-success" />
            <span>Users ({results.data.totalUsers})</span>
          </h2>
          <div className="space-y-3">
            {results.data.users.map(user => (
              <UserSearchResult key={`user-${user.id}`} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Games Section */}
      {shouldShowSection('games') && results.data.games.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center space-x-2">
            <TrophyIcon className="w-5 h-5 text-accent-orange" />
            <span>Games ({results.data.totalGames})</span>
          </h2>
          <div className="space-y-3">
            {results.data.games.map(game => (
              <GameSearchResult key={`game-${game.id}`} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Game Logs Section */}
      {shouldShowSection('gameLogs') && results.data.gameLogs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center space-x-2">
            <Gamepad2Icon className="w-5 h-5 text-accent-purple" />
            <span>Game Logs ({results.data.totalGameLogs})</span>
          </h2>
          <div className="space-y-3">
            {results.data.gameLogs.map(gameLog => (
              <GameLogSearchResult key={`game-log-${gameLog.id}`} gameLog={gameLog} />
            ))}
          </div>
        </div>
      )}

      {/* Teams Section */}
      {shouldShowSection('teams') && results.data.teams.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center space-x-2">
            <Building2Icon className="w-5 h-5 text-semantic-error" />
            <span>Teams ({results.data.totalTeams})</span>
          </h2>
          <div className="space-y-3">
            {results.data.teams.map(team => (
              <TeamSearchResult key={`team-${team.id}`} team={team} />
            ))}
          </div>
        </div>
      )}

      {/* Players Section */}
      {shouldShowSection('players') && results.data.players.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center space-x-2">
            <UserIcon className="w-5 h-5 text-accent-blue" />
            <span>Players ({results.data.totalPlayers})</span>
          </h2>
          <div className="space-y-3">
            {results.data.players.map(player => (
              <PlayerSearchResult key={`player-${player.id}`} player={player} />
            ))}
          </div>
        </div>
      )}

      {/* No Results State */}
      {getFilterCount(activeFilter) === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
            <Icons.Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No results found for &quot;{query}&quot;
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Try adjusting your search terms or filters to find what you&apos;re looking for.
          </p>
          <div className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
            <p>Suggestions:</p>
            <ul className="space-y-1">
              <li>• Check your spelling</li>
              <li>• Try more general keywords</li>
              <li>• Use different search terms</li>
              <li>• Clear some filters</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
