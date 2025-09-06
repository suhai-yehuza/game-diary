'use client';

import { ArrowLeft, RefreshCw, Database, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState, useEffect } from 'react';

import { SportsPageLayout } from '@/app/components/sports';
import { GameCard } from '@/app/components/sports/game-card';
import { GameFilters } from '@/app/components/sports/game-filters';
import { Pagination as _Pagination } from '@/app/components/sports/pagination';
import { Button } from '@/app/components/ui/button';
import { useGameFilters } from '@/hooks/use-game-filters';
import { useLatestGames } from '@/hooks/use-latest-games';
import { API_LIMITS } from '@/lib/constants';

// Utility function to format large numbers
const formatShort = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export default function NBAGamesPage() {
  const [currentSeasonFilter, setCurrentSeasonFilter] = useState('all');
  const [forceRefresh, setForceRefresh] = useState(false);

  // Convert season filter to array of seasons to fetch
  const getSeasonsToFetch = useCallback((seasonFilter: string) => {
    if (seasonFilter === 'all') {
      // Return ['all'] to use the merged cache instead of individual seasons
      return ['all'];
    }

    const seasonYear = parseInt(seasonFilter);
    if (!isNaN(seasonYear)) {
      return [seasonYear];
    }

    // Default to current season if parsing fails
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const nbaSeason = currentMonth >= 9 ? currentYear : currentYear - 1;
    return [nbaSeason];
  }, []);

  const seasonsToFetch = useMemo(() => {
    return getSeasonsToFetch(currentSeasonFilter).map(String);
  }, [currentSeasonFilter, getSeasonsToFetch]);

  // Fetch games data
  const {
    latestGames,
    loading: gamesLoading,
    error: gamesError,
    refetch: refetchGames,
    cacheStatus,
    refreshCache,
  } = useLatestGames({
    limit: API_LIMITS.GAMES.LARGE,
    forceRealData: false, // Use mock data instead of external API
    seasons: seasonsToFetch,
    forceRefresh,
  });

  // Games filtering logic
  const {
    filters,
    filterOptions,
    filteredGames,
    showAdvancedFilters,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    toggleAdvancedFilters,
  } = useGameFilters(latestGames);

  // Simple pagination with grid-aware items per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18; // Always 18 items (6 rows × 3 columns) to avoid gaps
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredGames.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredGames]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateFilter = useCallback(
    (key: string, value: string) => {
      if (key === 'seasonFilter') {
        setCurrentSeasonFilter(value);
        // Reset to first page when season changes
        setCurrentPage(1);
        // The useLatestGames hook will automatically fetch the new season data
        // based on the updated seasonsToFetch array
      }
      updateFilter(key as keyof typeof filters, value);
    },
    [updateFilter]
  );

  const handleClearFilters = useCallback(() => {
    setCurrentSeasonFilter('all');
    clearFilters();
    setCurrentPage(1);
  }, [clearFilters]);

  const handleForceRefresh = () => {
    setForceRefresh(true);
    refreshCache();
    // Reset force refresh after a short delay
    setTimeout(() => setForceRefresh(false), 1000);
  };

  const getCacheStatusIcon = () => {
    switch (cacheStatus) {
      case 'cached':
        return <Database className="w-4 h-4 text-green-500" />;
      case 'fresh':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCacheStatusText = () => {
    switch (cacheStatus) {
      case 'cached':
        return 'Cached';
      case 'fresh':
        return 'Fresh';
      default:
        return 'No Cache';
    }
  };

  // Deduplicate games by ID to prevent React key conflicts
  const _uniqueFilteredGames = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Map<string, number>();

    const result = filteredGames.filter(game => {
      // Use the database id directly - it's already unique (season-game.id format)
      const uniqueGameId = game.id;
      if (seen.has(uniqueGameId)) {
        duplicates.set(uniqueGameId, (duplicates.get(uniqueGameId) || 1) + 1);
        return false;
      }
      seen.add(uniqueGameId);
      return true;
    });

    // Log duplicates in development for debugging
    if (process.env.NODE_ENV === 'development' && duplicates.size > 0) {
      console.warn('🚨 Found duplicate game IDs:', Object.fromEntries(duplicates));
      console.warn(
        `📊 Original count: ${filteredGames.length}, After deduplication: ${result.length}`
      );
    }

    return result;
  }, [filteredGames]);

  return (
    <SportsPageLayout
      title="NBA Games"
      description="Browse and filter NBA games"
      showLiveGamesButton={false}
    >
      {/* Navigation section with back button and sport buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
        {/* Back to NBA Hub */}
        <Link href="/sports/nba">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Back to NBA Hub
          </Button>
        </Link>

        {/* Sport buttons on the right */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Link
            href="/sports/nba/teams"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm"
          >
            Teams
          </Link>
          <Link
            href="/sports/nba/players"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm"
          >
            Players
          </Link>
        </div>
      </div>

      {/* Cache Status and Controls */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {getCacheStatusIcon()}
            <div>
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Cache Status: {getCacheStatusText()}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                {formatShort(latestGames.length)} games loaded • 30 min cache TTL
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Page {currentPage} of {totalPages} • {formatShort(filteredGames.length)} filtered
                games
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-400">
                {itemsPerPage} per page • Responsive to screen size
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceRefresh}
              disabled={forceRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${forceRefresh ? 'animate-spin' : ''}`} />
              {forceRefresh ? 'Refreshing...' : 'Force Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Game Filters */}
      <GameFilters
        filters={filters}
        filterOptions={filterOptions}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        totalGames={latestGames.length}
        filteredGamesCount={filteredGames.length}
        onUpdateFilter={handleUpdateFilter}
        onClearFilters={handleClearFilters}
        onToggleAdvancedFilters={toggleAdvancedFilters}
        onRefresh={refetchGames}
      />

      {gamesError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-6 mt-8">
          <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">
            Error loading games: {gamesError}
          </p>
          <button
            onClick={refetchGames}
            className="mt-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {gamesLoading && (
        <div className="flex justify-center items-center py-8 mt-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-brand-primary" />
        </div>
      )}

      {!gamesLoading && latestGames.length > 0 && (
        <div className="space-y-4 mt-8">
          {currentItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="nba-empty-state-text text-base sm:text-lg">
                No games found matching your criteria.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs sm:text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {currentItems.map(game => (
                <GameCard
                  key={`${game.id}-${typeof game.date === 'string' ? game.date : game.date?.start || ''}-${game.teams?.home?.id}-${game.teams?.visitors?.id}`}
                  game={game}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!gamesLoading && latestGames.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
            No games available.
          </p>
        </div>
      )}

      {!gamesLoading && filteredGames.length > itemsPerPage && (
        <_Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </SportsPageLayout>
  );
}
