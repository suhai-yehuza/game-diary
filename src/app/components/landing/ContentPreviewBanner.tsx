'use client';

import { TrendingUp, Calendar, MessageCircle, Heart, User, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import { useLatestGames } from '@/hooks/use-latest-games';
import { useTopGameLogs } from '@/hooks/use-top-game-logs';
import type { IGameLog } from '@/lib/types';

export function ContentPreviewBanner() {
  const { topGameLogs, loading: gameLogsLoading } = useTopGameLogs({ limit: 10 });
  const { latestGames, loading: gamesLoading } = useLatestGames({
    limit: 10,
    forceRealData: true,
  });

  // Get the most active game log (highest total activity)
  const mostActiveGameLog = useMemo(() => {
    if (!topGameLogs.length) return null;

    return topGameLogs.reduce((mostActive: IGameLog, current: IGameLog) => {
      const currentActivity = (current.totalCommentCount || 0) + (current.totalReactionCount || 0);
      const mostActiveActivity =
        (mostActive.totalCommentCount || 0) + (mostActive.totalReactionCount || 0);

      return currentActivity > mostActiveActivity ? current : mostActive;
    });
  }, [topGameLogs]);

  // Get the latest finished game
  const latestFinishedGame = useMemo(() => {
    if (!latestGames.length) return null;

    const finishedGames = latestGames.filter(
      game => game.status?.short === 'FT' || game.status?.long === 'Finished'
    );

    if (!finishedGames.length) return null;

    // Sort by date and get the most recent
    const sortedGames = finishedGames.sort((a, b) => {
      const dateA = typeof a.date === 'string' ? new Date(a.date) : new Date(a.date.start);
      const dateB = typeof b.date === 'string' ? new Date(b.date) : new Date(b.date.start);
      return dateB.getTime() - dateA.getTime();
    });

    // Debug logging (remove in production)
    console.log(
      'Latest finished games:',
      sortedGames.slice(0, 3).map(game => ({
        id: game.id,
        date: game.date,
        teams: `${game.teams?.visitors?.name} vs ${game.teams?.home?.name}`,
        scores: `${game.scores?.visitors?.points}-${game.scores?.home?.points}`,
        status: game.status,
        arena: game.arena,
      }))
    );

    return sortedGames[0];
  }, [latestGames]);

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

  const formatGameDate = (game: typeof latestFinishedGame) => {
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

  if (gameLogsLoading || gamesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              See What&apos;s Happening
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
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
    <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-950 dark:via-gray-900 dark:to-green-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
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

            {mostActiveGameLog ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                    {mostActiveGameLog.user?.image_url ? (
                      <Image
                        src={mostActiveGameLog.user.image_url}
                        alt={mostActiveGameLog.user.username}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {mostActiveGameLog.user?.username || 'Anonymous'}
                  </span>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {mostActiveGameLog.game?.home_team?.name} vs{' '}
                  {mostActiveGameLog.game?.away_team?.name}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{mostActiveGameLog.totalCommentCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{mostActiveGameLog.totalReactionCount || 0}</span>
                  </div>
                  <span>⭐ {mostActiveGameLog.rating_for_game}/5</span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(mostActiveGameLog.created_at)}
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
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group animate-in bounce-in fade-in duration-600 delay-200 hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-bounce" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Latest Results
              </span>
            </div>

            {latestFinishedGame ? (
              <div className="space-y-2">
                {/* Arena Information */}
                {latestFinishedGame.arena && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">
                      {latestFinishedGame.arena.name}
                      {latestFinishedGame.arena.city && `, ${latestFinishedGame.arena.city}`}
                    </span>
                  </div>
                )}

                {/* Home Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      {latestFinishedGame.teams?.home?.logo ? (
                        <Image
                          src={latestFinishedGame.teams.home.logo}
                          alt={latestFinishedGame.teams.home.name}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {latestFinishedGame.teams?.home?.name?.charAt(0) || 'H'}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {latestFinishedGame.teams?.home?.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {latestFinishedGame.scores?.home?.points || '-'}
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
                      {latestFinishedGame.teams?.visitors?.logo ? (
                        <Image
                          src={latestFinishedGame.teams.visitors.logo}
                          alt={latestFinishedGame.teams.visitors.name}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {latestFinishedGame.teams?.visitors?.name?.charAt(0) || 'A'}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {latestFinishedGame.teams?.visitors?.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {latestFinishedGame.scores?.visitors?.points || '-'}
                  </span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatGameDate(latestFinishedGame)}
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
    </section>
  );
}
