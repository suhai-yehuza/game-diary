'use client';

import { MessageCircle, Heart, TrendingUp, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useBannerVisibility } from '@/hooks/use-banner-visibility';
import { useOptimizedLandingPageData } from '@/hooks/use-landing-page-data';
import { API_LIMITS } from '@/lib/constants';
import type { ITrendingGameLog } from '@/types';

export function FloatingTopGameLogs() {
  const { data, loading, error } = useOptimizedLandingPageData({
    limit: API_LIMITS.GAME_LOGS.LARGE,
  });
  const topGameLogs = data?.trendingContent?.topGameLogs || [];
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

  // Auto-cycle through game logs every 5 seconds
  useEffect(() => {
    if (topGameLogs.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % topGameLogs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [topGameLogs.length]);

  // Pause cycling on hover
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (topGameLogs.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % topGameLogs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [topGameLogs.length, isPaused]);

  if (loading) {
    return (
      <div
        className="fixed left-1 sm:left-2 md:left-4 w-72 h-72 sm:w-80 md:w-96 lg:w-[420px] sm:h-80 lg:h-[380px] bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-left-8 fade-in duration-700 delay-500 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 group hidden sm:block"
        style={{ top: `${bannerHeight + (isLargeScreen ? 120 : isMediumScreen ? 96 : 80)}px` }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Trending Game Logs</h3>
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

  if (error || !topGameLogs.length) {
    return null;
  }

  const currentGameLog = topGameLogs[currentIndex];
  const totalActivity =
    (currentGameLog.totalCommentCount || 0) + (currentGameLog.totalReactionCount || 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityColor = (activity: number) => {
    if (activity >= 50) return 'text-red-600 dark:text-red-400';
    if (activity >= 20) return 'text-orange-600 dark:text-orange-400';
    if (activity >= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getActivityIcon = (activity: number) => {
    if (activity >= 50) return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
    if (activity >= 20) return <div className="w-2 h-2 bg-orange-500 rounded-full" />;
    if (activity >= 10) return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
    return <div className="w-2 h-2 bg-green-500 rounded-full" />;
  };

  return (
    <>
      {/* Mobile version - stacked above games */}
      <div
        className={`fixed left-2 right-2 w-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-top-8 fade-in duration-700 delay-500 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 group sm:hidden floating-component ${
          isSmallScreen ? 'h-80' : 'h-72'
        }`}
        style={{
          top: `${bannerHeight + (isSmallScreen ? 96 : 80)}px`,
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 text-white group-hover:from-green-700 group-hover:to-emerald-700 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <h3 className="text-base font-semibold">Trending Game Logs</h3>
            </div>
            <span className="text-xs opacity-90">
              {currentIndex + 1}/{topGameLogs.length}
            </span>
          </div>
        </div>

        {/* Mobile Game Log Display */}
        <div className="p-3 flex flex-col h-full">
          <div className="relative overflow-hidden flex-1">
            <div
              key={currentIndex}
              className="transition-all duration-500 ease-in-out transform"
              style={{
                animation: 'slideInLeft 0.5s ease-out',
              }}
            >
              {/* User Info */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {currentGameLog.user?.image_url ? (
                    <Image
                      src={currentGameLog.user.image_url}
                      alt={currentGameLog.user.username}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                    {currentGameLog.user?.username || 'Anonymous'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(currentGameLog.created_at)}
                  </div>
                </div>
                <div
                  className={`text-xs font-medium flex items-center gap-1 ${getActivityColor(totalActivity)}`}
                >
                  {getActivityIcon(totalActivity)}
                  {totalActivity}
                </div>
              </div>

              {/* Game Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      {currentGameLog.game?.home_team?.logo ? (
                        <Image
                          src={currentGameLog.game.home_team.logo}
                          alt={currentGameLog.game.home_team.name}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {currentGameLog.game?.home_team?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {currentGameLog.game?.home_team?.name}
                    </span>
                    <span className="text-xs text-gray-500">vs</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {currentGameLog.game?.away_team?.name}
                    </span>
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      {currentGameLog.game?.away_team?.logo ? (
                        <Image
                          src={currentGameLog.game.away_team.logo}
                          alt={currentGameLog.game.away_team.name}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {currentGameLog.game?.away_team?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Rating: {currentGameLog.rating_for_game}/5
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() =>
                    setCurrentIndex(prev => (prev - 1 + topGameLogs.length) % topGameLogs.length)
                  }
                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={topGameLogs.length <= 1}
                >
                  <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>

                <div className="flex gap-1 justify-center flex-1 mx-2">
                  {topGameLogs.slice(0, 4).map((log: ITrendingGameLog, index: number) => (
                    <button
                      key={`mobile-log-dot-${log.id}`}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentIndex(prev => (prev + 1) % topGameLogs.length)}
                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={topGameLogs.length <= 1}
                >
                  <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Mobile View All Button */}
              <Link
                href="/protected/dashboard"
                className="block w-full text-center py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-xs font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
              >
                View All Game Logs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop version - side by side */}
      <div
        className="fixed left-1 sm:left-2 md:left-4 w-72 h-72 sm:w-80 md:w-96 lg:w-[420px] sm:h-80 lg:h-[380px] bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-left-8 fade-in duration-700 delay-500 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 group hidden sm:block"
        style={{ top: `${bannerHeight + (isLargeScreen ? 120 : isMediumScreen ? 96 : 80)}px` }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 sm:p-4 text-white group-hover:from-green-700 group-hover:to-emerald-700 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <h3 className="text-base sm:text-lg font-semibold">Trending Game Logs</h3>
            </div>
            <span className="text-xs sm:text-sm opacity-90 hidden sm:block">
              {currentIndex + 1} of {topGameLogs.length} • Top Activity
            </span>
            <span className="text-xs opacity-90 sm:hidden">
              {currentIndex + 1}/{topGameLogs.length}
            </span>
          </div>
        </div>

        {/* Game Log Display */}
        <div className="px-3 pt-3 pb-1 sm:px-4 sm:pt-4 sm:pb-2 flex flex-col h-full">
          <div className="relative overflow-hidden">
            <div
              key={currentIndex}
              className="transition-all duration-500 ease-in-out transform"
              style={{
                animation: 'slideInLeft 0.5s ease-out',
              }}
            >
              {/* User Info */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {currentGameLog.user?.image_url ? (
                    <Image
                      src={currentGameLog.user.image_url}
                      alt={currentGameLog.user.username}
                      width={isLargeScreen ? 40 : isMediumScreen ? 32 : 24}
                      height={isLargeScreen ? 40 : isMediumScreen ? 32 : 24}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                    {currentGameLog.user?.username || 'Anonymous'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(currentGameLog.created_at)}
                  </div>
                </div>
                <div
                  className={`text-xs font-medium flex items-center gap-1 ${getActivityColor(totalActivity)} hidden sm:flex`}
                >
                  {getActivityIcon(totalActivity)}
                  {totalActivity} activity
                </div>
              </div>

              {/* Game Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      {currentGameLog.game?.home_team?.logo ? (
                        <Image
                          src={currentGameLog.game.home_team.logo}
                          alt={currentGameLog.game.home_team.name}
                          width={isLargeScreen ? 24 : isMediumScreen ? 20 : 16}
                          height={isLargeScreen ? 24 : isMediumScreen ? 20 : 16}
                          className="rounded-full"
                          style={{ width: 'auto', height: 'auto' }}
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {currentGameLog.game?.home_team?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words leading-tight">
                      {currentGameLog.game?.home_team?.name}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">vs</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words leading-tight">
                      {currentGameLog.game?.away_team?.name}
                    </span>
                    <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      {currentGameLog.game?.away_team?.logo ? (
                        <Image
                          src={currentGameLog.game.away_team.logo}
                          alt={currentGameLog.game.away_team.name}
                          width={isLargeScreen ? 24 : isMediumScreen ? 20 : 16}
                          height={isLargeScreen ? 24 : isMediumScreen ? 20 : 16}
                          className="rounded-full"
                          style={{ width: 'auto', height: 'auto' }}
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {currentGameLog.game?.away_team?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="hidden sm:inline">
                    Rating: {currentGameLog.rating_for_game}/5 ⭐
                  </span>
                  <span className="sm:hidden">{currentGameLog.rating_for_game}/5 ⭐</span>
                  <span className="hidden sm:inline">{currentGameLog.watched_setting}</span>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 sm:gap-4">
                  {(currentGameLog.totalCommentCount || 0) > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <MessageCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">
                        {currentGameLog.totalCommentCount || 0} comments
                      </span>
                      <span className="sm:hidden">{currentGameLog.totalCommentCount || 0}</span>
                    </div>
                  )}
                  {(currentGameLog.totalReactionCount || 0) > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Heart className="w-3 h-3" />
                      <span className="hidden sm:inline">
                        {currentGameLog.totalReactionCount || 0} reactions
                      </span>
                      <span className="sm:hidden">{currentGameLog.totalReactionCount || 0}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mb-12">
                <button
                  onClick={() =>
                    setCurrentIndex(prev => (prev - 1 + topGameLogs.length) % topGameLogs.length)
                  }
                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={topGameLogs.length <= 1}
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>

                <div className="flex gap-1 flex-wrap justify-center flex-1 mx-2">
                  {topGameLogs
                    .slice(0, isLargeScreen ? 10 : isMediumScreen ? 8 : 6)
                    .map((gameLog: ITrendingGameLog, index: number) => (
                      <button
                        key={`log-navigation-dot-${gameLog.id}`}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  {topGameLogs.length > (isLargeScreen ? 10 : isMediumScreen ? 8 : 6) && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 hidden sm:inline">
                      +{topGameLogs.length - (isLargeScreen ? 10 : isMediumScreen ? 8 : 6)} more
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setCurrentIndex(prev => (prev + 1) % topGameLogs.length)}
                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  disabled={topGameLogs.length <= 1}
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* View All Button */}
              <Link
                href="/protected/dashboard"
                className="block w-full text-center py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
              >
                Explore Game Logs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
