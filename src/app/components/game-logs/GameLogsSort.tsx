'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import React from 'react';

import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import type { IGameLogsSortProps } from '@/lib/types';

// Simple, clean sorting options in logical order
const sortOptions = [
  { key: 'created_at', label: 'Date Created' },
  { key: 'rating_for_game', label: 'Rating' },
  { key: 'classification', label: 'Privacy' },
  { key: 'watched_setting', label: 'Setting' },
  { key: 'watched_scope', label: 'Scope' },
  { key: 'game_id', label: 'Game ID' },
  { key: 'team', label: 'Team' },
  { key: 'owner', label: 'Owner' },
  { key: 'tags', label: 'Tags' },
];

export function GameLogsSort({
  sortKey,
  sortDirection,
  onSort,
  displayedCount,
  totalCount,
  classification,
}: IGameLogsSortProps) {
  const isMobile = useMobileDetection();

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Toggle direction
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(key, newDirection);
    } else {
      // Set new sort key with ascending direction
      onSort(key, 'asc');
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <div
      className={`flex flex-col gap-3 mb-4 ${isMobile ? 'space-y-3' : 'sm:flex-row sm:items-center sm:justify-between sm:gap-2'}`}
      data-testid="game-logs-sort"
    >
      <div
        className={`flex flex-col gap-2 ${isMobile ? 'space-y-2' : 'sm:flex-row sm:items-center sm:gap-2'}`}
      >
        <span
          className={`font-bold text-gray-900 dark:text-gray-100 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}
        >
          Sort by:
        </span>
        <div className={`flex flex-wrap gap-2 ${isMobile ? 'gap-1' : 'gap-2'}`}>
          {sortOptions.map(option => (
            <button
              key={option.key}
              onClick={() => handleSort(option.key)}
              className={`flex items-center gap-1 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                sortKey === option.key
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-md'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${isMobile ? 'px-3 py-2.5 text-xs min-h-[44px]' : 'px-3 py-2 text-sm'}`}
            >
              {getSortIcon(option.key)}
              <span className={isMobile ? 'text-xs' : 'text-sm'}>{option.label}</span>
            </button>
          ))}
          {sortKey && (
            <button
              onClick={() => onSort('', null)}
              className={`text-gray-800 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 ${
                isMobile
                  ? 'px-3 py-2.5 text-xs min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md'
                  : 'px-2 py-1 text-xs'
              }`}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {displayedCount !== undefined && totalCount !== undefined && (
        <div
          className={`font-bold text-gray-900 dark:text-gray-100 ${
            isMobile ? 'text-sm text-center' : 'text-sm'
          }`}
        >
          Displaying {displayedCount} of {totalCount} {classification ?? 'game logs'}
        </div>
      )}
    </div>
  );
}
