'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { SportsPageLayout } from '@/app/components/sports';
import { GameCard } from '@/app/components/sports/game-card';
import { GameFilters } from '@/app/components/sports/game-filters';
import { Pagination } from '@/app/components/sports/pagination';
import { Button } from '@/app/components/ui/button';
import { useGameFilters } from '@/hooks/use-game-filters';
import { useLatestGames } from '@/hooks/use-latest-games';

export default function NBAGamesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSeasonFilter, setCurrentSeasonFilter] = useState('2024');
  const gamesPerPage = 12;

  // Convert season filter to array of seasons to fetch
  const getSeasonsToFetch = useCallback((seasonFilter: string) => {
    if (seasonFilter === 'all') {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const nbaSeason = currentMonth >= 9 ? currentYear : currentYear - 1;
      return [nbaSeason];
    }

    const seasonYear = parseInt(seasonFilter);
    if (!isNaN(seasonYear)) {
      return [seasonYear];
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const nbaSeason = currentMonth >= 9 ? currentYear : currentYear - 1;
    return [nbaSeason];
  }, []);

  const seasonsToFetch = useMemo(() => {
    return getSeasonsToFetch(currentSeasonFilter);
  }, [currentSeasonFilter, getSeasonsToFetch]);

  // Fetch games data
  const {
    latestGames,
    loading: gamesLoading,
    error: gamesError,
    refetch: refetchGames,
  } = useLatestGames({
    limit: 1000,
    forceRealData: false, // Use mock data instead of external API
    seasons: seasonsToFetch,
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

  const handleUpdateFilter = useCallback(
    (key: string, value: string) => {
      if (key === 'seasonFilter') {
        setCurrentSeasonFilter(value);
      }
      updateFilter(key as keyof typeof filters, value);
    },
    [updateFilter]
  );

  const handleClearFilters = useCallback(() => {
    setCurrentSeasonFilter('2024');
    clearFilters();
    setCurrentPage(1);
  }, [clearFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredGames.slice(startIndex, endIndex);

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

      {!gamesLoading && (
        <div className="space-y-4 mt-8">
          {currentGames.length === 0 ? (
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
              {currentGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      )}

      {!gamesLoading && filteredGames.length > gamesPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </SportsPageLayout>
  );
}
