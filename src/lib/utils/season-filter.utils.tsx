import { Calendar } from 'lucide-react';

import type { ISeasonOption, ISeasonOptionSimple } from '@/types';

import { getLatestNbaSeason, getRecentNbaSeasons } from './nba-season';

/**
 * Get centralized season filter options for NBA components
 * @param count Number of seasons to include (default: 11 for current + 10 previous)
 * @param includeAllSeasons Whether to include "All Seasons" option (default: true)
 * @returns Array of season options for dropdowns
 */
export function getSeasonFilterOptions(count = 11, includeAllSeasons = true): ISeasonOption[] {
  const latestSeason = getLatestNbaSeason();
  const recentSeasons = getRecentNbaSeasons(count);

  const seasonOptions: ISeasonOption[] = [];

  // Add "All Seasons" option if requested
  if (includeAllSeasons) {
    seasonOptions.push({
      value: 'all',
      label: 'All Seasons',
      icon: <Calendar className="w-4 h-4" />,
    });
  }

  // Add individual season options
  recentSeasons.forEach(season => {
    const isLatest = season === latestSeason;
    seasonOptions.push({
      value: season.toString(),
      label: `${season}-${season + 1} Season${isLatest ? ' (Latest)' : ''}`,
      icon: <Calendar className="w-4 h-4" />,
    });
  });

  return seasonOptions;
}

/**
 * Get the current NBA season
 * @returns Current NBA season year
 */
export function getCurrentNbaSeason(): number {
  return getLatestNbaSeason();
}

/**
 * Get recent NBA seasons as an array of numbers
 * @param count Number of seasons to include (default: 11)
 * @returns Array of season years
 */
export function getRecentNbaSeasonsArray(count = 11): number[] {
  return getRecentNbaSeasons(count);
}

/**
 * Get centralized season filter options for NBA components (simple format for TeamFilters)
 * @param count Number of seasons to include (default: 11 for current + 10 previous)
 * @param includeAllSeasons Whether to include "All Seasons" option (default: true)
 * @returns Array of season options for dropdowns (simple format)
 */
export function getSeasonFilterOptionsSimple(
  count = 11,
  includeAllSeasons = true
): ISeasonOptionSimple[] {
  const latestSeason = getLatestNbaSeason();
  const recentSeasons = getRecentNbaSeasons(count);

  const seasonOptions: ISeasonOptionSimple[] = [];

  // Add "All Seasons" option if requested
  if (includeAllSeasons) {
    seasonOptions.push({
      value: 'all',
      label: 'All Seasons',
      icon: null,
    });
  }

  // Add individual season options
  recentSeasons.forEach(season => {
    const isLatest = season === latestSeason;
    seasonOptions.push({
      value: season.toString(),
      label: `${season}-${season + 1} Season${isLatest ? ' (Latest)' : ''}`,
      icon: null,
    });
  });

  return seasonOptions;
}

/**
 * Format season year for display
 * @param season Season year
 * @param isLatest Whether this is the latest season
 * @returns Formatted season string
 */
export function formatSeasonDisplay(season: number, isLatest = false): string {
  return `${season}-${season + 1} Season${isLatest ? ' (Latest)' : ''}`;
}
