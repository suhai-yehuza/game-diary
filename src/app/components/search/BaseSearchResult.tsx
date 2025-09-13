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
  gradient = 'from-bg-theme-secondary/30 to-transparent',
  badgeColor: _badgeColor = 'bg-bg-theme-secondary text-theme-muted',
  badgeText,
  badgeIcon,
}: IBaseSearchResultProps) {
  return (
    <div
      className="group relative bg-surface-card border border-theme-primary rounded-xl p-6 hover:shadow-lg hover:border-theme-secondary transition-all duration-300 cursor-pointer overflow-hidden"
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
            <span className="text-xs text-theme-muted group-hover:text-theme-secondary mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
