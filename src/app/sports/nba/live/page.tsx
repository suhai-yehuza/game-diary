'use client';

import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Activity, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { logger } from '@lib/core/logger';
import { GameCard } from '@src/app/protected/user/components/game-logs/game-card';
import { API_CONFIG } from '@src/lib/config/api.config';
import { GET_LIVE_GAMES } from '@src/lib/graphql/queries';
import type { IGame, GetLiveGamesQuery } from '@src/lib/types';

export const dynamic = 'force-dynamic';

export default function LiveGamesPage() {
  const { isLoaded } = useUser();

  const { loading, error, data } = useQuery<GetLiveGamesQuery>(GET_LIVE_GAMES, {
    variables: {
      first: API_CONFIG.pagination.HUGE_SIZE,
    },
    pollInterval: 30000, // Poll every 30 seconds for live updates
    notifyOnNetworkStatusChange: true,
  });

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-muted-foreground">Loading live games...</div>
        </div>
      </div>
    );
  }

  if (error) {
    logger.error('Error loading live games:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error loading live games</div>
          <div className="text-sm text-muted-foreground mb-4">{error.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Convert GraphQL result to Game type with proper type assertion
  const liveGames = (data?.liveGames?.edges?.map(edge => ({
    ...edge.node,
    stage: (edge.node as Record<string, unknown>).season ? 1 : 0, // Provide default stage value
  })) || []) as unknown as IGame[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header with NBA logo and gradient */}
      <div className="w-full bg-gradient-to-r from-blue-900 via-red-700 to-blue-900 py-6 mb-10 shadow-lg">
        <div className="container mx-auto flex items-center gap-4 px-4">
          <Link
            href="/sports/nba"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to NBA</span>
          </Link>
          <div className="flex-1 flex items-center justify-center gap-3">
            <Image src="/nba-logo.svg" alt="NBA" width={32} height={32} className="drop-shadow" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Live NBA Games</h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span className="relative inline-flex items-center px-4 py-1 rounded-full bg-red-500 text-white font-semibold text-sm shadow">
              <span className="relative flex items-center mr-2">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                <span className="relative h-3 w-3 rounded-full bg-red-200"></span>
              </span>
              {liveGames.length} {liveGames.length === 1 ? 'game' : 'games'} in progress
            </span>
            <span className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Auto-refreshing every 30 seconds
            </span>
          </div>
        </div>
      </div>

      {/* Live Status & Auto-refresh */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          {/* The pulsing LIVE indicator is now in the header */}
        </div>

        {/* Live Games Flex Grid */}
        {liveGames.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {liveGames.map(game => (
              <div
                key={game.id}
                className="w-full max-w-md transition-transform duration-200 hover:scale-105"
              >
                <div className="rounded-2xl shadow-xl border border-red-500/30 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-1">
                  <GameCard game={game} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Activity className="h-12 w-12 text-red-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">No Live Games</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              There are no NBA games currently in progress. Check back later or view all games.
            </p>
            <Link
              href="/sports/nba"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-lg font-semibold shadow"
            >
              View All NBA Games
            </Link>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-white/60">
          <p>Scores and game status update automatically every 30 seconds</p>
          <Link
            href="/sports/nba"
            className="text-blue-400 hover:text-blue-300 hover:underline mt-2 inline-block"
          >
            View all NBA games including scheduled and completed games →
          </Link>
        </div>
      </div>
    </div>
  );
}
