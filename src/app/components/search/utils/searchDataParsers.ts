/**
 * Search Data Parsing Utilities
 *
 * Centralized utilities for parsing complex data structures in search results.
 * Reduces code duplication and provides consistent data handling.
 */

import { errorHandlers } from '@/lib/utils/error-handler';
import type { IPlayerData } from '@/types';

/**
 * Parse height data from various formats
 */
export function parseHeight(height: unknown, player?: IPlayerData): string | null {
  if (!height && !player) return null;

  // Handle string that contains JSON
  if (typeof height === 'string' && height.includes('{')) {
    try {
      const heightData = JSON.parse(height) as { feets?: number; inches?: number; meters?: number };
      if (typeof heightData === 'object' && heightData !== null) {
        if (typeof heightData.feets === 'number' && typeof heightData.inches === 'number') {
          return `${heightData.feets}'${heightData.inches}"`;
        }
        if (typeof heightData.meters === 'number') {
          return `${heightData.meters}m`;
        }
      }
    } catch (error) {
      errorHandlers.ui(error instanceof Error ? error : new Error(String(error)), {
        component: 'SearchDataParsers',
        action: 'Parse height JSON',
      });
    }
  }

  // Handle direct object
  if (typeof height === 'object' && height) {
    const heightObj = height as { feets?: number; inches?: number; meters?: number };
    if (typeof heightObj.feets === 'number' && typeof heightObj.inches === 'number') {
      return `${heightObj.feets}'${heightObj.inches}"`;
    }
    if (typeof heightObj.meters === 'number') {
      return `${heightObj.meters}m`;
    }
  }

  // Handle direct properties on height object
  if (height && typeof height === 'object') {
    const heightAny = height as { feets?: number; inches?: number; meters?: number };
    if (typeof heightAny.feets === 'number' && typeof heightAny.inches === 'number') {
      return `${heightAny.feets}'${heightAny.inches}"`;
    }
    if (typeof heightAny.meters === 'number') {
      return `${heightAny.meters}m`;
    }
  }

  // Handle direct properties on player object
  if (player) {
    if (typeof player.feets === 'number' && typeof player.inches === 'number') {
      return `${player.feets}'${player.inches}"`;
    }
    if (typeof player.meters === 'number') {
      return `${player.meters}m`;
    }
  }

  // Handle simple string
  if (typeof height === 'string' && !height.includes('{')) {
    return height;
  }

  return null;
}

/**
 * Parse weight data from various formats
 */
export function parseWeight(weight: unknown, player?: IPlayerData): string | null {
  if (!weight && !player) return null;

  // Handle string that contains JSON
  if (typeof weight === 'string' && weight.includes('{')) {
    try {
      const weightData = JSON.parse(weight) as { pounds?: number; kilograms?: number };
      if (typeof weightData === 'object' && weightData !== null) {
        if (typeof weightData.pounds === 'number') {
          return `${weightData.pounds} lbs`;
        }
        if (typeof weightData.kilograms === 'number') {
          return `${weightData.kilograms} kg`;
        }
      }
    } catch (error) {
      errorHandlers.ui(error instanceof Error ? error : new Error(String(error)), {
        component: 'SearchDataParsers',
        action: 'Parse weight JSON',
      });
    }
  }

  // Handle direct object
  if (typeof weight === 'object' && weight) {
    const weightObj = weight as { pounds?: number; kilograms?: number };
    if (typeof weightObj.pounds === 'number') {
      return `${weightObj.pounds} lbs`;
    }
    if (typeof weightObj.kilograms === 'number') {
      return `${weightObj.kilograms} kg`;
    }
  }

  // Handle direct properties on weight object
  if (weight && typeof weight === 'object') {
    const weightAny = weight as { pounds?: number; kilograms?: number };
    if (typeof weightAny.pounds === 'number') {
      return `${weightAny.pounds} lbs`;
    }
    if (typeof weightAny.kilograms === 'number') {
      return `${weightAny.kilograms} kg`;
    }
  }

  // Handle direct properties on player object
  if (player) {
    if (typeof player.pounds === 'number') {
      return `${player.pounds} lbs`;
    }
    if (typeof player.kilograms === 'number') {
      return `${player.kilograms} kg`;
    }
  }

  // Handle simple string
  if (typeof weight === 'string' && !weight.includes('{')) {
    return weight;
  }

  return null;
}

/**
 * Parse teams data from various formats
 */
export function parseTeams(teams: unknown): string | null {
  if (!teams) return null;

  // Handle string that contains JSON array
  if (typeof teams === 'string' && teams.includes('[')) {
    try {
      const teamsData = JSON.parse(teams) as unknown[];
      if (Array.isArray(teamsData)) {
        return teamsData
          .map(team => {
            if (typeof team === 'object' && team !== null) {
              const teamObj = team as {
                team_name?: string;
                name?: string;
                nickname?: string;
                code?: string;
              };
              return (
                teamObj.team_name?.trim() ||
                teamObj.name?.trim() ||
                teamObj.nickname?.trim() ||
                teamObj.code?.trim() ||
                'Unknown Team'
              );
            }
            return String(team);
          })
          .filter(Boolean)
          .join(', ');
      }
    } catch (error) {
      errorHandlers.ui(error instanceof Error ? error : new Error(String(error)), {
        component: 'SearchDataParsers',
        action: 'Parse teams JSON',
      });
    }
  }

  // Handle direct array
  if (Array.isArray(teams)) {
    return teams
      .map((team: unknown) =>
        typeof team === 'object' && team !== null
          ? (
              team as { team_name?: string; name?: string; nickname?: string; code?: string }
            ).team_name?.trim() ||
            (
              team as { team_name?: string; name?: string; nickname?: string; code?: string }
            ).name?.trim() ||
            (
              team as { team_name?: string; name?: string; nickname?: string; code?: string }
            ).nickname?.trim() ||
            (
              team as { team_name?: string; name?: string; nickname?: string; code?: string }
            ).code?.trim() ||
            'Unknown Team'
          : String(team)
      )
      .filter(Boolean)
      .join(', ');
  }

  // Handle simple string
  if (typeof teams === 'string' && !teams.includes('[')) {
    return teams;
  }

  return null;
}

/**
 * Format date string consistently
 */
export function formatSearchDate(dateString: string): string | null {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch (error) {
    errorHandlers.ui(error instanceof Error ? error : new Error(String(error)), {
      component: 'SearchDataParsers',
      action: 'Format date',
    });
    return null;
  }
}

/**
 * Format score consistently
 */
export function formatScore(homeScore?: number, awayScore?: number): string {
  if (homeScore !== undefined && awayScore !== undefined) {
    return `${awayScore} - ${homeScore}`;
  }
  return 'TBD';
}
