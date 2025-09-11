'use client';

import { User, MapPin, GraduationCap, Ruler, Trophy, ArrowRight, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BaseSearchResult } from '@/app/components/search/BaseSearchResult';
import {
  parseHeight,
  parseWeight,
  parseTeams,
} from '@/app/components/search/utils/searchDataParsers';
import { SEARCH_STYLES } from '@/app/components/search/utils/searchStyles';
import type { IPlayerSearchResultProps } from '@/types';

// Removed _formatDate - using formatSearchDate from utilities instead

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

  // Use centralized parsing utilities
  const height = parseHeight(player.height, player);
  const weight = parseWeight(player.weight, player);
  const heightWeight = [height, weight].filter(Boolean).join(' • ');
  const teams = parseTeams(player.teams);

  return (
    <BaseSearchResult
      onClick={handleClick}
      gradient={SEARCH_STYLES.gradients.player}
      badgeColor={SEARCH_STYLES.badge.player}
      badgeText="View Details"
      badgeIcon={<ArrowRight className={SEARCH_STYLES.actionIndicator.icon} />}
    >
      {/* Enhanced Avatar */}
      <div className="flex-shrink-0">
        <div className={`${SEARCH_STYLES.avatar.base} ${SEARCH_STYLES.avatar.player}`}>
          <UserIcon className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Player Information */}
      <div className={SEARCH_STYLES.content.info}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className={`${SEARCH_STYLES.content.title} truncate`}>
                {fullName || 'Unknown Player'}
              </h3>
              <span className={`${SEARCH_STYLES.badge.base} ${SEARCH_STYLES.badge.player}`}>
                <span
                  className={`w-1.5 h-1.5 ${SEARCH_STYLES.badgeDot.player} rounded-full mr-1.5`}
                />
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
        </div>
      </div>
    </BaseSearchResult>
  );
}
