'use client';

import { ArrowLeft, RefreshCw, Database } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { SportsPageLayout } from '@/app/components/sports';
import { Pagination as _Pagination } from '@/app/components/sports/pagination';
import { PlayerCard } from '@/app/components/sports/player-card';
import { PlayerFilters } from '@/app/components/sports/player-filters';
import { Button } from '@/app/components/ui/button';
import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';
import { useNBAPlayers } from '@/hooks/use-nba-players';
import { usePlayerFilters } from '@/hooks/use-player-filters';
import { TAILWIND_CLASSES } from '@/lib/constants/colors';
import { getButtonVariant } from '@/lib/design-tokens/button-variants';
import type { IPlayerFilterState } from '@/types';

export default function NBAPlayersPage() {
  const [forceRefresh, setForceRefresh] = useState(false);

  // Fetch all players data once
  const { players, loading, error, refetch } = useNBAPlayers({
    forceRealData: false, // Use cached data for faster loading
  });

  // Use client-side filtering hook (no API calls)
  const {
    filters,
    filterOptions,
    filteredPlayers,
    showAdvancedFilters,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    toggleAdvancedFilters,
  } = usePlayerFilters(players);

  // Simple pagination with grid-aware items per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // 6 rows × 4 columns to avoid gaps
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredPlayers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleUpdateFilter = (key: string, value: string) => {
    updateFilter(key as keyof IPlayerFilterState, value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleForceRefresh = () => {
    setForceRefresh(true);
    refetch();
    // Reset force refresh after a short delay
    setTimeout(() => setForceRefresh(false), 1000);
  };

  // Since useNBAPlayers doesn't have cache status, we'll show a simple status
  const getCacheStatusIcon = () => {
    return <Database className="w-4 h-4 text-green-500" />;
  };

  const getCacheStatusText = () => {
    return 'Loaded';
  };

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
              className={`inline-flex items-center px-3 sm:px-4 py-2 ${TAILWIND_CLASSES.sports.nba} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm`}
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
              className={`inline-flex items-center px-3 sm:px-4 py-2 ${TAILWIND_CLASSES.sports.nba} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm`}
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
            className={`inline-flex items-center px-3 sm:px-4 py-2 ${TAILWIND_CLASSES.sports.nba} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm`}
          >
            Games
          </Link>
          <Link href="/sports/nba/teams" className={getButtonVariant('primaryInline')}>
            Teams
          </Link>
        </div>
      </div>

      {/* Cache Status and Controls */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6 border border-green-200 dark:border-green-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {getCacheStatusIcon()}
            <div>
              <div className="text-sm font-medium text-green-900 dark:text-green-100">
                Cache Status: {getCacheStatusText()}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">
                {formatNumberShort(players.length)} players loaded
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Page {currentPage} of {totalPages} • {formatNumberShort(filteredPlayers.length)}{' '}
                total players
              </div>
              <div className="text-xs text-green-500 dark:text-green-400">
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

      {/* Player Filters */}
      <PlayerFilters
        filters={filters}
        filterOptions={filterOptions}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        totalPlayers={filteredPlayers.length}
        filteredPlayersCount={filteredPlayers.length}
        onUpdateFilter={handleUpdateFilter}
        onClearFilters={clearFilters}
        onToggleAdvancedFilters={toggleAdvancedFilters}
        onRefresh={() => void refetch()}
      />

      {/* Players List */}
      <div className="space-y-4 mt-8">
        {currentItems.length === 0 ? (
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
          currentItems.map(player => <PlayerCard key={player.id} player={player} />)
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <_Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </SportsPageLayout>
  );
}
