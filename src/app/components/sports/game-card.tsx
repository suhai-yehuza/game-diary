'use client';

import { Calendar, Clock, Building2, Trophy, Star, CalendarDays, X } from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent } from '@/app/components/ui/Card';
import type { IGameCardProps, IGameResponse } from '@/types';

export function GameCard({ game, highlightTeam }: IGameCardProps) {
  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status || typeof status !== 'string') {
      return 'text-neutral-700 bg-neutral-200 dark:text-neutral-300 dark:bg-neutral-800';
    }

    switch (status.toLowerCase()) {
      case 'ft':
      case 'finished':
        return 'text-green-900 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'live':
      case 'q1':
      case 'q2':
      case 'q3':
      case 'q4':
      case 'ot':
        return 'text-red-900 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
      case 'scheduled':
      case 'ns':
        return 'text-blue-900 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'cancelled':
      case 'postponed':
        return 'text-orange-900 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30';
      default:
        return 'text-gray-900 bg-gray-200 dark:text-gray-300 dark:bg-gray-800';
    }
  };

  const getDisplayStatus = (game: IGameResponse) => {
    const status = typeof game.status === 'string' ? game.status : game.status?.short;
    const statusLong = typeof game.status === 'string' ? game.status : game.status?.long;
    const gameDate = new Date(typeof game.date === 'string' ? game.date : game.date.start);
    const now = new Date();

    // Handle both string and number status values
    const statusStr = typeof status === 'string' ? status : String(status || '');
    if (!statusStr) return 'Unknown';

    const statusLower = statusStr.toLowerCase();
    const statusLongLower = statusLong?.toLowerCase() || '';

    // Check if it's a scheduled game (SCHEDULED status in database)
    // Handle both string status and JSONB status object
    const isScheduledStatus = statusLower === 'scheduled' || statusLongLower === 'scheduled';

    if (isScheduledStatus) {
      // If the game date is in the past, it's cancelled/postponed
      if (gameDate <= now) {
        return 'Cancelled';
      }
      // If the game date is in the future, it's truly scheduled
      return 'Scheduled';
    }

    // Check if it's a postponed game (should be cancelled)
    const isPostponed = statusLongLower === 'postponed' || statusLower === 'postponed';

    if (isPostponed) {
      return 'Cancelled';
    }

    // Check if it's explicitly cancelled
    const isCancelled = statusLongLower === 'cancelled' || statusLower === 'cancelled';

    if (isCancelled) {
      return 'Cancelled';
    }

    // Return the original status for other cases
    return statusLong || statusStr;
  };

  const getStatusIcon = (status: string | null | undefined) => {
    if (!status || typeof status !== 'string')
      return <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />;

    switch (status.toLowerCase()) {
      case 'ft':
      case 'finished':
        return <Trophy className="w-4 h-4 text-green-700 dark:text-green-400" />;
      case 'live':
      case 'q1':
      case 'q2':
      case 'q3':
      case 'q4':
      case 'ot':
        return <Star className="w-4 h-4 text-red-700 dark:text-red-400" />;
      case 'scheduled':
      case 'ns':
        return <CalendarDays className="w-4 h-4 text-blue-700 dark:text-blue-400" />;
      case 'cancelled':
      case 'postponed':
        return <X className="w-4 h-4 text-orange-700 dark:text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const isTeamHighlighted = (teamId: string) => {
    return highlightTeam && teamId === highlightTeam;
  };

  const getTeamHighlightClass = (teamId: string) => {
    if (isTeamHighlighted(teamId)) {
      return 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600';
    }
    return '';
  };

  const handleCardClick = () => {
    window.location.href = `/sports/nba/games/${game.id}`;
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer transition-transform duration-200 hover:scale-[1.02] h-full"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View details for ${game.teams.visitors.name} vs ${game.teams.home.name}`}
      data-testid="game-card"
    >
      <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 game-card-enhanced h-full flex flex-col">
        <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col h-full">
          <div className="flex flex-col gap-3 sm:gap-4 h-full">
            {/* Teams and Score */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-center mb-2 sm:mb-3 flex-1">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 w-full">
                  <div
                    className={`text-center min-w-0 flex-1 ${getTeamHighlightClass(game.teams.visitors.id)}`}
                  >
                    {/* Away Team Logo */}
                    <div className="flex justify-center mb-2">
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center p-1 border-2 border-gray-200 dark:border-gray-600 shadow-sm transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md relative ${getTeamHighlightClass(game.teams.visitors.id)}`}
                      >
                        <Image
                          src={game.teams.visitors.logo || '/defaults/team-logo.svg'}
                          alt={`${game.teams.visitors.name} logo`}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain animate-fade-in"
                        />
                      </div>
                    </div>
                    <div className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white break-words leading-tight min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem] flex items-center justify-center">
                      {game.teams.visitors.name ?? 'Away Team'}
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {game.scores?.visitors?.points ?? '-'}
                    </div>
                  </div>
                  <div className="game-meta-text text-base sm:text-lg font-medium flex-shrink-0 px-1">
                    @
                  </div>
                  <div
                    className={`text-center min-w-0 flex-1 ${getTeamHighlightClass(game.teams.home.id)}`}
                  >
                    {/* Home Team Logo */}
                    <div className="flex justify-center mb-2">
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center p-1 border-2 border-gray-200 dark:border-gray-600 shadow-sm transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md relative ${getTeamHighlightClass(game.teams.home.id)}`}
                      >
                        <Image
                          src={game.teams.home.logo || '/defaults/team-logo.svg'}
                          alt={`${game.teams.home.name} logo`}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain animate-fade-in"
                        />
                      </div>
                    </div>
                    <div className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white break-words leading-tight min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem] flex items-center justify-center">
                      {game.teams.home.name ?? 'Home Team'}
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {game.scores?.home?.points ?? '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm game-details-text mt-auto">
                <div className="flex items-center gap-1 min-w-0">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{formatGameDate(game.date.start)}</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{formatGameTime(game.date.start)}</span>
                </div>
                {game.arena?.name && (
                  <div className="flex items-center gap-1 min-w-0">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{game.arena.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 min-w-0">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {game.season
                      ? `${game.season}-${parseInt(game.season) + 1} Season`
                      : 'Unknown Season'}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-end mt-auto">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                {getStatusIcon(game.status?.short)}
                <div
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium truncate ${getStatusColor(getDisplayStatus(game))}`}
                >
                  {getDisplayStatus(game)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
