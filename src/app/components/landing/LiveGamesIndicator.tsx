'use client';

import { Trophy } from 'lucide-react';

import { useLiveGames } from '@/hooks/use-live-games';

export function LiveGamesIndicator() {
  const { hasLiveGames, loading } = useLiveGames();

  // Don't show anything while loading
  if (loading) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm mb-8">
      {hasLiveGames ? (
        <div className="flex items-center gap-2 text-theme-secondary">
          <div className="w-2 h-2 bg-semantic-success rounded-full animate-pulse" />
          <span>Live games available</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-theme-secondary">
          <div className="w-2 h-2 bg-theme-muted rounded-full" />
          <span>No live games right now</span>
        </div>
      )}

      <div className="hidden sm:block w-px h-4 bg-theme-primary" />

      <div className="flex items-center gap-2 text-theme-secondary">
        <Trophy className="w-4 h-4" />
        <span>Multiple sports</span>
      </div>
    </div>
  );
}
