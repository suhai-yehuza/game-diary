'use client';

import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { GameCard } from '@src/components/features/games';
import { API_CONFIG } from '@src/lib/config/api.config';
import { GET_LIVE_GAMES } from '@src/lib/graphql/queries';
import { logger } from 'lib/core/logger';
import type { GetLiveGamesQuery } from '@src/lib/types/generated/graphql';
import type { Game } from '@src/lib/types/consolidated.types';

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
    stage: edge.node.season ? 1 : 0, // Provide default stage value
  })) || []) as Game[];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back navigation */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/sports/nba"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to NBA
        </Link>
      </div>

      {/* Live Games Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative">
          <div className="absolute -inset-1 bg-red-500 rounded-full animate-ping opacity-75" />
          <div className="relative w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
        <Activity className="h-6 w-6 text-red-500 animate-pulse" />
        <h1 className="text-3xl font-bold">Live NBA Games</h1>
        <span className="text-muted-foreground">
          ({liveGames.length} {liveGames.length === 1 ? 'game' : 'games'} in progress)
        </span>
      </div>

      {/* Auto-refresh indicator */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Auto-refreshing every 30 seconds
      </div>

      {/* Live Games Grid */}
      {liveGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveGames.map(game => (
            <div key={game.id} className="relative">
              {/* Live indicator overlay */}
              <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium animate-pulse">
                LIVE
              </div>
              <GameCard game={game} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Live Games</h3>
          <p className="text-muted-foreground mb-6">
            There are no NBA games currently in progress. Check back later or view all games.
          </p>
          <Link
            href="/sports/nba"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All NBA Games
          </Link>
        </div>
      )}

      {/* Footer info */}
      {liveGames.length > 0 && (
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Scores and game status update automatically every 30 seconds</p>
          <Link
            href="/sports/nba"
            className="text-blue-600 hover:text-blue-700 hover:underline mt-2 inline-block"
          >
            View all NBA games including scheduled and completed games →
          </Link>
        </div>
      )}
    </div>
  );
} 