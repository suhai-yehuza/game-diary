'use client';

import { TrendingUp, Calendar, MessageCircle, Heart, User, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import { useLandingPageData } from '@/hooks/use-landing-page-data';
import type { ITrendingGameLog, IRecentGame } from '@/types';

export function ContentPreviewBanner() {
  const { data, loading, error: _error } = useLandingPageData();

  // Extract data from cached response
  const { trendingContent, latestResults } = data || {};
  const { topGameLogs = [], mostActiveGameLog = null } = trendingContent || {};
  const { latestGames = [], latestFinishedGame = null } = latestResults || {};

  // Type assertions for proper typing
  const typedTopGameLogs = topGameLogs;

  // Get the most active game log (highest total activity)
  const mostActiveGameLogProcessed = useMemo(() => {
    if (!typedTopGameLogs.length) return null;

    return typedTopGameLogs.reduce((mostActive: ITrendingGameLog, current: ITrendingGameLog) => {
      const currentActivity = (current.totalCommentCount || 0) + (current.totalReactionCount || 0);
      const mostActiveActivity =
        (mostActive.totalCommentCount || 0) + (mostActive.totalReactionCount || 0);

      return currentActivity > mostActiveActivity ? current : mostActive;
    });
  }, [typedTopGameLogs]);

  // Use cached data if available, fallback to processed data
  const finalMostActiveGameLog = mostActiveGameLog || mostActiveGameLogProcessed;
  const finalLatestFinishedGame =
    latestFinishedGame || (latestGames.length > 0 ? latestGames[0] : null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const formatGameDate = (game: IRecentGame | null) => {
    if (!game) return '';
    const dateString = typeof game.date === 'string' ? game.date : game.date.start;
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-neutral-200/50 dark:border-neutral-700/50">
          <div className="text-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              See What&apos;s Happening
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Join thousands of sports fans sharing their game experiences
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full" />
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-950 dark:via-gray-900 dark:to-green-950 rounded-2xl p-6">
      <div className="text-center mb-8">
        <p className="text-base sm:text-lg text-gray-600 dark:text-white max-w-2xl mx-auto mb-4 px-4 sm:px-0">
          Join thousands of sports fans sharing their game experiences
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Trending Preview */}
        <Link
          href="/protected/user"
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 group animate-in zoom-in-50 fade-in duration-500 hover:scale-105 hover:shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Trending Now
            </span>
          </div>

          {finalMostActiveGameLog ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                  {finalMostActiveGameLog.user?.image_url ? (
                    <Image
                      src={finalMostActiveGameLog.user.image_url}
                      alt={finalMostActiveGameLog.user.username}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {finalMostActiveGameLog.user?.username || 'Anonymous'}
                </span>
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300">
                {finalMostActiveGameLog.game?.home_team?.name} vs{' '}
                {finalMostActiveGameLog.game?.away_team?.name}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{formatShort(finalMostActiveGameLog.totalCommentCount || 0)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{formatShort(finalMostActiveGameLog.totalReactionCount || 0)}</span>
                </div>
                <span>⭐ {finalMostActiveGameLog.rating_for_game}/5</span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(finalMostActiveGameLog.created_at)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-300">No trending content yet</div>
          )}
        </Link>

        {/* Recent Games Preview */}
        <Link
          href="/sports/all-sports"
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group animate-in bounce-in fade-in duration-600 delay-200 hover:scale-105 hover:shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-bounce" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Latest Results
            </span>
          </div>

          {finalLatestFinishedGame ? (
            <div className="space-y-2">
              {/* Arena Information */}
              {finalLatestFinishedGame.arena && (
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">
                    {finalLatestFinishedGame.arena.name}
                    {finalLatestFinishedGame.arena.city &&
                      `, ${finalLatestFinishedGame.arena.city}`}
                  </span>
                </div>
              )}

              {/* Home Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {finalLatestFinishedGame.teams?.home?.logo ? (
                      <Image
                        src={finalLatestFinishedGame.teams.home.logo}
                        alt={finalLatestFinishedGame.teams.home.name}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {finalLatestFinishedGame.teams?.home?.name?.charAt(0) || 'H'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {finalLatestFinishedGame.teams?.home?.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {finalLatestFinishedGame.scores?.home?.points || '-'}
                </span>
              </div>

              {/* Game Status */}
              <div className="text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Final</span>
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {finalLatestFinishedGame.teams?.visitors?.logo ? (
                      <Image
                        src={finalLatestFinishedGame.teams.visitors.logo}
                        alt={finalLatestFinishedGame.teams.visitors.name}
                        width={16}
                        height={16}
                        className="rounded-full"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {finalLatestFinishedGame.teams?.visitors?.name?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {finalLatestFinishedGame.teams?.visitors?.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {finalLatestFinishedGame.scores?.visitors?.points || '-'}
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatGameDate(finalLatestFinishedGame)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              No recent games available
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
