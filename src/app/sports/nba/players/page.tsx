'use client';

import { useState } from 'react';

import { NBAPageLayout, PlayerCard } from '@/app/components/sports';
import { useNBAPageState } from '@/hooks/use-nba-page-state';
import { usePaginatedPlayers } from '@/hooks/use-paginated-players';
import { NBA_FILTERS, NBA_ICONS } from '@/lib/config/nba-filters.config';
import type { IPlayerResponse } from '@/types';

export default function NBAPlayersPage() {
  const [search, _setSearch] = useState('');
  const [position, setPosition] = useState('all');
  const [year, setYear] = useState('all');
  const [college, setCollege] = useState('all');
  const [country, setCountry] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection] = useState<'asc' | 'desc'>('asc');

  // Use shared NBA page state
  const { forceRefresh, pageSize, handleForceRefresh } = useNBAPageState();

  const {
    players: latestPlayers,
    loading: playersLoading,
    error: playersError,
    pagination,
    cacheInfo,
    setPage: setPageFromHook,
    setSearch: _setSearchFromHook,
    setPosition: setPositionFromHook,
    setYear: setYearFromHook,
    setCollege: setCollegeFromHook,
    setCountry: setCountryFromHook,
    setSortBy: setSortByFromHook,
    setLimit: setLimitFromHook,
  } = usePaginatedPlayers({
    search,
    position,
    year,
    college,
    country,
    sortBy,
    sortDirection,
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

  const handlePositionChange = (newPosition: string) => {
    setPosition(newPosition);
    setPositionFromHook(newPosition);
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    setYearFromHook(newYear);
  };

  const handleCollegeChange = (newCollege: string) => {
    setCollege(newCollege);
    setCollegeFromHook(newCollege);
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setCountryFromHook(newCountry);
  };

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setSortByFromHook(newSortBy);
  };

  return (
    <NBAPageLayout
      title="NBA Players"
      description="Browse all NBA players and their information"
      items={latestPlayers}
      loading={playersLoading}
      error={playersError}
      pagination={pagination || null}
      cacheInfo={cacheInfo || null}
      pageSize={pagination?.limit || pageSize}
      onPageSizeChange={handlePageSizeChange}
      onForceRefresh={handleForceRefresh}
      forceRefresh={forceRefresh}
      onPageChange={handlePageChangeFromHook}
      renderItem={(player: IPlayerResponse) => <PlayerCard key={player.id} player={player} />}
      gridClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
      cacheTitle="Players Cache Status"
      cacheTTL="24h"
      pageSizeOptions={NBA_FILTERS.pageSizeOptions.map(option => ({
        ...option,
        label: option.label.replace('items', 'players'),
      }))}
      filtersTitle="Player Filters"
      filtersIcon={NBA_ICONS.players}
      filters={[
        {
          label: 'Position',
          value: position,
          onChange: handlePositionChange,
          options: NBA_FILTERS.playerPositionOptions,
        },
        {
          label: 'Year',
          value: year,
          onChange: handleYearChange,
          options: NBA_FILTERS.playerYearOptions,
        },
        {
          label: 'College',
          value: college,
          onChange: handleCollegeChange,
          options: NBA_FILTERS.playerCollegeOptions,
        },
        {
          label: 'Country',
          value: country,
          onChange: handleCountryChange,
          options: NBA_FILTERS.playerCountryOptions,
        },
        {
          label: 'Sort',
          value: sortBy,
          onChange: handleSortByChange,
          options: [
            { value: 'name', label: 'Name A-Z', icon: NBA_ICONS.filters },
            { value: 'position', label: 'Position', icon: NBA_ICONS.filters },
          ],
          className: 'min-w-[120px]',
        },
      ]}
      showGamesButton={true}
      showPlayersButton={false}
      showTeamsButton={true}
    />
  );
}
