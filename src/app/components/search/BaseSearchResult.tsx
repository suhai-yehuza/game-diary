'use client';

import type { IBaseSearchResultProps } from '@/types';

/**
 * Base Search Result Component
 *
 * Provides consistent styling and behavior for all search result components.
 * Reduces code duplication and ensures consistent UX across all result types.
 */
export function BaseSearchResult({
  children,
  onClick,
  gradient = 'from-gray-50/30 to-transparent',
  badgeColor: _badgeColor = 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  badgeText,
  badgeIcon,
}: IBaseSearchResultProps) {
  return (
    <div
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Subtle background pattern */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative flex items-start space-x-4">
        {children}

        {/* Action indicator */}
        <div className="flex-shrink-0 ml-4 flex flex-col items-end">
          {badgeIcon}
          {badgeText && (
            <span className="text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
