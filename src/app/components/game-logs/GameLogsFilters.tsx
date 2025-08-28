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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4">
      {/* Search Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Search & Filter</h3>
        <GameLogsSearch
          onSearchChange={onSearchChange}
          onClear={onSearchClear}
          searchTerm={searchTerm}
          searchField={searchField}
        />
      </div>

      {/* Sort Section */}
      <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
        <GameLogsSort
          sortKey={sortConfig?.field ?? ''}
          sortDirection={sortConfig?.direction ?? 'asc'}
          onSort={onSort}
          displayedCount={displayedCount}
          totalCount={totalCount}
          classification={classification}
        />
      </div>
    </div>
  );
};
