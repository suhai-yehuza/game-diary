'use client';

import { useState } from 'react';

import { NBAPageLayout, TeamCard } from '@/app/components/sports';
import { useNBAPageState } from '@/hooks/use-nba-page-state';
import { usePaginatedTeams } from '@/hooks/use-paginated-teams';
import { NBA_FILTERS, NBA_ICONS } from '@/lib/config/nba-filters.config';
import type { ITeamResponse } from '@/types';

export default function NBATeamsPage() {
  const [search, _setSearch] = useState('');
  const [conference, setConference] = useState('all');
  const [division, setDivision] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'conference'>('name');
  const [sortDirection] = useState<'asc' | 'desc'>('asc');

  // Use shared NBA page state
  const { forceRefresh, pageSize, handleForceRefresh } = useNBAPageState();

  const {
    teams: latestTeams,
    loading: teamsLoading,
    error: teamsError,
    pagination,
    cacheInfo,
    setPage: setPageFromHook,
    setSearch: _setSearchFromHook,
    setConference: setConferenceFromHook,
    setDivision: setDivisionFromHook,
    setSortBy: setSortByFromHook,
    setLimit: setLimitFromHook,
  } = usePaginatedTeams({
    search,
    conference,
    division,
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

  const handleConferenceChange = (newConference: string) => {
    setConference(newConference);
    setConferenceFromHook(newConference);
  };

  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    setDivisionFromHook(newDivision);
  };

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy as 'name' | 'city' | 'conference');
    setSortByFromHook(newSortBy as 'name' | 'city' | 'conference');
  };

  return (
    <NBAPageLayout
      title="NBA Teams"
      description="Browse all NBA teams and their information"
      items={latestTeams}
      loading={teamsLoading}
      error={teamsError}
      pagination={pagination}
      cacheInfo={cacheInfo}
      pageSize={pagination?.limit || pageSize}
      onPageSizeChange={handlePageSizeChange}
      onForceRefresh={handleForceRefresh}
      forceRefresh={forceRefresh}
      onPageChange={handlePageChangeFromHook}
      renderItem={(team: ITeamResponse) => <TeamCard key={team.id} team={team} />}
      gridClassName="grid grid-cols-1 gap-4 sm:gap-6"
      cacheTitle="Teams Cache Status"
      cacheTTL="24h"
      pageSizeOptions={NBA_FILTERS.pageSizeOptions.map(option => ({
        ...option,
        label: option.label.replace('items', 'teams'),
      }))}
      filtersTitle="Team Filters"
      filtersIcon={NBA_ICONS.teams}
      filters={[
        {
          label: 'Conference',
          value: conference,
          onChange: handleConferenceChange,
          options: NBA_FILTERS.teamConferenceOptions,
        },
        {
          label: 'Division',
          value: division,
          onChange: handleDivisionChange,
          options: NBA_FILTERS.teamDivisionOptions,
        },
        {
          label: 'Sort',
          value: sortBy,
          onChange: handleSortByChange,
          options: [
            { value: 'name', label: 'Name A-Z', icon: NBA_ICONS.filters },
            { value: 'city', label: 'City', icon: NBA_ICONS.filters },
            { value: 'conference', label: 'Conference', icon: NBA_ICONS.filters },
          ],
          className: 'min-w-[120px]',
        },
      ]}
      showGamesButton={true}
      showPlayersButton={true}
      showTeamsButton={false}
    />
  );
}
