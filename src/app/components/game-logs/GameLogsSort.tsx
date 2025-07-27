'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import React from 'react';

import type { IGameLogsSortProps } from '@/lib/types/gameLog.types';

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
    <div className="flex items-center justify-between gap-2 mb-4">
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-bold"
          style={{
            fontWeight: 'bold',
            fontSize: '14px',
            color: 'rgb(17, 24, 39) !important', // text-gray-900 equivalent
          }}
        >
          Sort by:
        </span>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map(option => (
            <button
              key={option.key}
              onClick={() => handleSort(option.key)}
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg border transition-colors ${
                sortKey === option.key
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {getSortIcon(option.key)}
              {option.label}
            </button>
          ))}
          {sortKey && (
            <button
              onClick={() => onSort('', null)}
              className="px-2 py-1 text-xs text-gray-800 hover:text-black dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {displayedCount !== undefined && totalCount !== undefined && (
        <div
          className="text-sm font-bold"
          style={{
            fontWeight: 'bold',
            fontSize: '14px',
            color: 'rgb(17, 24, 39) !important', // text-gray-900 equivalent
          }}
        >
          Displaying {displayedCount} of {totalCount} {classification ?? 'game logs'}
        </div>
      )}
    </div>
  );
}
