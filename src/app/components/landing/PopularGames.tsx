'use client';

import { Star, TrendingUp, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import type { IPopularGamesProps, IPopularGame } from '@/types';

export function PopularGames({ data }: IPopularGamesProps) {
  const loading = !data;
  const error = null; // No error handling needed for server-side data
  const [activeTab, setActiveTab] = useState<'topRated' | 'mostRated' | 'mostPopular'>(
    'mostPopular'
  );
  const { containerRef, contentRef, handleMouseEnter, handleMouseLeave } = useScrollAnimation({
    speed: 2,
    mobileSpeed: 1,
  });

  // Extract popular games from cached data
  const topRated: IPopularGame[] = data?.topRated || [];
  const mostRated: IPopularGame[] = data?.mostRated || [];
  const mostPopular: IPopularGame[] = data?.mostPopular || [];

  const tabs = [
    { id: 'mostPopular', label: 'Most Popular', icon: TrendingUp, data: mostPopular },
    { id: 'topRated', label: 'Top Rated', icon: Star, data: topRated },
    { id: 'mostRated', label: 'Most Rated', icon: Trophy, data: mostRated },
  ] as const;

  if (loading) {
    return (
      <div className="space-y-3 flex flex-col h-full">
        {Array.from({ length: 5 }, (_, i) => `popular-game-skeleton-${i}-${Date.now()}`).map(
          uniqueId => (
            <div key={uniqueId} className="bg-bg-theme-secondary rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-theme-muted rounded-full" />
                  <div className="h-4 bg-theme-muted rounded w-20" />
                </div>
                <div className="h-6 bg-theme-muted rounded w-8" />
              </div>
              <div className="text-center text-sm text-theme-muted mb-3">vs</div>
              <div className="flex items-center justify-between">
                <div className="h-6 bg-theme-muted rounded w-8" />
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-theme-muted rounded w-20" />
                  <div className="w-6 h-6 bg-theme-muted rounded-full" />
                </div>
              </div>
              <div className="text-center text-sm text-theme-muted mt-2">
                <div className="h-3 bg-theme-muted rounded w-24 mx-auto" />
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  if (error || (!topRated.length && !mostRated.length && !mostPopular.length)) {
    return (
      <div className="text-center py-8">
        <div className="text-theme-muted mb-4">No popular games available</div>
        <Link
          href="/sports/all-sports"
          className="inline-block px-6 py-2 bg-brand-primary text-theme-inverse rounded-lg hover:bg-brand-primary-hover transition-colors"
        >
          Browse All Games
        </Link>
      </div>
    );
  }

  const activeData = tabs.find(tab => tab.id === activeTab)?.data || [];

  const formatGameDate = (game: IPopularGame) => {
    const dateString = typeof game.date === 'string' ? game.date : game.date?.start;
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <div className="space-y-3 flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-bg-theme-secondary rounded-lg p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasData = tab.data.length > 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!hasData}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-surface-card text-theme-primary shadow-sm'
                  : hasData
                    ? 'text-theme-secondary hover:text-theme-primary hover:bg-bg-theme-tertiary'
                    : 'text-theme-disabled cursor-not-allowed'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Popular Games List with Scroll Animation */}
      <div
        ref={containerRef}
        className="h-[37.5rem] overflow-auto relative scroll-container animate-scroll"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={contentRef} className="space-y-3 scroll-content">
          {activeData.slice(0, 5).map((game: IPopularGame, index: number) => (
            <div
              key={`${activeTab}-${game.id}`}
              className="bg-bg-theme-secondary rounded-lg p-4 hover:bg-bg-theme-tertiary transition-colors"
            >
              {/* Game Header with Rating Info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-theme-muted">#{index + 1}</span>
                  {activeTab === 'topRated' && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-theme-primary">
                        {formatRating(game.rating?.average || 0)}
                      </span>
                    </div>
                  )}
                  {activeTab === 'mostRated' && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-semantic-info" />
                      <span className="text-sm font-semibold text-theme-primary">
                        {game.rating?.totalRatings || 0} ratings
                      </span>
                    </div>
                  )}
                  {activeTab === 'mostPopular' && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-semantic-success" />
                      <span className="text-sm font-semibold text-theme-primary">
                        {formatRating(game.rating?.popularityScore || 0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-theme-muted">{formatGameDate(game)}</div>
              </div>

              {/* Arena Info */}
              {game.arena && (
                <div className="bg-surface-card rounded-lg p-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        🏟️
                      </span>
                    </div>
                    <span className="text-xs font-medium text-theme-primary truncate">
                      {game.arena.name}
                    </span>
                    {game.arena.city && (
                      <span className="text-xs text-theme-muted">
                        {game.arena.city}
                        {'state' in game.arena && game.arena.state && `, ${game.arena.state}`}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Team Logos and Scores */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 bg-bg-theme-tertiary rounded-full flex items-center justify-center flex-shrink-0">
                    {game.homeTeam?.logo ? (
                      <Image
                        src={game.homeTeam.logo}
                        alt={game.homeTeam.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-theme-secondary">
                        {game.homeTeam?.name?.charAt(0) || 'H'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-theme-primary text-sm break-words leading-tight">
                      {game.homeTeam?.name || 'Home Team'}
                    </div>
                    <div className="text-lg font-bold text-theme-primary">
                      {game.scores?.home?.points || '-'}
                    </div>
                  </div>
                </div>

                <div className="text-center mx-2 flex-shrink-0">
                  <div className="text-xs text-theme-muted">VS</div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Final</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <div className="flex-1 text-right min-w-0">
                    <div className="font-semibold text-theme-primary text-sm break-words leading-tight">
                      {game.awayTeam?.name || 'Away Team'}
                    </div>
                    <div className="text-lg font-bold text-theme-primary">
                      {game.scores?.visitors?.points || '-'}
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-bg-theme-tertiary rounded-full flex items-center justify-center flex-shrink-0">
                    {game.awayTeam?.logo ? (
                      <Image
                        src={game.awayTeam.logo}
                        alt={game.awayTeam.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-theme-secondary">
                        {game.awayTeam?.name?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Rating Info */}
              <div className="flex items-center justify-between text-xs text-theme-muted">
                <div className="flex items-center gap-2">
                  <span>Rating: {formatRating(game.rating?.average || 0)}</span>
                  <span>•</span>
                  <span>{game.rating?.totalRatings || 0} ratings</span>
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
          className="block w-full text-center py-3 bg-brand-secondary text-theme-inverse rounded-lg hover:bg-brand-secondary-hover transition-all duration-200 font-medium"
        >
          View All Games
        </Link>
      </div>
    </div>
  );
}
