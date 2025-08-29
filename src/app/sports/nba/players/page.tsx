'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import {
  SportsPageLayout,
  PlayerCard,
  PlayerFilters,
  Pagination as _Pagination,
} from '@/app/components/sports';
import { Button } from '@/app/components/ui/button';
import { useEnhancedPlayerFilters } from '@/hooks/use-enhanced-player-filters';
import { getButtonVariant } from '@/lib/design-tokens/button-variants';

function NBAPlayersPageContent() {
  const searchParams = useSearchParams();
  const teamIdFromUrl = searchParams.get('team');
  const [_currentPage, _setCurrentPage] = useState(1);

  // Use enhanced player filters hook that fetches from database
  const {
    filters,
    showAdvancedFilters,
    players,
    loading,
    error,
    filterOptions,
    totalPlayers,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    toggleAdvancedFilters,
    refetch,
  } = useEnhancedPlayerFilters();

  // Set initial team filter from URL
  useEffect(() => {
    if (teamIdFromUrl && teamIdFromUrl !== 'all') {
      updateFilter('teamFilter', teamIdFromUrl);
    }
  }, [teamIdFromUrl, updateFilter]);

  // For simplicity, show all players from database without client-side pagination
  const currentPlayers = players;
  const _totalPages = 1; // Since we're fetching filtered results from the database

  if (loading) {
    return (
      <SportsPageLayout
        title="NBA Players"
        description="Browse all NBA players and their information"
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
              href="/sports/nba/games"
              className="inline-flex items-center px-3 sm:px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm"
            >
              Games
            </Link>
            <Link href="/sports/nba/teams" className={getButtonVariant('primaryInline')}>
              Teams
            </Link>
          </div>
        </div>

        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-brand-primary" />
        </div>
      </SportsPageLayout>
    );
  }

  if (error) {
    return (
      <SportsPageLayout
        title="NBA Players"
        description="Browse all NBA players and their information"
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
              href="/sports/nba/games"
              className="inline-flex items-center px-3 sm:px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm"
            >
              Games
            </Link>
            <Link href="/sports/nba/teams" className={getButtonVariant('primaryInline')}>
              Teams
            </Link>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-6 mt-8">
          <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">
            Error loading players: {error}
          </p>
          <button
            onClick={refetch}
            className="mt-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm"
          >
            Try Again
          </button>
        </div>
      </SportsPageLayout>
    );
  }

  return (
    <SportsPageLayout
      title="NBA Players"
      description="Browse all NBA players and their information"
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
            href="/sports/nba/games"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm"
          >
            Games
          </Link>
          <Link href="/sports/nba/teams" className={getButtonVariant('primaryInline')}>
            Teams
          </Link>
        </div>
      </div>

      {/* Player Filters */}
      <PlayerFilters
        filters={filters}
        filterOptions={filterOptions}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        totalPlayers={totalPlayers}
        filteredPlayersCount={players.length}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
        onToggleAdvancedFilters={toggleAdvancedFilters}
        onRefresh={() => void refetch()}
      />

      {/* Players List */}
      <div className="space-y-4 mt-8">
        {currentPlayers.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="nba-empty-state-text text-base sm:text-lg">
              No players found matching your criteria.
            </p>
            <button
              onClick={() => void clearFilters()}
              className="mt-4 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs sm:text-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          currentPlayers.map(player => <PlayerCard key={player.id} player={player} />)
        )}
      </div>

      {/* Pagination - Hidden for now since we're fetching filtered results from database
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      */}
    </SportsPageLayout>
  );
}

export default function NBAPlayersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NBAPlayersPageContent />
    </Suspense>
  );
}
