'use client';

import Image from 'next/image';
import React from 'react';

import { PageLoadingSpinner, PageErrorDisplay, NoDataEmptyState } from '@/app/components/common';
import { useLiveGames } from '@/hooks/use-live-games';
import type { IGamesApiResponse } from '@/lib/types/externalApiTypes';

export function LiveGamesDetail({ data }: { data?: IGamesApiResponse } = {}) {
  const { games, loading, error } = useLiveGames({
    initialData: data,
  });

  if (loading) {
    return <PageLoadingSpinner text="Loading live games..." />;
  }

  if (error && games.length === 0) {
    return (
      <PageErrorDisplay
        error={error}
        title="Error loading live games"
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (games.length === 0) {
    return (
      <NoDataEmptyState
        title="No Live Games"
        description="There are currently no live NBA games."
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live NBA Games</h1>
        <p className="text-gray-600">
          {games.length} {games.length === 1 ? 'game' : 'games'} currently live
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map(game => (
          <div
            key={game.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            {/* Game Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">LIVE</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{game.status.long}</div>
            </div>

            {/* Teams and Scores */}
            <div className="space-y-4">
              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 relative">
                    <Image
                      src={game.teams.visitors.logo}
                      alt={game.teams.visitors.name}
                      fill
                      className="object-contain"
                      sizes="32px"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{game.teams.visitors.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {game.teams.visitors.nickname}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{game.scores.visitors.points}</div>
              </div>

              {/* VS */}
              <div className="text-center text-gray-500 text-sm">VS</div>

              {/* Home Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 relative">
                    <Image
                      src={game.teams.home.logo}
                      alt={game.teams.home.name}
                      fill
                      className="object-contain"
                      sizes="32px"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{game.teams.home.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {game.teams.home.nickname}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{game.scores.home.points}</div>
              </div>
            </div>

            {/* Game Details */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Arena:</span>
                  <div className="font-medium">{game.arena.name}</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {game.arena.city}, {game.arena.state}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Period:</span>
                  <div className="font-medium">
                    {game.periods.current} of {game.periods.total}
                  </div>
                  {game.status.clock && (
                    <div className="text-gray-600 dark:text-gray-400">
                      Time: {game.status.clock}
                    </div>
                  )}
                </div>
              </div>

              {game.nugget && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">{game.nugget}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
