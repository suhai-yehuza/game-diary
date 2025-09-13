import { useCallback, useEffect, useState, useMemo } from 'react';

import { useCentralizedErrorHandler } from '@/hooks/use-centralized-error-handler';
import { logger } from '@/lib/utils/logger';
import type { IGameStatsResponse, IUseGameStatsOptions, IUseGameStatsReturn } from '@/types';

export function useGameStats({ gameId, skip = false }: IUseGameStatsOptions): IUseGameStatsReturn {
  const [gameStats, setGameStats] = useState<IGameStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorHandlerContext = useMemo(
    () => ({
      component: 'useGameStats',
      action: 'fetchGameStats',
    }),
    []
  );

  const { handleAsync } = useCentralizedErrorHandler({
    context: errorHandlerContext,
  });

  const fetchGameStats = useCallback(async () => {
    if (skip || !gameId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info(`Fetching game statistics for game ID: ${gameId}`);

      const response = await fetch(`/api/games/${gameId}/statistics`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setGameStats(data.data);
        logger.info('Game statistics fetched successfully', {
          gameId,
          results: data.data.results,
        });
      } else {
        throw new Error(data.error || 'Failed to fetch game statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Failed to fetch game statistics:', {
        error: errorMessage,
        gameId,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId, skip]);

  useEffect(() => {
    if (!skip && gameId) {
      void handleAsync(fetchGameStats);
    }
  }, [fetchGameStats, handleAsync, skip, gameId]);

  return {
    gameStats,
    loading,
    error,
    refetch: fetchGameStats,
  };
}
