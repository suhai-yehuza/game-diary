'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import React from 'react';

import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import type { IGameLogsSortProps } from '@/lib/types';

// All sort options
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
      return <ArrowUpDown className="w-4 h-4 text-neutral-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-brand-primary" />
    ) : (
      <ArrowDown className="w-4 h-4 text-brand-primary" />
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
          className={`font-bold text-neutral-900 dark:text-neutral-100 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}
        >
          Sort by:
        </span>
        <div className={`flex flex-wrap gap-2 ${isMobile ? 'gap-1' : 'gap-2'}`}>
          {sortOptions.map((option: { key: string; label: string }) => (
            <button
              key={option.key}
              onClick={() => handleSort(option.key)}
              className={`flex items-center gap-1 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                sortKey === option.key
                  ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border-brand-primary/30 dark:border-brand-primary/40 text-brand-primary dark:text-brand-primary shadow-md'
                  : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              } ${isMobile ? 'px-3 py-2.5 text-xs min-h-[44px]' : 'px-3 py-2 text-sm'}`}
            >
              {getSortIcon(option.key)}
              <span className={isMobile ? 'text-xs' : 'text-sm'}>{option.label}</span>
            </button>
          ))}

          {sortKey && (
            <button
              onClick={() => onSort('', null)}
              className={`text-neutral-800 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-all duration-200 ${
                isMobile
                  ? 'px-3 py-2.5 text-xs min-h-[44px] rounded-xl border border-neutral-200 dark:border-neutral-600 shadow-sm hover:shadow-md'
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
          className={`font-bold text-neutral-900 dark:text-neutral-100 ${
            isMobile ? 'text-sm text-center' : 'text-sm'
          }`}
        >
          Displaying {displayedCount} of {totalCount} {classification ?? 'game logs'}
        </div>
      )}
    </div>
  );
}
