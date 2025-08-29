'use client';

import { Calendar, Gamepad2, Star, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { IGameLogSearchResultProps } from '@/lib/types';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function GameLogSearchResult({ gameLog }: IGameLogSearchResultProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to the user page
    router.push('/protected/user');
  };

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start space-x-4">
        {/* Enhanced Avatar */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Game Log Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {gameLog.away_team_nickname && gameLog.home_team_nickname
                    ? `${gameLog.away_team_nickname} @ ${gameLog.home_team_nickname}`
                    : `Game Log #${gameLog.game_id ?? 'unknown'}`}
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700">
                  <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full mr-1.5" />
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

              <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(gameLog.created_at)}</span>
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

            {/* Action indicator with prompt */}
            <div className="flex-shrink-0 ml-4 flex flex-col items-end">
              <Gamepad2 className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300" />
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
