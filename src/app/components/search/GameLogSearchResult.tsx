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
    router.push(`/protected/user`);
  };

  return (
    <div
      className="flex items-center space-x-4 p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-accent-purple/10 dark:bg-accent-purple/20 rounded-full flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-accent-purple" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {gameLog.away_team_nickname && gameLog.home_team_nickname
              ? `${gameLog.away_team_nickname} @ ${gameLog.home_team_nickname}`
              : `Game Log #${gameLog.game_id ?? 'unknown'}`}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
            Game Log
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>@{gameLog.username ?? 'unknown'}</span>
          </span>
          {gameLog.rating_for_game !== undefined && gameLog.rating_for_game !== null && (
            <span className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>{gameLog.rating_for_game}/5</span>
            </span>
          )}
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(gameLog.created_at)}</span>
          </span>
          {gameLog.home_team_city && (
            <span className="flex items-center space-x-1">
              <span>• {gameLog.home_team_city}</span>
            </span>
          )}
        </div>
        {gameLog.classification && (
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            Classification: {gameLog.classification}
          </p>
        )}
      </div>
    </div>
  );
}
