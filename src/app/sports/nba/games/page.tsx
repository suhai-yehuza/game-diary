'use client';

import { useCallback, useState } from 'react';

import { NBAPageLayout, GameCard } from '@/app/components/sports';
import { useNBAPageState } from '@/hooks/use-nba-page-state';
import { usePaginatedGames } from '@/hooks/use-paginated-games';
import { NBA_FILTERS, NBA_ICONS } from '@/lib/config/nba-filters.config';
import type { IGameResponse } from '@/types';

export default function NBAGamesPage() {
  const [currentSeasonFilter] = useState('all');
  const [currentStatusFilter] = useState<'all' | 'finished' | 'live' | 'scheduled' | 'cancelled'>(
    'all'
  );

  // Use shared NBA page state
  const { forceRefresh, pageSize, handleForceRefresh } = useNBAPageState();

  // Convert season filter to string format for API
  const getSeasonForAPI = useCallback((seasonFilter: string) => {
    if (seasonFilter === 'all') {
      return 'all';
    }
    return seasonFilter;
  }, []);

  // Fetch games data using paginated API
  const {
    games: latestGames,
    loading: gamesLoading,
    error: gamesError,
    pagination,
    cacheInfo,
    setPage: setPageFromHook,
    setStatus: setStatusFromHook,
    setSeason: setSeasonFromHook,
    setLimit: setLimitFromHook,
  } = usePaginatedGames({
    status: currentStatusFilter,
    season: getSeasonForAPI(currentSeasonFilter),
    page: 1,
    limit: pageSize,
    forceRefresh,
  });

  // Handler functions
  const handlePageChangeFromHook = (newPage: number) => {
    setPageFromHook(newPage);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setLimitFromHook(parseInt(newPageSize));
  };

  const handleSeasonFilterChange = (newSeason: string) => {
    setSeasonFromHook(newSeason);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFromHook(newStatus as 'all' | 'finished' | 'live' | 'scheduled' | 'cancelled');
  };

  return (
    <NBAPageLayout
      title="NBA Games"
      description="Browse all NBA games and their information"
      items={latestGames}
      loading={gamesLoading}
      error={gamesError}
      pagination={pagination}
      cacheInfo={cacheInfo}
      pageSize={pagination?.limit || pageSize}
      onPageSizeChange={handlePageSizeChange}
      onForceRefresh={handleForceRefresh}
      forceRefresh={forceRefresh}
      onPageChange={handlePageChangeFromHook}
      renderItem={(game: IGameResponse) => <GameCard key={game.id} game={game} />}
      gridClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
      cacheTitle="Games Cache Status"
      cacheTTL="Dynamic (1h-24h)"
      pageSizeOptions={NBA_FILTERS.pageSizeOptions.map(option => ({
        ...option,
        label: option.label.replace('items', 'games'),
      }))}
      filtersTitle="Game Filters"
      filtersIcon={NBA_ICONS.calendar}
      filters={[
        {
          label: 'Status',
          value: currentStatusFilter,
          onChange: handleStatusFilterChange,
          options: NBA_FILTERS.gameStatusOptions,
        },
        {
          label: 'Season',
          value: currentSeasonFilter,
          onChange: handleSeasonFilterChange,
          options: NBA_FILTERS.seasonOptions,
          className: 'min-w-[160px]',
        },
      ]}
      showGamesButton={false}
      showPlayersButton={true}
      showTeamsButton={true}
    />
  );
}
