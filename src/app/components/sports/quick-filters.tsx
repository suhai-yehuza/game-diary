'use client';

import { CustomSelect } from '@/app/components/ui/custom-select';
import { formatShort } from '@/lib/utils/format-numbers';
import type { IQuickFiltersProps } from '@/types';

export function QuickFilters({ title, icon, totalCount, filters }: IQuickFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Filter and sort {formatShort(totalCount)} items
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {filters.map(filter => (
            <div key={`filter-${filter.label}`} className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {filter.label}:
              </span>
              <CustomSelect
                value={filter.value}
                onChange={filter.onChange}
                options={filter.options}
                size="sm"
                variant="default"
                className={filter.className || 'min-w-[140px]'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
