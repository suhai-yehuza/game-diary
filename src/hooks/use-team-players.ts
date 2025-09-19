import { useCallback, useEffect, useState, useMemo } from 'react';

import { useCentralizedErrorHandler } from '@/hooks/use-centralized-error-handler';
import { logger } from '@/lib/utils/logger';
import type { ITeamPlayersPlayer, IUseTeamPlayersOptions, IUseTeamPlayersReturn } from '@/types';

export function useTeamPlayers({
  teamId,
  season,
  skip = false,
}: IUseTeamPlayersOptions): IUseTeamPlayersReturn {
  const [teamPlayers, setTeamPlayers] = useState<ITeamPlayersPlayer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorHandlerContext = useMemo(
    () => ({
      component: 'useTeamPlayers',
      action: 'fetchTeamPlayers',
    }),
    []
  );

  const { handleAsync } = useCentralizedErrorHandler({
    context: errorHandlerContext,
  });

  const fetchTeamPlayers = useCallback(async () => {
    if (skip || !teamId || !season) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info(`Fetching team players for team ID: ${teamId}, season: ${season}`);

      const queryParams = new URLSearchParams({
        team: teamId,
        season,
      });

      const response = await fetch(`/api/teams/${teamId}/players?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        const players = data.data.response || [];
        setTeamPlayers(players);
        logger.info('Team players fetched successfully', {
          teamId,
          season,
          results: data.data.results,
          playersCount: players.length,
        });
      } else if (data.success && data.data?.response?.length === 0) {
        // Handle empty players array gracefully
        setTeamPlayers([]);
        logger.info('No team players found - returning empty array', {
          teamId,
          season,
          results: data.data.results,
        });
      } else {
        throw new Error(data.error || 'Failed to fetch team players');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Failed to fetch team players:', {
        error: errorMessage,
        teamId,
        season,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [teamId, season, skip]);

  useEffect(() => {
    if (!skip && teamId && season) {
      void handleAsync(fetchTeamPlayers);
    }
  }, [fetchTeamPlayers, handleAsync, skip, teamId, season]);

  return {
    teamPlayers,
    loading,
    error,
    refetch: fetchTeamPlayers,
  };
}
