'use client';

import { Calendar, Filter, Star, Tag, User, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/app/components/ui/button';
import { CustomSelect } from '@/app/components/ui/custom-select';
import type { IGameLogsFiltersProps, IGameLogsFiltersState } from '@/types';

const RATING_OPTIONS = [
  { value: '', label: 'All Ratings', icon: null },
  { value: '1', label: '1 Star', icon: null },
  { value: '2', label: '2 Stars', icon: null },
  { value: '3', label: '3 Stars', icon: null },
  { value: '4', label: '4 Stars', icon: null },
  { value: '5', label: '5 Stars', icon: null },
];

const WATCHED_SETTING_OPTIONS = [
  { value: '', label: 'All Settings', icon: null },
  { value: 'HOME', label: 'Home', icon: null },
  { value: 'TV', label: 'TV', icon: null },
  { value: 'BAR', label: 'Bar', icon: null },
  { value: 'ARENA', label: 'Arena', icon: null },
  { value: 'STREAMING', label: 'Streaming', icon: null },
];

const WATCHED_SCOPE_OPTIONS = [
  { value: '', label: 'All Scopes', icon: null },
  { value: 'PRE_GAME', label: 'Pre-Game', icon: null },
  { value: 'FULL_GAME', label: 'Full Game', icon: null },
  { value: 'HIGHLIGHTS', label: 'Highlights', icon: null },
  { value: 'POST_GAME', label: 'Post-Game', icon: null },
];

export function GameLogsFilters({ onFiltersChange, initialFilters = {} }: IGameLogsFiltersProps) {
  const [filters, setFilters] = useState<IGameLogsFiltersState>({
    teamName: '',
    username: '',
    tags: '',
    watchedDateFrom: '',
    watchedDateTo: '',
    gameDateFrom: '',
    gameDateTo: '',
    rating: '',
    watchedSetting: '',
    watchedScope: '',
    ...initialFilters,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof IGameLogsFiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: IGameLogsFiltersState = {
      teamName: '',
      username: '',
      tags: '',
      watchedDateFrom: '',
      watchedDateTo: '',
      gameDateFrom: '',
      gameDateTo: '',
      rating: '',
      watchedSetting: '',
      watchedScope: '',
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Game Logs Filters
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Filter game logs by team, user, dates, and more
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Row 1: Team and User */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                Team:
              </span>
              <input
                type="text"
                placeholder="Search by team name..."
                value={filters.teamName}
                onChange={e => updateFilter('teamName', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                User:
              </span>
              <input
                type="text"
                placeholder="Search by username or name..."
                value={filters.username}
                onChange={e => updateFilter('username', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 2: Tags and Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                Tags:
              </span>
              <input
                type="text"
                placeholder="Search by tags..."
                value={filters.tags}
                onChange={e => updateFilter('tags', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                Rating:
              </span>
              <CustomSelect
                value={filters.rating}
                onChange={value => updateFilter('rating', value)}
                options={RATING_OPTIONS}
                size="sm"
                className="flex-1"
              />
            </div>
          </div>

          {/* Row 3: Watched Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                Watched From:
              </span>
              <input
                type="date"
                value={filters.watchedDateFrom}
                onChange={e => updateFilter('watchedDateFrom', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                Watched To:
              </span>
              <input
                type="date"
                value={filters.watchedDateTo}
                onChange={e => updateFilter('watchedDateTo', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 4: Game Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                Game From:
              </span>
              <input
                type="date"
                value={filters.gameDateFrom}
                onChange={e => updateFilter('gameDateFrom', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                Game To:
              </span>
              <input
                type="date"
                value={filters.gameDateTo}
                onChange={e => updateFilter('gameDateTo', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 5: Setting and Scope */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                Setting:
              </span>
              <CustomSelect
                value={filters.watchedSetting}
                onChange={value => updateFilter('watchedSetting', value)}
                options={WATCHED_SETTING_OPTIONS}
                size="sm"
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                Scope:
              </span>
              <CustomSelect
                value={filters.watchedScope}
                onChange={value => updateFilter('watchedScope', value)}
                options={WATCHED_SCOPE_OPTIONS}
                size="sm"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
