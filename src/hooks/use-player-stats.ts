import { useCallback, useEffect, useState, useMemo } from 'react';

import { useCentralizedErrorHandler } from '@/hooks/use-centralized-error-handler';
import { logger } from '@/lib/utils/logger';
import type { IPlayerStatsResponse, IUsePlayerStatsOptions, IUsePlayerStatsReturn } from '@/types';

export function usePlayerStats({
  playerId,
  season,
  gameId,
  skip = false,
}: IUsePlayerStatsOptions): IUsePlayerStatsReturn {
  const [playerStats, setPlayerStats] = useState<IPlayerStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorHandlerContext = useMemo(
    () => ({
      component: 'usePlayerStats',
      action: 'fetchPlayerStats',
    }),
    []
  );

  const { handleAsync } = useCentralizedErrorHandler({
    context: errorHandlerContext,
  });

  const fetchPlayerStats = useCallback(async () => {
    if (skip || !playerId || !season) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info(
        `Fetching player statistics for player ID: ${playerId}, season: ${season}${gameId ? `, game: ${gameId}` : ' (season-level)'}`
      );

      const queryParams = new URLSearchParams({
        id: playerId,
        season,
      });

      // Add game parameter only if provided
      if (gameId) {
        queryParams.set('game', gameId);
      }

      const response = await fetch(`/api/players/statistics?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setPlayerStats(data.data);
        logger.info('Player statistics fetched successfully', {
          playerId,
          season,
          gameId,
          results: data.data.results,
        });
      } else {
        throw new Error(data.error || 'Failed to fetch player statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Failed to fetch player statistics:', {
        error: errorMessage,
        playerId,
        season,
        gameId,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [playerId, season, gameId, skip]);

  useEffect(() => {
    if (!skip && playerId && season) {
      void handleAsync(fetchPlayerStats);
    }
  }, [fetchPlayerStats, handleAsync, skip, playerId, season, gameId]);

  return {
    playerStats,
    loading,
    error,
    refetch: fetchPlayerStats,
  };
}
