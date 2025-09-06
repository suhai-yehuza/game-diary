'use client';

import { Calendar, Star, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BRAND_COLORS, GRADIENTS } from '@/lib/constants/colors';
import type { IGameSearchResultProps } from '@/types';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatScore(homeScore?: number, awayScore?: number) {
  if (homeScore !== undefined && awayScore !== undefined) {
    return `${awayScore} - ${homeScore}`;
  }
  return 'TBD';
}

export function GameSearchResult({ game }: IGameSearchResultProps) {
  const router = useRouter();
  const homeTeamDisplay = game.home_team_nickname ?? game.home_team_name ?? 'Unknown Team';
  const awayTeamDisplay = game.away_team_nickname ?? game.away_team_name ?? 'Unknown Team';
  const gameTitle = `${awayTeamDisplay} @ ${homeTeamDisplay}`;

  const handleClick = () => {
    router.push(`/sports/nba/games/${game.id}`);
  };

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {/* Subtle background pattern */}
      <div
        className={`absolute inset-0 ${GRADIENTS.sports.nba.background} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative flex items-start space-x-4">
        {/* Enhanced Avatar */}
        <div className="flex-shrink-0">
          <div
            className={`w-14 h-14 ${GRADIENTS.sports.nba.avatar} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300`}
          >
            <Trophy className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Game Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words leading-tight">
                  {gameTitle}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${GRADIENTS.sports.nba.badge} text-[${BRAND_COLORS.nextjs.cyan}] dark:text-[${BRAND_COLORS.nextjs.cyan}] border border-[${BRAND_COLORS.nextjs.cyan}]/30 dark:border-[${BRAND_COLORS.nextjs.cyan}]/50 flex-shrink-0`}
                >
                  <span
                    className={`w-1.5 h-1.5 bg-[${BRAND_COLORS.nextjs.cyan}] rounded-full mr-1.5`}
                  />
                  Game
                </span>
              </div>

              {/* Game Score */}
              {game.scores?.home?.points !== undefined &&
                game.scores?.visitors?.points !== undefined && (
                  <div className="flex items-center space-x-1 mb-3">
                    <Trophy className="w-4 h-4 text-gray-400" />
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {formatScore(game.scores.home.points, game.scores.visitors.points)}
                    </span>
                  </div>
                )}

              <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{game.date ? formatDate(game.date) : 'Unknown Date'}</span>
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

              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-lg text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                {game.status ? game.status.toLowerCase() : 'Unknown Status'}
              </div>
            </div>

            {/* Action indicator with prompt */}
            <div className="flex-shrink-0 ml-4 flex flex-col items-end">
              <Star className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300" />
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
