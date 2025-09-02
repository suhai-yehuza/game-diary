'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import { useBannerVisibility } from '@/hooks/use-banner-visibility';
import { useLiveGames } from '@/hooks/use-live-games';
import { MOCK_LIVE_GAMES } from '@/lib/mock/liveGamesMock';
import type { IGameResponse } from '@/lib/types';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';

/**
 * Determines which games to display based on environment and data availability
 */
function getDisplayGames(realGames: IGameResponse[] | null): IGameResponse[] {
  // If there are real live games, use them
  if (realGames && realGames.length > 0) {
    return realGames;
  }

  // Check if we should show mock games
  const shouldShowMockGames = isMockModeEnabled();

  if (shouldShowMockGames) {
    return MOCK_LIVE_GAMES.response;
  }

  return [];
}

/**
 * Enhanced LiveGamesBanner component with industry-standard features
 */
export function LiveGamesBanner() {
  const router = useRouter();
  const { games } = useLiveGames();
  const { shouldDisplayBanner, isClient } = useBannerVisibility();
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Get the games to display using our centralized logic
  const displayGames = getDisplayGames(games);

  // Update last updated timestamp when games change
  useEffect(() => {
    if (displayGames.length > 0) {
      setLastUpdated(new Date());
    }
  }, [displayGames]);

  // Simulate loading state for better UX
  useEffect(() => {
    if (displayGames.length === 0) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [displayGames.length]);

  // Pause animation on hover/touch for better UX
  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  // Haptic feedback for mobile interactions
  const handleGameClick = useCallback(
    (gameId: number) => {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      // Navigate to game detail page
      router.push(`/sports/nba/games/${gameId}`);
    },
    [router]
  );

  // Use the banner visibility hook to determine if we should render
  if (!shouldDisplayBanner || !isClient) {
    return null;
  }

  if (displayGames.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="live-games-banner"
      className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-gray-900 to-blue-900 text-white py-0.5 xs:py-1 sm:py-1.5 px-1 xs:px-2 sm:px-4 shadow-lg"
      style={
        {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          // Ensure proper stacking context for WebKit
          transform: 'translateZ(0)',
          willChange: 'transform',
        } as React.CSSProperties
      }
      role="banner"
      aria-label="Live sports games"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-full flex items-center px-2 xs:px-3 sm:px-4">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
            <div className="flex items-center space-x-1 xs:space-x-2 text-xs sm:text-sm">
              <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Loading live games...</span>
            </div>
          </div>
        )}

        {/* Live Games Info Panel - Simplified */}
        <div className="flex-shrink-0 mr-2 xs:mr-3 sm:mr-4">
          <div
            className="flex items-center gap-3 px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            tabIndex={0}
            role="button"
            aria-label={`${displayGames.length} live games currently playing, last updated at ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, click to view all`}
            onClick={() => {
              if ('vibrate' in navigator) {
                navigator.vibrate(10);
              }
              window.location.href = '/sports/live';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if ('vibrate' in navigator) {
                  navigator.vibrate(10);
                }
                window.location.href = '/sports/live';
              }
            }}
          >
            {/* Live Status with Pulse */}
            <div className="relative flex items-center">
              <div
                data-testid="live-indicator"
                className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-live-dot-glow"
              />
              <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
              <div className="absolute inset-0 w-3 h-3 bg-red-500/20 rounded-full blur-sm scale-150" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold leading-none">
                {displayGames.length} Live Games
              </span>
              <span className="text-xs opacity-75 leading-none">
                <span className="hidden sm:inline">Last Updated at</span>
                <span className="sm:hidden">Updated at</span>{' '}
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* View All Link */}
        <div className="flex-shrink-0 mr-2 xs:mr-3 sm:mr-4">
          <Link
            href="/sports/live"
            className="inline-flex items-center px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="View all live games"
          >
            View All
          </Link>
        </div>

        {/* Scrolling games area - takes up remaining space */}
        <div className="flex-1 overflow-hidden bg-black/10">
          <div
            className={`flex items-center space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 h-full ${
              isPaused ? 'animate-none' : 'animate-scroll-left'
            }`}
          >
            {/* Add responsive padding to start games further from the edges and account for info panel */}
            <div className="w-[60px] xs:w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px] xl:w-[160px] 2xl:w-[180px]" />
            {displayGames.map((game: IGameResponse, index: number) => (
              <React.Fragment key={game.id}>
                <div
                  data-testid="game"
                  className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 flex-shrink-0 cursor-pointer hover:bg-white/10 rounded-lg px-1 xs:px-1.5 sm:px-2 py-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-gray-900"
                  onClick={() => handleGameClick(game.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleGameClick(game.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${game.teams.visitors.name} ${game.scores.visitors.points} at ${game.teams.home.name} ${game.scores.home.points}, ${game.status.short}`}
                >
                  {/* Away Team */}
                  <div className="flex items-center space-x-0.5 xs:space-x-0.5 sm:space-x-1">
                    <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 relative">
                      <Image
                        src={game.teams.visitors.logo}
                        alt={`${game.teams.visitors.name} logo`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 475px) 8px, (max-width: 640px) 10px, (max-width: 768px) 12px, 12px"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-xs font-medium">{game.teams.visitors.code}</span>
                    <span className="text-xs font-bold">{game.scores.visitors.points}</span>
                  </div>

                  {/* @ */}
                  <span className="text-xs text-gray-200">@</span>

                  {/* Home Team */}
                  <div className="flex items-center space-x-0.5 xs:space-x-0.5 sm:space-x-1">
                    <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 relative">
                      <Image
                        src={game.teams.home.logo}
                        alt={`${game.teams.home.name} logo`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 475px) 8px, (max-width: 640px) 10px, (max-width: 768px) 12px, 12px"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-xs font-medium">{game.teams.home.code}</span>
                    <span className="text-xs font-bold">{game.scores.home.points}</span>
                  </div>

                  {/* Game Status */}
                  {game.status.clock && (
                    <span className="text-xs text-gray-200 ml-0.5 xs:ml-1 sm:ml-2">
                      {game.status.clock}
                    </span>
                  )}
                  {/* Quarter */}
                  <span className="text-xs text-gray-200 ml-0.5 xs:ml-0.5 sm:ml-1">
                    {game.status.short}
                  </span>
                </div>

                {/* Separator between games */}
                {index < displayGames.length - 1 && (
                  <div className="w-px h-2.5 xs:h-3 sm:h-4 bg-gray-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}

            {/* Duplicate first few games for seamless scrolling */}
            {displayGames.slice(0, 3).map((game: IGameResponse) => (
              <React.Fragment key={`duplicate-${game.id}`}>
                <div className="w-px h-2.5 xs:h-3 sm:h-4 bg-gray-600 flex-shrink-0" />
                <div
                  data-testid="game"
                  className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 flex-shrink-0 cursor-pointer hover:bg-white/10 rounded-lg px-1 xs:px-1.5 sm:px-2 py-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-gray-900"
                  onClick={() => handleGameClick(game.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleGameClick(game.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${game.teams.visitors.name} ${game.scores.visitors.points} at ${game.teams.home.name} ${game.scores.home.points}, ${game.status.short}`}
                >
                  {/* Away Team */}
                  <div className="flex items-center space-x-0.5 xs:space-x-0.5 sm:space-x-1">
                    <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 relative">
                      <Image
                        src={game.teams.visitors.logo}
                        alt={`${game.teams.visitors.name} logo`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 475px) 8px, (max-width: 640px) 10px, (max-width: 768px) 12px, 12px"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-xs font-medium">{game.teams.visitors.code}</span>
                    <span className="text-xs font-bold">{game.scores.visitors.points}</span>
                  </div>

                  {/* @ */}
                  <span className="text-xs text-gray-200">@</span>

                  {/* Home Team */}
                  <div className="flex items-center space-x-0.5 xs:space-x-0.5 sm:space-x-1">
                    <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 relative">
                      <Image
                        src={game.teams.home.logo}
                        alt={`${game.teams.home.name} logo`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 475px) 8px, (max-width: 640px) 10px, (max-width: 768px) 12px, 12px"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-xs font-medium">{game.teams.home.code}</span>
                    <span className="text-xs font-bold">{game.scores.home.points}</span>
                  </div>

                  {/* Game Status */}
                  {game.status.clock && (
                    <span className="text-xs text-gray-200 ml-0.5 xs:ml-1 sm:ml-2">
                      {game.status.clock}
                    </span>
                  )}
                  {/* Quarter */}
                  <span className="text-xs text-gray-200 ml-0.5 xs:ml-0.5 sm:ml-1">
                    {game.status.short}
                  </span>
                </div>
              </React.Fragment>
            ))}
            {/* End padding for continuous scroll */}
            <div className="w-[50vw]" />
          </div>
        </div>
      </div>
    </div>
  );
}
