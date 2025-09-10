'use client';

import { Calendar, Clock, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useBannerVisibility } from '@/hooks/use-banner-visibility';
import { useLiveGames } from '@/hooks/use-live-games';

export function FloatingGamesDisplay() {
  const { games: liveGames, loading, error } = useLiveGames();
  const { bannerHeight } = useBannerVisibility();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Handle responsive breakpoints
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
      setIsMediumScreen(window.innerWidth >= 640);
      setIsSmallScreen(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-cycle through games every 4 seconds
  useEffect(() => {
    if (liveGames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % liveGames.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [liveGames]);

  // Pause cycling on hover
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (liveGames.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % liveGames.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [liveGames, isPaused]);

  if (loading) {
    return (
      <div
        className="fixed right-4 sm:right-6 md:right-8 w-80 h-14 sm:w-96 md:w-[420px] sm:h-16 md:h-18 animate-in slide-in-from-right-8 fade-in duration-700 delay-300 group z-50"
        style={{ top: `${bannerHeight + 8}px` }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Latest Games</h3>
          </div>
        </div>
        <div className="p-6 animate-pulse">
          <div className="space-y-3">
            {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map(key => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Debug: Always show component for testing
  if (error) {
    console.error('FloatingGamesDisplay error:', error);
  }

  if (!liveGames.length) {
    // Show a placeholder when no live games
    return (
      <div
        className="fixed right-4 sm:right-6 md:right-8 w-80 h-14 sm:w-96 md:w-[420px] sm:h-16 md:h-18 animate-in slide-in-from-right-8 fade-in duration-700 delay-300 group z-50"
        style={{ top: `${bannerHeight + 8}px` }}
      >
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-1 sm:p-1.5 text-white transition-all duration-300 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold leading-tight">0 Live Games</span>
                <span className="text-xs opacity-75 leading-tight">No games live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentGame = liveGames[currentIndex];

  const formatGameDate = (game: typeof currentGame) => {
    const dateString = typeof game.date === 'string' ? game.date : game.date.start;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatGameTime = (game: typeof currentGame) => {
    const dateString = typeof game.date === 'string' ? game.date : game.date.start;
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'live':
        return 'text-red-600 dark:text-red-400';
      case 'finished':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'live':
        return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
      case 'finished':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <>
      {/* Mobile version - stacked below game logs */}
      <div
        className={`fixed left-2 right-2 w-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-top-8 fade-in duration-700 delay-300 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 group sm:hidden floating-component-secondary ${
          isSmallScreen ? 'h-64' : 'h-56'
        }`}
        style={{
          top: `${bannerHeight + (isSmallScreen ? 96 : 80) + (isSmallScreen ? 320 : 288) + (isSmallScreen ? 24 : 20)}px`,
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <h3 className="text-base font-semibold">Latest Games</h3>
            </div>
            <span className="text-xs opacity-90">
              {currentIndex + 1}/{liveGames.length}
            </span>
          </div>
        </div>

        {/* Mobile Game Display */}
        <div className="p-3 flex flex-col h-full">
          <div className="relative overflow-hidden flex-1">
            <div
              key={currentIndex}
              className="transition-all duration-500 ease-in-out transform"
              style={{
                animation: 'slideInRight 0.5s ease-out',
              }}
            >
              {/* Simplified mobile content */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    {currentGame.teams?.home?.logo ? (
                      <Image
                        src={currentGame.teams.home.logo}
                        alt={currentGame.teams.home.name}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {currentGame.teams?.home?.name?.charAt(0) || 'H'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-xs break-words leading-tight">
                      {currentGame.teams?.home?.name || 'Home Team'}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentGame.scores?.home?.points || '-'}
                    </div>
                  </div>
                </div>

                <div className="text-center mx-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">VS</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {formatGameDate(currentGame).split(',')[0]}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-gray-900 dark:text-white text-xs break-words leading-tight">
                      {currentGame.teams?.visitors?.name || 'Away Team'}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentGame.scores?.visitors?.points || '-'}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    {currentGame.teams?.visitors?.logo ? (
                      <Image
                        src={currentGame.teams.visitors.logo}
                        alt={currentGame.teams.visitors.name}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {currentGame.teams?.visitors?.name?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() =>
                    setCurrentIndex(prev => (prev - 1 + liveGames.length) % liveGames.length)
                  }
                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={liveGames.length <= 1}
                >
                  <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>

                <div className="flex gap-1 justify-center flex-1 mx-2">
                  {liveGames.slice(0, 4).map((game, index: number) => (
                    <button
                      key={`mobile-game-dot-${game.id}`}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentIndex(prev => (prev + 1) % liveGames.length)}
                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={liveGames.length <= 1}
                >
                  <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Mobile View All Button */}
              <Link
                href="/sports/all-sports"
                className="block w-full text-center py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                View All Games
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop version - replaces banner at top */}
      <div
        className="fixed top-0 left-0 right-0 w-full h-14 sm:h-16 md:h-18 bg-gradient-to-r from-gray-900 to-blue-900 animate-in slide-in-from-top-8 fade-in duration-700 delay-300 group z-[60] shadow-lg"
        style={{ top: '0px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1 sm:p-1.5 text-white group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            {/* Live Status with Pulse */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <div className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold leading-tight">
                  {liveGames.length} Live Games
                </span>
                <span className="text-xs opacity-75 leading-tight">
                  <span className="hidden sm:inline">Last Updated at</span>
                  <span className="sm:hidden">Updated at</span>{' '}
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Game Counter */}
            <div className="text-right">
              <span className="text-xs opacity-75 block leading-none">
                Game {currentIndex + 1} of {liveGames.length}
              </span>
              <span className="text-xs opacity-60 z-50 leading-none mt-0.5">Live Now</span>
            </div>
          </div>
        </div>

        {/* Game Display */}
        <div className="px-3 pt-3 pb-1 sm:px-4 sm:pt-4 sm:pb-2 flex flex-col h-full">
          <div className="relative overflow-hidden">
            <div
              key={currentIndex}
              className="transition-all duration-500 ease-in-out transform"
              style={{
                animation: 'slideInRight 0.5s ease-out',
              }}
            >
              {/* Arena Info */}
              {currentGame.arena && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          🏟️
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {currentGame.arena.name}
                      </span>
                    </div>
                    {currentGame.arena.city && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 z-50">
                        {currentGame.arena.city}
                        {currentGame.arena.state && `, ${currentGame.arena.state}`}
                      </span>
                    )}
                  </div>
                  {(currentGame.arena as { country?: string })?.country && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 z-50">
                      {(currentGame.arena as { country?: string })?.country}
                    </div>
                  )}
                </div>
              )}

              {/* Team Logos and Scores */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    {currentGame.teams?.home?.logo ? (
                      <Image
                        src={currentGame.teams.home.logo}
                        alt={currentGame.teams.home.name}
                        width={isLargeScreen ? 24 : isMediumScreen ? 20 : 16}
                        height={isLargeScreen ? 24 : isMediumScreen ? 20 : 16}
                        className="rounded-full"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {currentGame.teams?.home?.name?.charAt(0) || 'H'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                      {currentGame.teams?.home?.name || 'Home Team'}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {currentGame.scores?.home?.points || '-'}
                    </div>
                  </div>
                </div>

                <div className="text-center mx-2 sm:mx-3 flex-shrink-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">VS</div>
                  <div
                    className={`text-xs font-medium flex items-center gap-1 justify-center ${getStatusColor(typeof currentGame.status === 'string' ? currentGame.status : currentGame.status?.short || 'scheduled')}`}
                  >
                    {getStatusIcon(
                      typeof currentGame.status === 'string'
                        ? currentGame.status
                        : currentGame.status?.short || 'scheduled'
                    )}
                    <span className="hidden sm:inline">
                      {typeof currentGame.status === 'string'
                        ? currentGame.status
                        : currentGame.status?.short || 'scheduled'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end min-w-0">
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                      {currentGame.teams?.visitors?.name || 'Away Team'}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {currentGame.scores?.visitors?.points || '-'}
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    {currentGame.teams?.visitors?.logo ? (
                      <Image
                        src={currentGame.teams.visitors.logo}
                        alt={currentGame.teams.visitors.name}
                        width={isLargeScreen ? 24 : isMediumScreen ? 20 : 16}
                        height={isLargeScreen ? 24 : isMediumScreen ? 20 : 16}
                        className="rounded-full"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {currentGame.teams?.visitors?.name?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Game Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className="hidden sm:inline">{formatGameDate(currentGame)}</span>
                  <span className="sm:hidden">{formatGameDate(currentGame).split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatGameTime(currentGame)}
                </div>
              </div>

              {/* Game Progress */}
              {(() => {
                const isLive =
                  typeof currentGame.status === 'string'
                    ? currentGame.status.toLowerCase() === 'live'
                    : currentGame.status?.short && typeof currentGame.status.short === 'string'
                      ? currentGame.status.short.toLowerCase() === 'live'
                      : false;

                return (
                  isLive &&
                  currentGame.periods && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-3 border border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-red-700 dark:text-red-300">
                            LIVE - Q{currentGame.periods.current}
                          </span>
                        </div>
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {currentGame.periods.total} periods
                        </span>
                      </div>
                      {(currentGame.periods as { endOfPeriod?: boolean })?.endOfPeriod && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          End of period
                        </div>
                      )}
                    </div>
                  )
                );
              })()}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mb-12">
                <button
                  onClick={() =>
                    setCurrentIndex(prev => (prev - 1 + liveGames.length) % liveGames.length)
                  }
                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={liveGames.length <= 1}
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>

                <div className="flex gap-1 flex-wrap justify-center flex-1 mx-2">
                  {liveGames
                    .slice(0, isLargeScreen ? 8 : isMediumScreen ? 6 : 4)
                    .map((game, index: number) => (
                      <button
                        key={`game-navigation-dot-${game.id}`}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  {liveGames.length > (isLargeScreen ? 8 : isMediumScreen ? 6 : 4) && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 hidden sm:inline">
                      +{liveGames.length - (isLargeScreen ? 8 : isMediumScreen ? 6 : 4)} more
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setCurrentIndex(prev => (prev + 1) % liveGames.length)}
                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={liveGames.length <= 1}
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* View All Button */}
              <Link
                href="/sports/all-sports"
                className="block w-full text-center py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                View All Games
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
