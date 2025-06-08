import { useQuery } from '@apollo/client';
import { Activity } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { API_CONFIG } from '@src/lib/config/api.config';
import { GET_LIVE_GAMES } from '@src/lib/graphql/queries';
import type { LiveGamesData } from '@src/lib/types/consolidated.types';

export function LiveGamesBanner() {
  const { data } = useQuery<LiveGamesData>(GET_LIVE_GAMES, {
    pollInterval: 30000, // Poll every 30 seconds
    variables: {
      first: API_CONFIG.pagination.HUGE_SIZE,
    },
  });

  const liveGamesCount = data?.liveGames?.totalCount || 0;

  if (liveGamesCount === 0) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-red-500 to-red-600 text-white overflow-hidden">
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 animate-pulse opacity-50" />

      <Link href="/sports/nba" className="relative block">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            {/* Blinking dot indicator */}
            <div className="relative">
              <div className="absolute -inset-1 bg-white rounded-full animate-ping opacity-75" />
              <div className="relative w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>

            <Activity className="h-4 w-4 animate-pulse" />

            <span className="animate-pulse">
              {liveGamesCount === 1 ? '1 Live Game' : `${liveGamesCount} Live Games`} happening now
            </span>

            <span className="text-white/80 animate-pulse">• Click to view →</span>
          </div>
        </div>
      </Link>

      {/* Animated border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
    </div>
  );
}
