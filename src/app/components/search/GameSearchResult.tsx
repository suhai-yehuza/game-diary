'use client';

import { Calendar, Star, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BaseSearchResult } from '@/app/components/search/BaseSearchResult';
import { formatScore, formatSearchDate } from '@/app/components/search/utils/searchDataParsers';
import { SEARCH_STYLES } from '@/app/components/search/utils/searchStyles';
import type { IGameSearchResultProps } from '@/types';

export function GameSearchResult({ game }: IGameSearchResultProps) {
  const router = useRouter();

  // Improved fallback logic: code -> nickname -> name -> generic fallback
  const homeTeamDisplay =
    game.home_team_code?.trim() ||
    game.home_team_nickname?.trim() ||
    game.home_team_name?.trim() ||
    'Unknown Team';

  const awayTeamDisplay =
    game.away_team_code?.trim() ||
    game.away_team_nickname?.trim() ||
    game.away_team_name?.trim() ||
    'Unknown Team';

  const gameTitle = `${awayTeamDisplay} @ ${homeTeamDisplay}`;

  const handleClick = () => {
    router.push(`/sports/nba/games/${game.id}`);
  };

  return (
    <BaseSearchResult
      onClick={handleClick}
      gradient={SEARCH_STYLES.gradients.game}
      badgeColor={SEARCH_STYLES.badge.game}
      badgeText="View Details"
      badgeIcon={<Star className={SEARCH_STYLES.actionIndicator.icon} />}
    >
      {/* Enhanced Avatar */}
      <div className="flex-shrink-0">
        <div className={`${SEARCH_STYLES.avatar.base} ${SEARCH_STYLES.avatar.game}`}>
          <Trophy className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Game Information */}
      <div className={SEARCH_STYLES.content.info}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className={`${SEARCH_STYLES.content.title} break-words leading-tight`}>
                {gameTitle}
              </h3>
              <span
                className={`${SEARCH_STYLES.badge.base} ${SEARCH_STYLES.badge.game} flex-shrink-0`}
              >
                <span
                  className={`w-1.5 h-1.5 ${SEARCH_STYLES.badgeDot.game} rounded-full mr-1.5`}
                />
                Game
              </span>
            </div>

            {/* Game Score */}
            {game.scores?.home?.points !== undefined &&
              game.scores?.visitors?.points !== undefined && (
                <div className="flex items-center space-x-1 mb-3">
                  <Trophy className="w-4 h-4 text-theme-muted" />
                  <span className="text-lg font-bold text-theme-primary">
                    {formatScore(game.scores.home.points, game.scores.visitors.points)}
                  </span>
                </div>
              )}

            <div className={SEARCH_STYLES.content.meta}>
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4" />
                <span>{game.date ? formatSearchDate(game.date) : 'Unknown Date'}</span>
              </div>

              {(() => {
                const rating =
                  typeof game.average_rating === 'string'
                    ? parseFloat(game.average_rating)
                    : (game.average_rating as number);
                return rating && rating > 0 ? (
                  <div className="flex items-center space-x-1.5">
                    <Star className="w-4 h-4" />
                    <span>
                      {rating.toFixed(1)}/5 ({game.total_ratings} ratings)
                    </span>
                  </div>
                ) : null;
              })()}

              {game.home_team_city && (
                <div className="flex items-center space-x-1.5">
                  <span>• {game.home_team_city}</span>
                </div>
              )}
            </div>

            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-lg text-xs bg-bg-theme-secondary text-theme-secondary capitalize">
              {game.status?.long || game.status?.short || 'Unknown Status'}
            </div>
          </div>
        </div>
      </div>
    </BaseSearchResult>
  );
}
