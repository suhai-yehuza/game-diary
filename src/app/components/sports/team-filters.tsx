'use client';

import { Filter, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/app/components/ui/button';
import { CustomSelect } from '@/app/components/ui/custom-select';
import type { ITeamFiltersProps } from '@/types';

export function TeamFilters({
  title,
  description,
  icon,
  filters,
  onRefresh,
  error,
  className = '',
}: ITeamFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasActiveFilters = filters.some((filter: { value: string }) => filter.value !== '');

  return (
    <div className={`head2head-filters-card rounded-xl p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
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

          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          )}

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                filters.forEach(
                  (filter: {
                    value: string;
                    onChange: (value: string) => void;
                    options: Array<{ value: string; label: string; icon: null }>;
                  }) => {
                    if (filter.options[0]?.value === '') {
                      filter.onChange('');
                    }
                  }
                );
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-6 space-y-4">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filters.map(
              (filter: {
                label: string;
                value: string;
                onChange: (value: string) => void;
                options: Array<{ value: string; label: string; icon: null }>;
                icon?: React.ReactNode;
              }) => (
                <div
                  key={`filter-${filter.label}-${filter.value}`}
                  className="flex items-center gap-3"
                >
                  {filter.icon && <div className="text-gray-500">{filter.icon}</div>}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                    {filter.label}:
                  </span>
                  <CustomSelect
                    value={filter.value}
                    onChange={filter.onChange}
                    options={filter.options}
                    size="sm"
                    className="flex-1"
                  />
                </div>
              )
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
