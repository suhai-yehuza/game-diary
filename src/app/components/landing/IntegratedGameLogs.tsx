'use client';

import { MessageCircle, Heart, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useTopGameLogs } from '@/hooks/use-top-game-logs';
import { API_LIMITS } from '@/lib/constants';
import type { IGameLog as _IGameLog } from '@/lib/types';

export function IntegratedGameLogs() {
  const { topGameLogs, loading, error } = useTopGameLogs({ limit: API_LIMITS.GAME_LOGS.LARGE });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle through game logs every 5 seconds
  useEffect(() => {
    if (topGameLogs.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % topGameLogs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [topGameLogs.length, isPaused]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => `skeleton-${i}-${Date.now()}`).map(uniqueId => (
          <div key={uniqueId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full" />
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

  return (
    <div className="space-y-4">
      {/* Featured Game Log */}
      <div
        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Controls */}
        {topGameLogs.length > 1 && (
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={() =>
                setCurrentIndex(prev => (prev - 1 + topGameLogs.length) % topGameLogs.length)
              }
              className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              aria-label="Previous game log"
            >
              <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % topGameLogs.length)}
              className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              aria-label="Next game log"
            >
              <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
            {currentGameLog.user?.image_url ? (
              <Image
                src={currentGameLog.user.image_url}
                alt={currentGameLog.user.username}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-white">
              {currentGameLog.user?.username || 'Anonymous'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(currentGameLog.created_at)}
            </div>
          </div>
          <div
            className={`text-sm font-medium flex items-center gap-1 ${getActivityColor(totalActivity)}`}
          >
            <div className="w-2 h-2 bg-current rounded-full" />
            {totalActivity} activity
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                {currentGameLog.game?.home_team?.logo ? (
                  <Image
                    src={currentGameLog.game.home_team.logo}
                    alt={currentGameLog.game.home_team.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {currentGameLog.game?.home_team?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {currentGameLog.game?.home_team?.name}
              </span>
              <span className="text-gray-500">vs</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currentGameLog.game?.away_team?.name}
              </span>
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                {currentGameLog.game?.away_team?.logo ? (
                  <Image
                    src={currentGameLog.game.away_team.logo}
                    alt={currentGameLog.game.away_team.name}
                    width={24}
                    height={24}
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
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Rating: {currentGameLog.rating_for_game}/5 ⭐</span>
            <span>{currentGameLog.watched_setting}</span>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{currentGameLog.totalCommentCount || 0} comments</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{currentGameLog.totalReactionCount || 0} reactions</span>
          </div>
        </div>

        {/* Progress Indicators */}
        {topGameLogs.length > 1 && (
          <div className="flex gap-1 justify-center mt-3">
            {topGameLogs.slice(0, 5).map((gameLog: _IGameLog, index: number) => (
              <button
                key={`gamelog-${gameLog.id}`}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to game log ${index + 1}`}
              />
            ))}
            {topGameLogs.length > 5 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                +{topGameLogs.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* View All Button */}
      <Link
        href="/protected/user"
        className="block w-full text-center py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
      >
        Explore Game Logs
      </Link>
    </div>
  );
}
