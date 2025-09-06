'use client';

import { User, MapPin, GraduationCap, Calendar, Ruler, Trophy, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { errorHandlers } from '@/lib/utils/error-handler';
import type { IPlayerSearchResultProps } from '@/types';

function _formatDate(dateString: string) {
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
      component: 'PlayerSearchResult',
      action: 'Format date',
    });
    return null;
  }
}

export function PlayerSearchResult({ player }: IPlayerSearchResultProps) {
  const router = useRouter();
  const UserIcon = User;
  const MapPinIcon = MapPin;
  const GraduationCapIcon = GraduationCap;
  const _CalendarIcon = Calendar;

  const handleClick = () => {
    router.push(`/sports/nba/players/${player.id}`);
  };

  const fullName = [player.first_name, player.last_name].filter(Boolean).join(' ');

  // Parse height and weight from various possible formats
  const getHeight = () => {
    // Handle string that contains JSON
    if (typeof player.height === 'string' && player.height.includes('{')) {
      try {
        const heightData = JSON.parse(player.height);
        if (heightData.feets && heightData.inches) {
          return `${heightData.feets}'${heightData.inches}"`;
        }
        if (heightData.meters) {
          return `${heightData.meters}m`;
        }
      } catch (error) {
        errorHandlers.ui(error instanceof Error ? error : new Error(String(error)), {
          component: 'PlayerSearchResult',
          action: 'Parse height JSON',
        });
        // Fall back to original string if JSON parse fails
      }
    }

    // Handle direct object (typed as any for flexibility)
    if (typeof player.height === 'object' && player.height) {
      const heightObj = player.height as unknown as {
        feets: number;
        inches: number;
        meters: number;
      };
      if (heightObj.feets && heightObj.inches) {
        return `${heightObj.feets}'${heightObj.inches}"`;
      }
      if (heightObj.meters) {
        return `${heightObj.meters}m`;
      }
    }

    // Handle direct properties (typed as any for flexibility)
    const playerAny = player as unknown as { feets: number; inches: number; meters: number };
    if (playerAny.feets && playerAny.inches) return `${playerAny.feets}'${playerAny.inches}"`;
    if (playerAny.meters) return `${playerAny.meters}m`;
    if (player.height && typeof player.height === 'string' && !player.height.includes('{')) {
      return player.height;
    }
    return null;
  };

  const getWeight = () => {
    // Handle string that contains JSON
    if (typeof player.weight === 'string' && player.weight.includes('{')) {
      try {
        const weightData = JSON.parse(player.weight);
        if (weightData.pounds) {
          return `${weightData.pounds} lbs`;
        }
        if (weightData.kilograms) {
          return `${weightData.kilograms} kg`;
        }
      } catch (error) {
        errorHandlers.ui(error instanceof Error ? error : new Error(String(error)), {
          component: 'PlayerSearchResult',
          action: 'Parse weight JSON',
        });
        // Fall back to original string if JSON parse fails
      }
    }

    // Handle direct object (typed as any for flexibility)
    if (typeof player.weight === 'object' && player.weight) {
      const weightObj = player.weight as unknown as { pounds: number; kilograms: number };
      if (weightObj.pounds) {
        return `${weightObj.pounds} lbs`;
      }
      if (weightObj.kilograms) {
        return `${weightObj.kilograms} kg`;
      }
    }

    // Handle direct properties (typed as any for flexibility)
    const playerAny = player as unknown as { pounds: number; kilograms: number };
    if (playerAny.pounds) return `${playerAny.pounds} lbs`;
    if (playerAny.kilograms) return `${playerAny.kilograms} kg`;
    if (player.weight && typeof player.weight === 'string' && !player.weight.includes('{')) {
      return player.weight;
    }
    return null;
  };

  const height = getHeight();
  const weight = getWeight();
  const heightWeight = [height, weight].filter(Boolean).join(' • ');

  // Parse teams information
  const getTeams = () => {
    // Handle string that contains JSON
    if (typeof player.teams === 'string' && player.teams.includes('[')) {
      try {
        const teamsData = JSON.parse(player.teams);
        if (Array.isArray(teamsData)) {
          return teamsData
            .map(team => {
              if (typeof team === 'object') {
                return team.team_name || team.name || 'Unknown Team';
              }
              return team;
            })
            .filter(Boolean)
            .join(', ');
        }
      } catch (error) {
        errorHandlers.ui(error instanceof Error ? error : new Error(String(error)), {
          component: 'PlayerSearchResult',
          action: 'Parse teams JSON',
        });
        // Fall back to original string if JSON parse fails
      }
    }

    // Handle direct array
    if (Array.isArray(player.teams)) {
      return player.teams
        .map((team: unknown) =>
          typeof team === 'object' && team !== null
            ? (team as { team_name?: string; name?: string }).team_name ||
              (team as { team_name?: string; name?: string }).name ||
              'Unknown Team'
            : String(team)
        )
        .filter(Boolean)
        .join(', ');
    }

    // Handle simple string
    if (typeof player.teams === 'string' && !player.teams.includes('[')) {
      return player.teams;
    }

    return null;
  };

  const teams = getTeams();

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start space-x-4">
        {/* Enhanced Avatar */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
            <UserIcon className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Player Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {fullName || 'Unknown Player'}
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5" />
                  Player
                </span>
              </div>

              {/* Basic Player Info - Keep it simple for search cards */}
              <div className="space-y-2">
                {/* Primary team (most important) */}
                {teams && teams !== 'null' && teams !== 'undefined' && (
                  <div className="flex items-center space-x-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="font-medium">{teams.split(',')[0].trim()}</span>
                    {teams.includes(',') && (
                      <span className="text-gray-500 text-xs">
                        +{teams.split(',').length - 1} more
                      </span>
                    )}
                  </div>
                )}

                {/* Fallback for raw teams data */}
                {!teams &&
                  player.teams &&
                  typeof player.teams === 'string' &&
                  player.teams.includes('[') && (
                    <div className="flex items-center space-x-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="font-medium">Multiple Teams</span>
                      <span className="text-gray-500 text-xs">(see details)</span>
                    </div>
                  )}

                {/* Physical stats if available */}
                {heightWeight && heightWeight !== 'null • null' && (
                  <div className="flex items-center space-x-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Ruler className="w-4 h-4" />
                    <span>{heightWeight}</span>
                  </div>
                )}

                {/* Fallback for raw physical data */}
                {!heightWeight && (player.height || player.weight) && (
                  <div className="flex items-center space-x-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Ruler className="w-4 h-4" />
                    <span className="text-gray-500 text-xs">Physical stats available</span>
                  </div>
                )}

                {/* College if available and not missing */}
                {player.college && player.college !== 'missing-college' && (
                  <div className="flex items-center space-x-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <GraduationCapIcon className="w-4 h-4" />
                    <span>{player.college}</span>
                  </div>
                )}
              </div>

              {/* NBA Status Badge (simplified) */}
              {player.nba && (
                <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Trophy className="w-3 h-3 mr-1.5" />
                  {typeof player.nba === 'object' &&
                  (player.nba as unknown as { start: number }).start
                    ? `NBA ${(player.nba as unknown as { start: number }).start}+`
                    : 'NBA Player'}
                </div>
              )}
            </div>

            {/* Action indicator with subtle prompt */}
            <div className="flex-shrink-0 ml-4 flex flex-col items-end">
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300" />
              <span className="text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                View Details
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
