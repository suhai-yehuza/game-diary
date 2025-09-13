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
      return 'text-theme-muted bg-bg-theme-secondary';
    }

    switch (status.toLowerCase()) {
      case 'ft':
      case 'finished':
        return 'text-semantic-success bg-semantic-success/10';
      case 'live':
      case 'q1':
      case 'q2':
      case 'q3':
      case 'q4':
      case 'ot':
        return 'text-semantic-error bg-semantic-error/10';
      case 'scheduled':
      case 'ns':
        return 'text-semantic-info bg-semantic-info/10';
      case 'cancelled':
      case 'postponed':
        return 'text-semantic-warning bg-semantic-warning/10';
      default:
        return 'text-theme-muted bg-bg-theme-secondary';
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
      return <Clock className="w-4 h-4 text-theme-muted" />;

    switch (status.toLowerCase()) {
      case 'ft':
      case 'finished':
        return <Trophy className="w-4 h-4 text-semantic-success" />;
      case 'live':
      case 'q1':
      case 'q2':
      case 'q3':
      case 'q4':
      case 'ot':
        return <Star className="w-4 h-4 text-semantic-error" />;
      case 'scheduled':
      case 'ns':
        return <CalendarDays className="w-4 h-4 text-semantic-info" />;
      case 'cancelled':
      case 'postponed':
        return <X className="w-4 h-4 text-semantic-warning" />;
      default:
        return <Clock className="w-4 h-4 text-theme-muted" />;
    }
  };

  const isTeamHighlighted = (teamId: string) => {
    return highlightTeam && teamId === highlightTeam;
  };

  const getTeamHighlightClass = (teamId: string) => {
    if (isTeamHighlighted(teamId)) {
      return 'ring-2 ring-brand-primary bg-brand-primary/10 border-brand-primary';
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
      <Card className="hover:shadow-lg transition-all duration-200 bg-surface-card shadow-md border border-theme-primary game-card-enhanced h-full flex flex-col">
        <CardContent className="p-3 xs:p-4 sm:p-4 md:p-5 lg:p-6 flex flex-col h-full">
          <div className="flex flex-col gap-2 xs:gap-3 sm:gap-4 h-full">
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
                        className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-bg-theme-secondary rounded-full flex items-center justify-center p-1 border-2 border-theme-primary shadow-sm transition-all duration-200 hover:bg-bg-theme-tertiary hover:scale-105 hover:border-theme-secondary hover:shadow-md relative ${getTeamHighlightClass(game.teams.visitors.id)}`}
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
                    <div className="font-semibold text-xs xs:text-sm sm:text-base md:text-lg text-theme-primary break-words leading-tight min-h-[2rem] xs:min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center">
                      {game.teams.visitors.name ?? 'Away Team'}
                    </div>
                    <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-theme-primary">
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
                        className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-bg-theme-secondary rounded-full flex items-center justify-center p-1 border-2 border-theme-primary shadow-sm transition-all duration-200 hover:bg-bg-theme-tertiary hover:scale-105 hover:border-theme-secondary hover:shadow-md relative ${getTeamHighlightClass(game.teams.home.id)}`}
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
                    <div className="font-semibold text-xs xs:text-sm sm:text-base md:text-lg text-theme-primary break-words leading-tight min-h-[2rem] xs:min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center">
                      {game.teams.home.name ?? 'Home Team'}
                    </div>
                    <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-theme-primary">
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
