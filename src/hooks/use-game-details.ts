import { useState, useCallback, useMemo } from 'react';

import { useCentralizedErrorHandler } from '@/hooks/use-centralized-error-handler';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { IGameDetails, IUseGameDetailsOptions, IUseGameDetailsReturn } from '@/types';

export function useGameDetails({
  gameId,
  skip = false,
}: IUseGameDetailsOptions): IUseGameDetailsReturn {
  const [gameDetails, setGameDetails] = useState<IGameDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorHandlerContext = useMemo(
    () => ({
      component: 'useGameDetails',
      action: 'fetchGameDetails',
    }),
    []
  );

  const { handleAsync: _handleAsync } = useCentralizedErrorHandler();

  const fetchGameDetails = useCallback(async () => {
    if (!gameId || skip) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/games/${gameId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch game details: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data?.response?.[0]) {
        const game = data.data.response[0];
        setGameDetails({
          id: game.id,
          date: game.date?.start || '',
          home: {
            id: game.teams?.home?.id || 0,
            name: game.teams?.home?.name || '',
            nickname: game.teams?.home?.nickname || '',
            code: game.teams?.home?.code || '',
            logo: game.teams?.home?.logo || '',
          },
          away: {
            id: game.teams?.away?.id || 0,
            name: game.teams?.away?.name || '',
            nickname: game.teams?.away?.nickname || '',
            code: game.teams?.away?.code || '',
            logo: game.teams?.away?.logo || '',
          },
          scores: {
            home: game.scores?.home?.points || 0,
            away: game.scores?.away?.points || 0,
          },
          status: {
            long: game.status?.long || '',
            short: game.status?.short || '',
          },
        });
      } else {
        throw new Error(data.error || 'Failed to fetch game details');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      // Use centralized error handling
      errorHandlers.api(err instanceof Error ? err : new Error(errorMessage), errorHandlerContext);
    } finally {
      setLoading(false);
    }
  }, [gameId, skip, errorHandlerContext]);

  return {
    gameDetails,
    loading,
    error,
    fetchGameDetails,
  };
}
