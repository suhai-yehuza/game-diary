'use client';

import { Calendar, Gamepad2, Star, User, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BaseSearchResult } from '@/app/components/search/BaseSearchResult';
import { formatSearchDate } from '@/app/components/search/utils/searchDataParsers';
import { SEARCH_STYLES } from '@/app/components/search/utils/searchStyles';
import type { IGameLogSearchResultProps } from '@/types';

// Removed formatDate - using formatSearchDate from utilities instead

export function GameLogSearchResult({ gameLog }: IGameLogSearchResultProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to the user page
    router.push('/protected/dashboard');
  };

  return (
    <BaseSearchResult
      onClick={handleClick}
      gradient={SEARCH_STYLES.gradients.gameLog}
      badgeColor={SEARCH_STYLES.badge.gameLog}
      badgeText="View Details"
      badgeIcon={<ArrowRight className={SEARCH_STYLES.actionIndicator.icon} />}
    >
      {/* Enhanced Avatar */}
      <div className="flex-shrink-0">
        <div className={`${SEARCH_STYLES.avatar.base} ${SEARCH_STYLES.avatar.gameLog}`}>
          <Gamepad2 className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Game Log Information */}
      <div className={SEARCH_STYLES.content.info}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className={`${SEARCH_STYLES.content.title} truncate`}>
                {gameLog.away_team_nickname && gameLog.home_team_nickname
                  ? `${gameLog.away_team_nickname} @ ${gameLog.home_team_nickname}`
                  : `Game Log #${gameLog.game_id ?? 'unknown'}`}
              </h3>
              <span className={`${SEARCH_STYLES.badge.base} ${SEARCH_STYLES.badge.gameLog}`}>
                <span
                  className={`w-1.5 h-1.5 ${SEARCH_STYLES.badgeDot.gameLog} rounded-full mr-1.5`}
                />
                Game Log
              </span>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-1 mb-3">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                @{gameLog.username ?? 'unknown'}
              </span>
            </div>

            <div className={SEARCH_STYLES.content.meta}>
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatSearchDate(gameLog.created_at)}</span>
              </div>

              {gameLog.rating_for_game !== undefined && gameLog.rating_for_game !== null && (
                <div className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4" />
                  <span>{gameLog.rating_for_game}/5</span>
                </div>
              )}

              {gameLog.home_team_city && (
                <div className="flex items-center space-x-1.5">
                  <span>• {gameLog.home_team_city}</span>
                </div>
              )}
            </div>

            {gameLog.classification && (
              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-lg text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                Classification: {gameLog.classification}
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseSearchResult>
  );
}
