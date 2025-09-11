'use client';

import { Calendar, Heart, MapPin, MessageCircle, TrendingUp, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { IContentPreviewData } from '@/types';

import { ProgressiveDataLoader } from './ProgressiveDataLoader';

// Helper function to format numbers (e.g., 1000 -> 1K)
const formatShort = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to format dates
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

export function ContentPreviewBannerOptimized() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-950 dark:via-gray-900 dark:to-green-950 rounded-2xl p-6">
      <div className="text-center mb-8">
        <p className="text-base sm:text-lg text-gray-600 dark:text-white max-w-2xl mx-auto mb-4 px-4 sm:px-0">
          Join thousands of sports fans sharing their game experiences
        </p>
      </div>

      <ProgressiveDataLoader
        dataKey="contentPreview"
        fallback={
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
        }
      >
        {(data: IContentPreviewData) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Trending Preview */}
            <Link
              href="/protected/dashboard"
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 group animate-in zoom-in-50 fade-in hover:scale-105 hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Trending Now
                </span>
              </div>

              {data.mostActiveGameLog ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                      {data.mostActiveGameLog.user?.image_url ? (
                        <Image
                          src={data.mostActiveGameLog.user.image_url}
                          alt={data.mostActiveGameLog.user.username}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {data.mostActiveGameLog.user?.username || 'Anonymous'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {data.mostActiveGameLog.game?.home_team?.name} vs{' '}
                    {data.mostActiveGameLog.game?.away_team?.name}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    {(parseInt(data.mostActiveGameLog.totalComments) || 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>
                          {formatShort(parseInt(data.mostActiveGameLog.totalComments) || 0)}
                        </span>
                      </div>
                    )}
                    {(parseInt(data.mostActiveGameLog.totalReactions) || 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>
                          {formatShort(parseInt(data.mostActiveGameLog.totalReactions) || 0)}
                        </span>
                      </div>
                    )}
                    <span>⭐ {data.mostActiveGameLog.rating}/5</span>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(data.mostActiveGameLog.created_at)}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  No trending content yet
                </div>
              )}
            </Link>

            {/* Recent Games Preview */}
            <Link
              href="/sports/all-sports"
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group animate-in bounce-in fade-in delay-200 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-bounce" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Latest Results
                </span>
              </div>

              {data.latestFinishedGame ? (
                <div className="space-y-2">
                  {/* Arena Information */}
                  {data.latestFinishedGame.arena && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {data.latestFinishedGame.arena.name}
                        {data.latestFinishedGame.arena.city &&
                          `, ${data.latestFinishedGame.arena.city}`}
                      </span>
                    </div>
                  )}

                  {/* Teams and Score */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {data.latestFinishedGame.teams?.home?.logo && (
                          <Image
                            src={data.latestFinishedGame.teams.home.logo}
                            alt={data.latestFinishedGame.teams.home.name}
                            width={16}
                            height={16}
                            className="rounded-sm"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {data.latestFinishedGame.teams?.home?.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {data.latestFinishedGame.scores?.home?.points || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {data.latestFinishedGame.teams?.visitors?.logo && (
                          <Image
                            src={data.latestFinishedGame.teams.visitors.logo}
                            alt={data.latestFinishedGame.teams.visitors.name}
                            width={16}
                            height={16}
                            className="rounded-sm"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {data.latestFinishedGame.teams?.visitors?.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {data.latestFinishedGame.scores?.visitors?.points || 0}
                      </span>
                    </div>
                  </div>

                  {/* Game Status and Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(data.latestFinishedGame.date)}</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {data.latestFinishedGame.status?.long || 'Final'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-700 dark:text-gray-300">No recent games yet</div>
              )}
            </Link>
          </div>
        )}
      </ProgressiveDataLoader>
    </div>
  );
}
