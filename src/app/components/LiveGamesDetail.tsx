'use client';

import { ArrowLeft, RefreshCw, Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';

import { PageLoadingSpinner, PageErrorDisplay, NoDataEmptyState } from '@/app/components/common';
import { Button } from '@/app/components/ui/button';
import { useLiveGames } from '@/hooks/use-live-games';
import type { IGamesApiResponse } from '@/types';

export function LiveGamesDetail({ data }: { data?: IGamesApiResponse } = {}) {
  const { games, loading, error, refetch } = useLiveGames({
    initialData: data,
  });
  const { resolvedTheme } = useTheme();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        void refetch();
        setLastUpdated(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, refetch]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  if (loading && games.length === 0) {
    return <PageLoadingSpinner text="Loading live games..." />;
  }

  if (error && games.length === 0) {
    return (
      <PageErrorDisplay
        error={error}
        title="Error loading live games"
        onRetry={() => void handleManualRefresh()}
      />
    );
  }

  if (games.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back to NBA Hub */}
        <div className="mb-6">
          <Link href="/sports/nba">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to NBA Hub
            </Button>
          </Link>
        </div>

        <NoDataEmptyState
          title="No Live Games"
          description="There are currently no live NBA games."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to NBA Hub */}
      <div className="mb-6">
        <Link href="/sports/nba">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to NBA Hub
          </Button>
        </Link>
      </div>

      {/* Header with refresh functionality */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="live-games-title text-3xl font-bold mb-2">Live NBA Games</h1>
            <p
              className="live-games-count"
              style={
                {
                  color:
                    resolvedTheme === 'dark'
                      ? 'var(--color-text-tertiary)'
                      : 'var(--color-text-primary)',
                  fontWeight: 'normal',
                } as React.CSSProperties
              }
            >
              {games.length} {games.length === 1 ? 'Game' : 'Games'} currently live
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="last-updated-text text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              onClick={() => void handleManualRefresh()}
              disabled={isRefreshing || loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Live Games Grid */}
      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        data-testid="live-games-grid"
        role="region"
        aria-label="Live NBA games"
      >
        {games.map(game => (
          <div
            key={game.id}
            className="bg-surface-card rounded-xl shadow-lg p-6 border border-theme-primary hover:shadow-xl transition-all duration-200"
            role="article"
            aria-label={`${game.teams?.visitors?.name || 'Unknown'} vs ${game.teams?.home?.name || 'Unknown'} - ${typeof game.status === 'object' ? game.status.long || game.status.short : game.status}`}
          >
            {/* Game Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-semantic-error rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-semantic-error">LIVE</span>
              </div>
              <div className="text-sm text-theme-muted font-medium">
                {typeof game.status === 'object'
                  ? game.status.long || game.status.short
                  : game.status}
              </div>
            </div>

            {/* Teams and Scores */}
            <div className="space-y-4">
              {/* Away Team */}
              <div className="flex items-center justify-between p-3 bg-bg-theme-secondary rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 relative">
                    <Image
                      src={game.teams?.visitors?.logo || '/defaults/team-logo.svg'}
                      alt={game.teams?.visitors?.name || 'Unknown Team'}
                      fill
                      className="object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-theme-primary">
                      {game.teams?.visitors?.name || 'Unknown Team'}
                    </div>
                    <div className="text-sm text-theme-muted">
                      {game.teams?.visitors?.nickname || game.teams?.visitors?.code || ''}
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-theme-primary">
                  {game.scores?.visitors?.points || 0}
                </div>
              </div>

              {/* VS */}
              <div className="text-center text-theme-muted text-sm font-medium">VS</div>

              {/* Home Team */}
              <div className="flex items-center justify-between p-3 bg-bg-theme-secondary rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 relative">
                    <Image
                      src={game.teams?.home?.logo || '/defaults/team-logo.svg'}
                      alt={game.teams?.home?.name || 'Unknown Team'}
                      fill
                      className="object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-theme-primary">
                      {game.teams?.home?.name || 'Unknown Team'}
                    </div>
                    <div className="text-sm text-theme-muted">
                      {game.teams?.home?.nickname || game.teams?.home?.code || ''}
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-theme-primary">
                  {game.scores?.home?.points || 0}
                </div>
              </div>
            </div>

            {/* Game Details */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                {/* Arena */}
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {game.arena?.name || game.venue || 'Unknown Venue'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {game.arena
                        ? `${game.arena.city}, ${game.arena.state}`
                        : 'Location not available'}
                    </div>
                  </div>
                </div>

                {/* Period and Time */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Period:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {game.periods
                        ? `${game.periods.current} of ${game.periods.total}`
                        : game.period
                          ? `Period ${game.period}`
                          : 'Period not available'}
                    </span>
                  </div>
                  {typeof game.status === 'object' && game.status.clock && (
                    <div className="text-gray-600 dark:text-gray-400">
                      Time: <span className="font-medium">{game.status.clock}</span>
                    </div>
                  )}
                </div>

                {/* Game Nugget */}
                {game.nugget && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">{game.nugget}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Data refreshes automatically every 30 seconds
        </p>
      </div>
    </div>
  );
}
