'use client';

import { Gamepad2, User, Calendar, Star } from 'lucide-react';

import type { ISearchResult } from '@/lib/types';

interface IGameLogSearchResultProps {
  gameLog: ISearchResult;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function GameLogSearchResult({ gameLog }: IGameLogSearchResultProps) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-foreground truncate">
            Game Log #{gameLog.game_id ?? 'unknown'}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
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
