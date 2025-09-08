'use client';

import { MessageCircle, Heart, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useLandingPageData } from '@/hooks/use-landing-page-data';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import type { GameLog } from '@/types';

export function IntegratedGameLogs() {
  const { data, loading, error } = useLandingPageData();
  const { containerRef, contentRef, handleMouseEnter, handleMouseLeave } = useScrollAnimation({
    speed: 15, // Desktop speed
    mobileSpeed: 8, // Mobile speed - slower for better readability
    pauseOnHover: true,
    autoStart: true,
  });

  // Extract trending game logs from cached data
  const topGameLogs = (data?.trendingContent?.topGameLogs || []) as GameLog[];

  if (loading) {
    return (
      <div className="space-y-3 flex flex-col h-full">
        {Array.from({ length: 5 }, (_, i) => `skeleton-${i}-${Date.now()}`).map(uniqueId => (
          <div key={uniqueId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-3" />
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16" />
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20" />
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-18" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !topGameLogs.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 mb-4">No trending game logs available</div>
        <Link
          href="/protected/user"
          className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Create Your First Log
        </Link>
      </div>
    );
  }

  // Show top 5 trending game logs
  const displayGameLogs = topGameLogs.slice(0, 5);

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

  const formatShort = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-3 flex flex-col h-full">
      {/* Trending Game Logs List with Scroll Animation */}
      <div
        ref={containerRef}
        className="h-[42rem] overflow-auto relative scroll-container animate-scroll"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={contentRef} className="space-y-3 scroll-content">
          {displayGameLogs.map((gameLog, index) => {
            const totalActivity =
              (gameLog.totalCommentCount || 0) + (gameLog.totalReactionCount || 0);

            return (
              <div
                key={`trending-${String(gameLog.id)}`}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {/* Game Log Header with Rank and Activity */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <div
                      className={`text-sm font-medium flex items-center gap-1 ${getActivityColor(totalActivity)}`}
                    >
                      <div className="w-2 h-2 bg-current rounded-full" />
                      {formatShort(totalActivity)} activity
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(gameLog.created_at)}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                    {gameLog.user?.image_url ? (
                      <Image
                        src={gameLog.user.image_url}
                        alt={gameLog.user.username}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {gameLog.user?.username || 'Anonymous'}
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        {gameLog.game?.home_team?.logo ? (
                          <Image
                            src={gameLog.game.home_team.logo}
                            alt={gameLog.game.home_team.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {gameLog.game?.home_team?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {gameLog.game?.home_team?.name}
                      </span>
                      <span className="text-gray-500 text-sm">vs</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {gameLog.game?.away_team?.name}
                      </span>
                      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        {gameLog.game?.away_team?.logo ? (
                          <Image
                            src={gameLog.game.away_team.logo}
                            alt={gameLog.game.away_team.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                            style={{ width: 'auto', height: 'auto' }}
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {gameLog.game?.away_team?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Rating: {gameLog.rating_for_game}/5 ⭐</span>
                    <span>{gameLog.watched_setting}</span>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{formatShort(gameLog.totalCommentCount || 0)} comments</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{formatShort(gameLog.totalReactionCount || 0)} reactions</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View All Button */}
      <div className="mt-auto pt-4">
        <Link
          href="/protected/user"
          className="block w-full text-center py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
        >
          View All Game Logs
        </Link>
      </div>
    </div>
  );
}
