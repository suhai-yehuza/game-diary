'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';

import { useBannerVisibility } from '@/hooks/use-banner-visibility';
import { useLiveGames } from '@/hooks/use-live-games';
import { MOCK_LIVE_GAMES } from '@/lib/mock/liveGamesMock';
import type { IGameResponse } from '@/lib/types';

/**
 * Determines which games to display based on environment and data availability
 */
function getDisplayGames(realGames: IGameResponse[] | null): IGameResponse[] {
  // If there are real live games, use them
  if (realGames && realGames.length > 0) {
    return realGames;
  }

  // Check if we should show mock games
  const shouldShowMockGames =
    // Development with mock mode
    (process.env.NODE_ENV === 'development' && process.env.API_MOCK_MODE === 'true') ||
    // Test/CI environment
    (typeof window !== 'undefined' &&
      (window.__API_MOCK_MODE__ || window.__E2E_MOCK_MODE__ || window.__PLAYWRIGHT_TEST__));

  if (shouldShowMockGames) {
    return MOCK_LIVE_GAMES.response;
  }

  return [];
}

/**
 * Enhanced LiveGamesBanner component with industry-standard features
 */
export function LiveGamesBanner() {
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
  const handleGameClick = useCallback((gameId: number) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    // Navigate to game detail page
    router.push(`/sports/game/${gameId}`);
  }, [router]);

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
      <div className="container mx-auto max-w-7xl relative">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
            <div className="flex items-center space-x-1 xs:space-x-2 text-xs sm:text-sm">
              <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Loading live games...</span>
            </div>
          </div>
        )}

        {/* Full-width scrolling games background layer */}
        <div className="absolute inset-0 overflow-hidden bg-black/10">
          <div
            className={`flex items-center space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 h-full ${
              isPaused ? 'animate-none' : 'animate-scroll-left'
            }`}
          >
            {/* Add responsive padding to start games further from the edges */}
            <div className="w-[40px] xs:w-[60px] sm:w-[80px] md:w-[100px] lg:w-[120px] xl:w-[140px] 2xl:w-[160px]" />
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
          </div>
        </div>

        {/* Foreground UI elements with higher z-index */}
        <div className="relative z-10 flex items-center justify-between py-0.5 xs:py-1 sm:py-1.5 px-0">
          {/* Combined Live Games Info - positioned with responsive margins */}
          <div className="flex items-center ml-1 xs:ml-2 sm:ml-0 sm:-ml-4 md:-ml-8 lg:-ml-12 xl:-ml-16 2xl:-ml-20">
            {/* Combined Live Indicator with Last Updated */}
            <div
              className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3 bg-black/40 backdrop-blur-md rounded-full px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-0.5 sm:py-1 border border-white/20 hover:bg-black/50 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg"
              tabIndex={0}
              role="button"
              aria-label={`${displayGames.length} live games currently playing, last updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
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
              <div
                data-testid="live-indicator"
                className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-semantic-error rounded-full animate-live-dot-glow flex-shrink-0"
                aria-hidden="true"
              />
              <div className="flex flex-col items-start space-y-0.5">
                <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
                  {displayGames.length} {displayGames.length === 1 ? 'Live Game' : 'Live Games'}
                </span>
                <div className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-1.5">
                  <div className="w-0.5 h-0.5 xs:w-0.5 xs:h-0.5 sm:w-1 sm:h-1 bg-green-400 rounded-full animate-update-pulse flex-shrink-0" />
                  <span className="text-xs text-gray-200">
                    Updated{' '}
                    {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* View All Link - positioned with responsive margins */}
          <Link
            href="/sports/live"
            className="group text-xs font-semibold hover:bg-white/20 transition-all duration-200 flex items-center space-x-1 xs:space-x-1 sm:space-x-1.5 bg-black/40 backdrop-blur-md rounded-full px-1 xs:px-1.5 sm:px-2 md:px-2.5 py-0.5 xs:py-0.5 sm:py-1 border border-white/20 hover:border-white/30 flex-shrink-0 mr-1 xs:mr-2 sm:mr-0 sm:-mr-4 md:-mr-8 lg:-mr-12 xl:-mr-16 2xl:-mr-20 shadow-lg"
            aria-label="View all live games"
            onClick={() => {
                try {
                  navigator.vibrate(10);
                } catch (e) {
                  // Ignore vibrate errors
                }
              }
            }}
          >
            <span>View All</span>
            <svg
              className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
