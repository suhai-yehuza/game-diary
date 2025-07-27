'use client';

import { Calendar, Star, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { ISearchResult } from '@/lib/types';

interface IGameSearchResultProps {
  game: ISearchResult;
}

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
    router.push(`/sports/nba/game/${game.id}`);
  };

  return (
    <div
      className="flex items-center space-x-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
          <Trophy className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-foreground truncate">{gameTitle}</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Game
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{game.date ? formatDate(game.date) : 'Unknown Date'}</span>
          </span>
          {game.home_team_score !== undefined && game.away_team_score !== undefined && (
            <span className="flex items-center space-x-1">
              <span className="font-medium">
                {formatScore(game.home_team_score, game.away_team_score)}
              </span>
            </span>
          )}
          {(() => {
            const rating =
              typeof game.average_rating === 'string'
                ? parseFloat(game.average_rating)
                : (game.average_rating as number);
            return rating && rating > 0 ? (
              <span className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>
                  {rating.toFixed(1)}/5 ({game.total_ratings} ratings)
                </span>
              </span>
            ) : null;
          })()}
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
          <span className="capitalize">
            {(game.status as string)?.toLowerCase() ?? 'Unknown Status'}
          </span>
          {game.home_team_city && <span>• {game.home_team_city}</span>}
        </div>
      </div>
    </div>
  );
}
