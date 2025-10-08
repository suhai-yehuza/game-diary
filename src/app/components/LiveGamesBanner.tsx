'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { useBannerVisibility } from '@/hooks/use-banner-visibility';
import { useLiveGames } from '@/hooks/use-live-games';
import { MOCK_LIVE_GAMES } from '@/lib/mock/liveGamesMock';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';
import type { IGameResponse } from '@/types';

/**
 * Determines which games to display based on environment and data availability
 */
function getDisplayGames(realGames: IGameResponse[] | null): IGameResponse[] {
  // If there are real live games, use them
  if (realGames && realGames.length > 0) {
    return realGames;
  }

  // Check if we should show mock games (mock mode or test environment)
  const shouldShowMockGames = isMockModeEnabled() || isTestOrCIEnvironment();

  if (shouldShowMockGames) {
    // Transform external API format to internal format
    return (MOCK_LIVE_GAMES.response || []).map(game => ({
      id: game.id.toString(),
      date:
        typeof game.date === 'string' ? { start: game.date } : { start: game.date?.start || '' },
      home_team: game.teams?.home?.name || '',
      away_team: game.teams?.visitors?.name || '',
      home_score: game.scores?.home?.points || 0,
      away_score: game.scores?.visitors?.points || 0,
      status:
        typeof game.status === 'string'
          ? { short: game.status }
          : { short: game.status?.short || '', long: game.status?.long, clock: game.status?.clock },
      teams: game.teams
        ? {
            home: {
              id: game.teams.home?.id?.toString() || '',
              name: game.teams.home?.name || '',
              nickname: game.teams.home?.nickname || '',
              code: game.teams.home?.code || '',
              logo: game.teams.home?.logo || '',
            },
            visitors: {
              id: game.teams.visitors?.id?.toString() || '',
              name: game.teams.visitors?.name || '',
              nickname: game.teams.visitors?.nickname || '',
              code: game.teams.visitors?.code || '',
              logo: game.teams.visitors?.logo || '',
            },
            away: {
              id: game.teams.visitors?.id?.toString() || '',
              name: game.teams.visitors?.name || '',
              nickname: game.teams.visitors?.nickname || '',
              code: game.teams.visitors?.code || '',
              logo: game.teams.visitors?.logo || '',
            },
          }
        : undefined,
      scores: game.scores
        ? {
            home: {
              points: game.scores.home?.points || 0,
            },
            visitors: {
              points: game.scores.visitors?.points || 0,
            },
          }
        : undefined,
      season: game.season,
      stage: typeof game.stage === 'string' ? parseInt(game.stage) || 0 : game.stage || 0,
      nugget: game.nugget,
      arena: game.arena
        ? {
            name: game.arena.name || '',
            city: game.arena.city || '',
            state: game.arena.state || '',
          }
        : undefined,
      periods: game.periods
        ? {
            current: game.periods.current || 0,
            total: game.periods.total || 0,
          }
        : undefined,
    }));
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
  const displayGames = useMemo(() => {
    const result = getDisplayGames(games);

    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 LiveGamesBanner displayGames:', {
        inputGames: games?.length || 0,
        displayGames: result.length,
        firstGame: result[0]
          ? {
              id: result[0].id,
              homeTeam: result[0].home_team,
              awayTeam: result[0].away_team,
              status: result[0].status,
            }
          : null,
      });
    }

    return result;
  }, [games]);

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
    } else {
      // If we have games, stop loading immediately
      setIsLoading(false);
    }
  }, [displayGames]);

  // Pause animation on hover/touch for better UX
  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  // Haptic feedback for mobile interactions
  const handleGameClick = useCallback(
    (game: IGameResponse) => {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      // Navigate to game detail page
      router.push(`/sports/nba/games/${game.id}`);
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
      className="fixed top-0 left-0 right-0 z-40 text-white py-0.5 xs:py-1 sm:py-1.5 px-1 xs:px-2 sm:px-4 shadow-2xl border-b-4 border-pink-300"
      style={
        {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          // Ensure proper stacking context for WebKit
          transform: 'translateZ(0)',
          willChange: 'transform',
          background: '#dc2626',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
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
          <div className="absolute inset-0 flex items-center justify-center bg-theme-muted/20 backdrop-blur-sm z-20">
            <div className="flex items-center space-x-1 xs:space-x-2 text-xs sm:text-sm">
              <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 border-2 border-text-inverse/30 border-t-text-inverse rounded-full animate-spin" />
              <span>Loading live games...</span>
            </div>
          </div>
        )}

        {/* Live Games Info Panel - Simplified */}
        <div className="flex-shrink-0 mr-2 xs:mr-3 sm:mr-4">
          <div
            className="flex items-center gap-3 px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 rounded-lg cursor-pointer hover:bg-text-inverse/5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-text-inverse/30"
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
                className="w-3 h-3 rounded-full shadow-lg animate-live-dot-glow"
                style={{
                  background: '#00ffff',
                  boxShadow: '0 0 20px #00ffff, 0 0 40px #00ffff',
                }}
              />
              <div
                className="absolute w-3 h-3 rounded-full animate-ping opacity-75"
                style={{
                  background: '#00ffff',
                }}
              />
              <div
                className="absolute inset-0 w-3 h-3 rounded-full blur-sm scale-150"
                style={{
                  background: 'rgba(0, 255, 255, 0.3)',
                }}
              />
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
            className="inline-flex items-center px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 text-xs font-medium text-text-inverse bg-text-inverse/10 hover:bg-text-inverse/20 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-text-inverse/30"
            aria-label="View all live games"
          >
            View All
          </Link>
        </div>

        {/* Scrolling games area - takes up remaining space */}
        <div className="flex-1 overflow-hidden bg-theme-muted/10">
          {displayGames.length === 1 ? (
            // Single game - no animation, just center it
            <div className="flex items-center justify-center h-full">
              {displayGames.map((game: IGameResponse, _index: number) => (
                <React.Fragment key={game.id}>
                  <div
                    data-testid="game"
                    className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 flex-shrink-0 cursor-pointer hover:bg-text-inverse/10 rounded-lg px-1 xs:px-1.5 sm:px-2 py-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-text-inverse/30 focus:ring-offset-2 focus:ring-offset-theme-muted"
                    onClick={() => handleGameClick(game)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleGameClick(game);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${game.teams?.visitors.name} ${game.scores?.visitors.points} at ${game.teams?.home.name} ${game.scores?.home.points}, ${typeof game.status === 'object' ? game.status.short : game.status}`}
                  >
                    {/* Away Team */}
                    <div className="flex items-center space-x-0.5 xs:space-x-0.5 sm:space-x-1">
                      <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 relative">
                        <Image
                          src={game.teams?.visitors?.logo || '/defaults/default-player-logo.svg'}
                          alt={`${game.teams?.visitors.name} logo`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 475px) 8px, (max-width: 640px) 10px, (max-width: 768px) 12px, 12px"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs font-medium">{game.teams?.visitors.code}</span>
                      <span className="text-xs font-bold">{game.scores?.visitors.points}</span>
                    </div>

                    {/* @ */}
                    <span className="text-xs text-text-inverse/80">@</span>

                    {/* Home Team */}
                    <div className="flex items-center space-x-0.5 xs:space-x-0.5 sm:space-x-1">
                      <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 relative">
                        <Image
                          src={game.teams?.home?.logo || '/defaults/default-player-logo.svg'}
                          alt={`${game.teams?.home.name} logo`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 475px) 8px, (max-width: 640px) 10px, (max-width: 768px) 12px, 12px"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs font-medium">{game.teams?.home.code}</span>
                      <span className="text-xs font-bold">{game.scores?.home.points}</span>
                    </div>

                    {/* Game Status */}
                    {(typeof game.status === 'object' ? game.status.clock : null) && (
                      <span className="text-xs text-gray-200 ml-0.5 xs:ml-1 sm:ml-2">
                        {typeof game.status === 'object' ? game.status.clock : null}
                      </span>
                    )}
                    {/* Quarter */}
                    <span className="text-xs text-gray-200 ml-0.5 xs:ml-0.5 sm:ml-1">
                      {typeof game.status === 'object' ? game.status.short : game.status}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            // Multiple games - use scrolling animation
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
                    className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 flex-shrink-0 cursor-pointer hover:bg-text-inverse/10 rounded-lg px-1 xs:px-1.5 sm:px-2 py-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-text-inverse/30 focus:ring-offset-2 focus:ring-offset-theme-muted"
                    onClick={() => handleGameClick(game)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleGameClick(game);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${game.teams?.visitors.name} ${game.scores?.visitors.points} at ${game.teams?.home.name} ${game.scores?.home.points}, ${typeof game.status === 'object' ? game.status.short : game.status}`}
                  >
                    {/* Away Team */}
                    <div className="flex items-center space-x-0.5 xs:space-x-0.5 sm:space-x-1">
                      <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 relative">
                        <Image
                          src={game.teams?.visitors?.logo || '/defaults/default-player-logo.svg'}
                          alt={`${game.teams?.visitors.name} logo`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 475px) 8px, (max-width: 640px) 10px, (max-width: 768px) 12px, 12px"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs font-medium">{game.teams?.visitors.code}</span>
                      <span className="text-xs font-bold">{game.scores?.visitors.points}</span>
                    </div>

                    {/* @ */}
                    <span className="text-xs text-text-inverse/80">@</span>

                    {/* Home Team */}
                    <div className="flex items-center space-x-0.5 xs:space-x-0.5 sm:space-x-1">
                      <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 relative">
                        <Image
                          src={game.teams?.home?.logo || '/defaults/default-player-logo.svg'}
                          alt={`${game.teams?.home.name} logo`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 475px) 8px, (max-width: 640px) 10px, (max-width: 768px) 12px, 12px"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs font-medium">{game.teams?.home.code}</span>
                      <span className="text-xs font-bold">{game.scores?.home.points}</span>
                    </div>

                    {/* Game Status */}
                    {(typeof game.status === 'object' ? game.status.clock : null) && (
                      <span className="text-xs text-gray-200 ml-0.5 xs:ml-1 sm:ml-2">
                        {typeof game.status === 'object' ? game.status.clock : null}
                      </span>
                    )}
                    {/* Quarter */}
                    <span className="text-xs text-gray-200 ml-0.5 xs:ml-0.5 sm:ml-1">
                      {typeof game.status === 'object' ? game.status.short : game.status}
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
                    className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 flex-shrink-0 cursor-pointer hover:bg-text-inverse/10 rounded-lg px-1 xs:px-1.5 sm:px-2 py-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-text-inverse/30 focus:ring-offset-2 focus:ring-offset-theme-muted"
                    onClick={() => handleGameClick(game)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleGameClick(game);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${game.teams?.visitors.name} ${game.scores?.visitors.points} at ${game.teams?.home.name} ${game.scores?.home.points}, ${typeof game.status === 'object' ? game.status.short : game.status}`}
                  >
                    {/* Away Team */}
                    <div className="flex items-center space-x-0.5 xs:space-x-0.5 sm:space-x-1">
                      <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 relative">
                        <Image
                          src={game.teams?.visitors?.logo || '/defaults/default-player-logo.svg'}
                          alt={`${game.teams?.visitors.name} logo`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 475px) 8px, (max-width: 640px) 10px, (max-width: 768px) 12px, 12px"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs font-medium">{game.teams?.visitors.code}</span>
                      <span className="text-xs font-bold">{game.scores?.visitors.points}</span>
                    </div>

                    {/* @ */}
                    <span className="text-xs text-text-inverse/80">@</span>

                    {/* Home Team */}
                    <div className="flex items-center space-x-0.5 xs:space-x-0.5 sm:space-x-1">
                      <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 relative">
                        <Image
                          src={game.teams?.home?.logo || '/defaults/default-player-logo.svg'}
                          alt={`${game.teams?.home.name} logo`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 475px) 8px, (max-width: 640px) 10px, (max-width: 768px) 12px, 12px"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs font-medium">{game.teams?.home.code}</span>
                      <span className="text-xs font-bold">{game.scores?.home.points}</span>
                    </div>

                    {/* Game Status */}
                    {(typeof game.status === 'object' ? game.status.clock : null) && (
                      <span className="text-xs text-gray-200 ml-0.5 xs:ml-1 sm:ml-2">
                        {typeof game.status === 'object' ? game.status.clock : null}
                      </span>
                    )}
                    {/* Quarter */}
                    <span className="text-xs text-gray-200 ml-0.5 xs:ml-0.5 sm:ml-1">
                      {typeof game.status === 'object' ? game.status.short : game.status}
                    </span>
                  </div>
                </React.Fragment>
              ))}
              {/* End padding for continuous scroll */}
              <div className="w-[50vw]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
