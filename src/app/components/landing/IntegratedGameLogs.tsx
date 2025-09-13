'use client';

import { MessageCircle, Heart, User, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import type { IIntegratedGameLogsProps } from '@/types';

export function IntegratedGameLogs({ data }: IIntegratedGameLogsProps) {
  const loading = !data;
  const error = null; // No error handling needed for server-side data
  const { containerRef, contentRef, handleMouseEnter, handleMouseLeave } = useScrollAnimation({
    speed: 4, // Desktop speed - slowed down
    mobileSpeed: 2, // Mobile speed - slower for better readability
    pauseOnHover: true,
    autoStart: true,
  });

  // Extract trending game logs from cached data
  const topGameLogs = data?.topGameLogs || [];

  if (loading) {
    return (
      <div className="space-y-3 flex flex-col h-full">
        {Array.from({ length: 5 }, (_, i) => `skeleton-${i}-${Date.now()}`).map(uniqueId => (
          <div key={uniqueId} className="bg-bg-theme-secondary rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-bg-theme-secondary rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-bg-theme-secondary rounded w-24 mb-2" />
                <div className="h-3 bg-bg-theme-secondary rounded w-20" />
              </div>
            </div>
            <div className="h-4 bg-bg-theme-secondary rounded w-full mb-3" />
            <div className="flex gap-4">
              <div className="h-3 bg-bg-theme-secondary rounded w-16" />
              <div className="h-3 bg-bg-theme-secondary rounded w-20" />
              <div className="h-3 bg-bg-theme-secondary rounded w-18" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !topGameLogs.length) {
    return (
      <div className="text-center py-8">
        <div className="text-theme-muted mb-4">No trending game logs available</div>
        <Link
          href="/protected/dashboard"
          className="inline-block px-6 py-2 bg-semantic-success text-text-inverse rounded-lg hover:bg-semantic-success/90 transition-colors"
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
    if (activity >= 50) return 'text-semantic-error';
    if (activity >= 20) return 'text-semantic-warning';
    if (activity >= 10) return 'text-semantic-warning';
    return 'text-semantic-success';
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
                className="bg-bg-theme-secondary rounded-lg p-4 hover:bg-bg-theme-tertiary transition-colors"
              >
                {/* Game Log Header with Rank and Activity */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-theme-muted">#{index + 1}</span>
                    <div
                      className={`text-sm font-medium flex items-center gap-1 ${getActivityColor(totalActivity)}`}
                    >
                      <div className="w-2 h-2 bg-current rounded-full" />
                      {formatShort(totalActivity)} activity
                    </div>
                  </div>
                  <div className="text-xs text-theme-muted">{formatDate(gameLog.created_at)}</div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-bg-theme-secondary rounded-full flex items-center justify-center overflow-hidden">
                    {gameLog.user?.image_url ? (
                      <Image
                        src={gameLog.user.image_url}
                        alt={gameLog.user.username}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-theme-muted" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-theme-primary text-sm">
                      {gameLog.user?.username || 'Anonymous'}
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div className="bg-surface-card rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-bg-theme-secondary rounded-full flex items-center justify-center">
                        {gameLog.game?.home_team?.logo ? (
                          <Image
                            src={gameLog.game.home_team.logo}
                            alt={gameLog.game.home_team.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-theme-muted">
                            {gameLog.game?.home_team?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-theme-primary text-sm">
                        {gameLog.game?.home_team?.name}
                      </span>
                      <span className="text-theme-muted text-sm">vs</span>
                      <span className="font-medium text-theme-primary text-sm">
                        {gameLog.game?.away_team?.name}
                      </span>
                      <div className="w-6 h-6 bg-bg-theme-secondary rounded-full flex items-center justify-center">
                        {gameLog.game?.away_team?.logo ? (
                          <Image
                            src={gameLog.game.away_team.logo}
                            alt={gameLog.game.away_team.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                            style={{ width: 'auto', height: 'auto' }}
                          />
                        ) : (
                          <span className="text-xs font-semibold text-theme-muted">
                            {gameLog.game?.away_team?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Game Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-theme-muted">
                      <span>Rating: {gameLog.rating_for_game}/5 ⭐</span>
                      <span>{gameLog.watched_setting}</span>
                    </div>

                    {/* Game Date and Time */}
                    {gameLog.game?.date && (
                      <div className="flex items-center gap-1 text-xs text-theme-muted">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(gameLog.game.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>
                          {new Date(gameLog.game.date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Arena Info */}
                    {gameLog.game?.arena && (
                      <div className="flex items-center gap-1 text-xs text-theme-muted">
                        <div className="w-4 h-4 bg-semantic-info/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-semantic-info">🏟️</span>
                        </div>
                        <span className="truncate">
                          {gameLog.game.arena.name}
                          {gameLog.game.arena.city && `, ${gameLog.game.arena.city}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comment Preview */}
                {gameLog.comments?.edges?.length > 0 && (
                  <div className="bg-bg-theme-secondary rounded-lg p-2 mb-3">
                    <div className="text-xs text-theme-secondary italic">
                      &ldquo;
                      {gameLog.comments.edges[0].node.content.length > 100
                        ? `${gameLog.comments.edges[0].node.content.substring(0, 100)}...`
                        : gameLog.comments.edges[0].node.content}
                      &rdquo;
                    </div>
                  </div>
                )}

                {/* Activity Stats */}
                <div className="flex items-center justify-between text-xs text-theme-muted">
                  <div className="flex items-center gap-2">
                    {(gameLog.totalCommentCount || 0) > 0 && (
                      <>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{formatShort(gameLog.totalCommentCount || 0)} comments</span>
                        </div>
                        {(gameLog.totalReactionCount || 0) > 0 && <span>•</span>}
                      </>
                    )}
                    {(gameLog.totalReactionCount || 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{formatShort(gameLog.totalReactionCount || 0)} reactions</span>
                      </div>
                    )}
                  </div>

                  {/* Engagement Level Indicator */}
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      totalActivity >= 50
                        ? 'bg-semantic-error/10 text-semantic-error'
                        : totalActivity >= 20
                          ? 'bg-semantic-warning/10 text-semantic-warning'
                          : totalActivity >= 10
                            ? 'bg-semantic-warning/10 text-semantic-warning'
                            : 'bg-semantic-success/10 text-semantic-success'
                    }`}
                  >
                    {totalActivity >= 50
                      ? '🔥 Hot'
                      : totalActivity >= 20
                        ? '📈 Trending'
                        : totalActivity >= 10
                          ? '👀 Active'
                          : '💤 Quiet'}
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
          href="/protected/dashboard"
          className="block w-full text-center py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
        >
          View All Game Logs
        </Link>
      </div>
    </div>
  );
}
