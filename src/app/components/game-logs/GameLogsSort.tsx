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
      return <ArrowUpDown className="w-4 h-4 text-white" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-brand-primary" />
    ) : (
      <ArrowDown className="w-4 h-4 text-brand-primary" />
    );
  };

  return (
    <div
      className={`${isMobile ? 'flex-col' : 'sm:flex-row sm:items-center sm:justify-between'}`}
      data-testid="game-logs-sort"
    >
      {/* Sort Controls */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Sort by:</h4>
          {sortKey && (
            <button
              onClick={() => onSort('', null)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
            >
              Clear
            </button>
          )}
        </div>

        <div
          className={`grid gap-2 mb-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5'}`}
        >
          {sortOptions.map((option: { key: string; label: string }) => (
            <button
              key={option.key}
              onClick={() => handleSort(option.key)}
              className={`flex items-center justify-center gap-1.5 rounded-md border transition-all duration-200 ${
                sortKey === option.key
                  ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-md'
                  : 'bg-neutral-800 dark:bg-neutral-800 border-neutral-600 dark:border-neutral-600 text-white dark:text-white'
              } ${isMobile ? 'px-2 py-2.5 text-xs' : 'px-3 py-2 text-sm'}`}
            >
              {getSortIcon(option.key)}
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      {displayedCount !== undefined && totalCount !== undefined && (
        <div className="flex items-center justify-between pt-6 pb-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-white">
            Showing {displayedCount} of {totalCount} {classification ?? 'game logs'}
          </span>
        </div>
      )}
    </div>
  );
}
