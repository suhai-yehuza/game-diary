'use client';

import { useLiveGames } from '@/hooks/use-live-games';

export function LiveGamesMonitor() {
  // Get live games polling information
  const { hasLiveGames, currentPollingInterval, timeSinceLastLiveGames } = useLiveGames();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800/90 text-white p-4 rounded-lg text-xs font-mono z-[9999] max-w-xs border border-gray-600 shadow-2xl">
      <div className="font-bold mb-2 text-white">Live Games Polling (Right)</div>
      <div className="space-y-1 text-white">
        <div>Status: {hasLiveGames ? '🟢 LIVE' : '⚪ NO GAMES'}</div>
        <div>Polling: {(currentPollingInterval || 30000) / 1000}s</div>
        {timeSinceLastLiveGames ? <div>Last Live: {timeSinceLastLiveGames}</div> : null}
        <div className="mt-2 text-xs text-gray-300">
          {hasLiveGames ? (
            <div className="text-green-400">Frequent polling (30s)</div>
          ) : (
            <div className="text-blue-400">Reduced polling (5m)</div>
          )}
        </div>
      </div>
    </div>
  );
}
