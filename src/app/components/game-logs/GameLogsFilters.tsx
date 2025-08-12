'use client';

import { GameLogsSearch } from '@/app/components/game-logs/GameLogsSearch';
import { GameLogsSort } from '@/app/components/game-logs/GameLogsSort';
import type { IGameLogsFiltersProps } from '@/lib/types';

export const GameLogsFilters = ({
  searchTerm,
  searchField,
  sortConfig,
  displayedCount,
  totalCount,
  classification,
  onSearchChange,
  onSearchClear,
  onSort,
}: IGameLogsFiltersProps) => {
  return (
    <>
      <GameLogsSearch
        onSearchChange={onSearchChange}
        onClear={onSearchClear}
        searchTerm={searchTerm}
        searchField={searchField}
      />
      <GameLogsSort
        sortKey={sortConfig?.field ?? ''}
        sortDirection={sortConfig?.direction ?? 'asc'}
        onSort={onSort}
        displayedCount={displayedCount}
        totalCount={totalCount}
        classification={classification}
      />
    </>
  );
};
