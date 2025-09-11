'use client';

import {
  Search,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  X,
  RefreshCw,
  User,
  List,
  Calendar,
  CheckCircle,
  Play,
  Clock,
  XCircle,
  MapPin,
  GraduationCap,
} from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { CustomSelect } from '@/app/components/ui/custom-select';
import { Input } from '@/app/components/ui/input';
import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';
import type { IPlayerFiltersProps } from '@/types';

export function PlayerFilters({
  filters,
  filterOptions,
  showAdvancedFilters,
  hasActiveFilters,
  totalPlayers,
  filteredPlayersCount,
  onUpdateFilter,
  onClearFilters,
  onToggleAdvancedFilters,
  onRefresh,
}: IPlayerFiltersProps) {
  const _selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px 16px',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <Card className="player-filters-enhanced shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white dark:text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400 dark:text-blue-600" />
            Player Filters
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search players by name..."
              value={filters.searchTerm}
              onChange={e => onUpdateFilter('searchTerm', e.target.value)}
              className="pl-10 bg-slate-100 dark:bg-white border-slate-300 dark:border-gray-300 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 dark:placeholder:text-gray-500 h-11 text-gray-900 dark:text-gray-900"
            />
          </div>

          <CustomSelect
            value={filters.positionFilter}
            onChange={value => onUpdateFilter('positionFilter', value)}
            options={[
              { value: 'all', label: 'All Positions', icon: <User className="w-4 h-4" /> },
              ...(filterOptions.positions?.map((position: string) => ({
                value: position,
                label: position,
                icon: <Play className="w-4 h-4" />,
              })) || []),
            ]}
            size="md"
            variant="outline"
            className="h-11"
          />

          <CustomSelect
            value={filters.activeFilter}
            onChange={value => onUpdateFilter('activeFilter', value)}
            options={[
              { value: 'all', label: 'All Players', icon: <User className="w-4 h-4" /> },
              { value: 'active', label: 'Active', icon: <CheckCircle className="w-4 h-4" /> },
              { value: 'inactive', label: 'Inactive', icon: <XCircle className="w-4 h-4" /> },
            ]}
            size="md"
            variant="outline"
            className="h-11"
          />

          <div className="flex gap-2">
            <CustomSelect
              value={filters.sortBy}
              onChange={value => onUpdateFilter('sortBy', value)}
              options={[
                { value: 'name', label: 'Name', icon: <List className="w-4 h-4" /> },
                { value: 'position', label: 'Position', icon: <Play className="w-4 h-4" /> },
                { value: 'age', label: 'Age', icon: <Calendar className="w-4 h-4" /> },
                { value: 'experience', label: 'Experience', icon: <Clock className="w-4 h-4" /> },
              ]}
              size="md"
              variant="outline"
              className="flex-1 h-11"
            />
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

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-slate-300 dark:border-gray-400 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-100 dark:text-gray-700 mb-2">
                  Country
                </label>
                <CustomSelect
                  value={filters.countryFilter}
                  onChange={value => onUpdateFilter('countryFilter', value)}
                  options={[
                    { value: 'all', label: 'All Countries', icon: <MapPin className="w-4 h-4" /> },
                    ...(filterOptions.countries?.map((country: string) => ({
                      value: country,
                      label: country,
                      icon: <MapPin className="w-4 h-4" />,
                    })) || []),
                  ]}
                  size="md"
                  variant="outline"
                  className="w-full h-11"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 dark:text-gray-700 mb-2">
                  College
                </label>
                <CustomSelect
                  value={filters.collegeFilter}
                  onChange={value => onUpdateFilter('collegeFilter', value)}
                  options={[
                    {
                      value: 'all',
                      label: 'All Colleges',
                      icon: <GraduationCap className="w-4 h-4" />,
                    },
                    ...(filterOptions.colleges?.map((college: string) => ({
                      value: college,
                      label: college,
                      icon: <GraduationCap className="w-4 h-4" />,
                    })) || []),
                  ]}
                  size="md"
                  variant="outline"
                  className="w-full h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Summary and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-4 pt-4 border-t border-slate-300 dark:border-gray-400">
          <div className="text-slate-100 dark:text-gray-700 text-sm sm:text-base">
            <span className="font-medium">{formatNumberShort(filteredPlayersCount)}</span> players
            found
            {hasActiveFilters && (
              <span className="text-blue-300 dark:text-blue-600 ml-1">
                (filtered from {formatNumberShort(totalPlayers)} total)
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
