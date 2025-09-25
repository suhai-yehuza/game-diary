'use client';

import { Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import type { IRecentGame, IIntegratedGamesProps } from '@/types';

export function IntegratedGames({ data }: IIntegratedGamesProps) {
  const loading = !data;
  const error = null; // No error handling needed for server-side data
  const { containerRef, contentRef, handleMouseEnter, handleMouseLeave } = useScrollAnimation({
    speed: 1.0, // Much slower for better readability
    mobileSpeed: 0.5, // Even slower on mobile
  });

  // Extract recent games from cached data
  const latestGames = data?.finishedGames || [];

  if (loading) {
    return (
      <div className="space-y-3 flex flex-col h-full">
        {Array.from({ length: 5 }, (_, i) => `game-skeleton-${i}-${Date.now()}`).map(uniqueId => (
          <div key={uniqueId} className="bg-bg-theme-secondary rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-bg-theme-secondary rounded-full" />
                <div className="h-4 bg-bg-theme-secondary rounded w-20" />
              </div>
              <div className="h-6 bg-bg-theme-secondary rounded w-8" />
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">vs</div>
            <div className="flex items-center justify-between">
              <div className="h-6 bg-bg-theme-secondary rounded w-8" />
              <div className="flex items-center gap-2">
                <div className="h-4 bg-bg-theme-secondary rounded w-20" />
                <div className="w-6 h-6 bg-bg-theme-secondary rounded-full" />
              </div>
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !latestGames.length) {
    return (
      <div className="text-center py-2">
        <div className="text-theme-secondary mb-1 text-xs">No recent games available</div>
        <Link
          href="/sports/nba/games"
          className="inline-block px-6 py-2 bg-brand-primary text-theme-inverse rounded-lg hover:bg-brand-primary-hover transition-colors"
        >
          Browse All Games
        </Link>
      </div>
    );
  }

  // Show top 5 recent games
  const displayGames = latestGames.slice(0, 5);

  const formatGameDate = (game: IRecentGame) => {
    const dateString = typeof game.date === 'string' ? game.date : game.date.start;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatGameTime = (game: IRecentGame) => {
    const dateString = typeof game.date === 'string' ? game.date : game.date.start;
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-3 flex flex-col h-full">
      {/* Recent Games List with Scroll Animation */}
      <div
        ref={containerRef}
        className="h-[42rem] overflow-auto relative scroll-container animate-scroll"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={contentRef} className="space-y-3 scroll-content">
          {displayGames.map((game: IRecentGame, index: number) => (
            <div
              key={`recent-${String(game.id)}`}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {/* Game Header with Rank and Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    #{index + 1}
                  </span>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Final</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatGameDate(game)}
                </div>
              </div>

              {/* Arena Info */}
              {game.arena && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-brand-primary">🏟️</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {game.arena.name}
                    </span>
                    {game.arena.city && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {game.arena.city}
                        {game.arena.state && `, ${game.arena.state}`}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Team Logos and Scores */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {game.teams?.home?.logo ? (
                      <Image
                        src={game.teams.home.logo}
                        alt={game.teams.home.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {game.teams?.home?.name?.charAt(0) || 'H'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm break-words leading-tight">
                      {game.teams?.home?.name || 'Home Team'}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {game.scores?.home?.points || '-'}
                    </div>
                  </div>
                </div>

                <div className="text-center mx-2 flex-shrink-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400">VS</div>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <div className="flex-1 text-right min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm break-words leading-tight">
                      {game.teams?.visitors?.name || 'Away Team'}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {game.scores?.visitors?.points || '-'}
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {game.teams?.visitors?.logo ? (
                      <Image
                        src={game.teams.visitors.logo}
                        alt={game.teams.visitors.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {game.teams?.visitors?.name?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Game Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatGameDate(game)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatGameTime(game)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="mt-auto pt-4">
        <Link
          href="/sports/all-sports"
          className="block w-full text-center py-3 bg-brand-primary text-theme-inverse rounded-lg hover:bg-brand-primary-hover transition-all duration-200 font-medium"
        >
          View All Games
        </Link>
      </div>
    </div>
  );
}
