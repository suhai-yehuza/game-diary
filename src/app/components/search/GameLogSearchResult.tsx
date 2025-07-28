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
      className="flex items-center space-x-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-foreground truncate">
            {gameLog.away_team_nickname && gameLog.home_team_nickname
              ? `${gameLog.away_team_nickname} @ ${gameLog.home_team_nickname}`
              : `Game Log #${gameLog.game_id ?? 'unknown'}`}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Game Log
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
          <p className="text-xs text-muted-foreground mt-1">
            Classification: {gameLog.classification}
          </p>
        )}
      </div>
    </div>
  );
}
