'use client';

import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  X,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/input';
import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';
import { GAME_STATUS_VALUES } from '@/lib/constants';
import type { IGameFiltersProps } from '@/lib/types';

export function GameFilters({
  filters,
  filterOptions,
  showAdvancedFilters,
  hasActiveFilters,
  totalGames,
  filteredGamesCount,
  onUpdateFilter,
  onClearFilters,
  onToggleAdvancedFilters,
  onRefresh,
}: IGameFiltersProps) {
  return (
    <Card className="game-filters-enhanced shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white dark:text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-400 dark:text-blue-600" />
            Game Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-red-400 dark:text-red-600 border-red-400 dark:border-red-600 hover:bg-red-900/20 dark:hover:bg-red-50 font-medium"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAdvancedFilters}
              className="border-slate-300 dark:border-gray-300 hover:bg-slate-200 dark:hover:bg-gray-100 hover:border-slate-400 dark:hover:border-gray-400 font-medium text-slate-100 dark:text-gray-700"
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              {showAdvancedFilters ? 'Hide Advanced' : 'Show Advanced'}
              {showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Basic Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-4">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search teams, arenas, or dates..."
              value={filters.searchTerm}
              onChange={e => onUpdateFilter('searchTerm', e.target.value)}
              className="pl-10 bg-slate-100 dark:bg-white border-slate-300 dark:border-gray-300 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 dark:placeholder:text-gray-500 h-11 text-gray-900 dark:text-gray-900"
            />
          </div>

          <select
            value={filters.statusFilter}
            onChange={e => onUpdateFilter('statusFilter', e.target.value)}
            className="h-11 bg-slate-100 dark:bg-white border border-slate-300 dark:border-gray-300 text-gray-900 dark:text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px 16px',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <option value="all">All Statuses</option>
            <option value={GAME_STATUS_VALUES.FINISHED.toLowerCase()}>
              {GAME_STATUS_VALUES.FINISHED}
            </option>
            <option value={GAME_STATUS_VALUES.LIVE.toLowerCase()}>{GAME_STATUS_VALUES.LIVE}</option>
            <option value={GAME_STATUS_VALUES.IN_PROGRESS.toLowerCase()}>
              {GAME_STATUS_VALUES.IN_PROGRESS.replace('_', ' ')}
            </option>
            <option value={GAME_STATUS_VALUES.SCHEDULED.toLowerCase()}>
              {GAME_STATUS_VALUES.SCHEDULED}
            </option>
            <option value={GAME_STATUS_VALUES.CANCELLED.toLowerCase()}>
              {GAME_STATUS_VALUES.CANCELLED}
            </option>
          </select>

          <select
            value={filters.seasonFilter}
            onChange={e => onUpdateFilter('seasonFilter', e.target.value)}
            className="h-11 bg-slate-100 dark:bg-white border border-slate-300 dark:border-gray-300 text-gray-900 dark:text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px 16px',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <option value="all">All Seasons</option>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(season => (
              <option key={season} value={season.toString()}>
                {season}-{season + 1}
              </option>
            ))}
          </select>

          <select
            value={filters.dateRange}
            onChange={e => onUpdateFilter('dateRange', e.target.value)}
            className="h-11 bg-slate-100 dark:bg-white border border-slate-300 dark:border-gray-300 text-gray-900 dark:text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px 16px',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Calendar Year</option>
            <option value="custom">Custom Range</option>
          </select>

          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={e => onUpdateFilter('sortBy', e.target.value)}
              className="flex-1 h-11 bg-slate-100 dark:bg-white border border-slate-300 dark:border-gray-300 text-gray-900 dark:text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 relative"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px 16px',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
              <option value="arena">Arena</option>
              <option value="team">Team</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onUpdateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')
              }
              className="h-11 px-3 border-slate-300 dark:border-gray-300 hover:bg-slate-200 dark:hover:bg-gray-100 hover:border-slate-400 dark:hover:border-gray-400 text-slate-100 dark:text-gray-700"
            >
              <span>{filters.sortDirection === 'asc' ? '↑' : '↓'}</span>
            </Button>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {filters.dateRange === 'custom' && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={filters.customStartDate}
                  onChange={e => onUpdateFilter('customStartDate', e.target.value)}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:dark:brightness-0 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={filters.customEndDate}
                  onChange={e => onUpdateFilter('customEndDate', e.target.value)}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:dark:brightness-0 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  Arena
                </label>
                <select
                  value={filters.arenaFilter}
                  onChange={e => onUpdateFilter('arenaFilter', e.target.value)}
                  className="w-full h-11 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 relative"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px 16px',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <option value="all">All Arenas</option>
                  {filterOptions.arenas.map((arena: string) => (
                    <option key={arena} value={arena}>
                      {arena}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  Team
                </label>
                <select
                  value={filters.teamFilter}
                  onChange={e => onUpdateFilter('teamFilter', e.target.value)}
                  className="w-full h-11 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 relative"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px 16px',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <option value="all">All Teams</option>
                  {filterOptions.teams.map((team: string) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-4 pt-4 border-t border-slate-300 dark:border-gray-400">
          <div className="text-slate-100 dark:text-gray-700 text-sm sm:text-base">
            <span className="font-medium">{formatNumberShort(filteredGamesCount)}</span> games found
            {hasActiveFilters && (
              <span className="text-blue-300 dark:text-blue-600 ml-1">
                (filtered from {formatNumberShort(totalGames)} total)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="border-slate-300 dark:border-gray-300 hover:bg-slate-200 dark:hover:bg-gray-100 hover:border-slate-400 dark:hover:border-gray-400 font-medium text-slate-100 dark:text-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
