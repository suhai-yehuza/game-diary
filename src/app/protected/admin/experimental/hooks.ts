import { useState, useCallback } from 'react';

import { createRapidAPIClient } from '@/lib/utils/api-client';

// API fetch hook
export const useApiFetch = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = createRapidAPIClient();

  const handleFetch = useCallback(
    async (
      endpoint: Readonly<string>,
      params: Readonly<Record<string, string>>,
      requiredParams: ReadonlyArray<string> = []
    ) => {
      // Validate required parameters
      const missingParams = requiredParams.filter(param => !params[param]);
      if (missingParams.length > 0) {
        setError(`Missing required parameters: ${missingParams.join(', ')}`);
        return;
      }

      // Check if at least one parameter is provided
      const hasAnyParam = Object.values(params).some(value => value.trim() !== '');
      if (!hasAnyParam) {
        setError('At least one parameter is required');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await client.fetch(endpoint, params);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return { data, loading, error, handleFetch };
};

// Form state hook
export const useFormState = () => {
  const [gameParams, setGameParams] = useState<Record<string, string>>({
    id: '',
    date: '',
    season: '',
    league: '',
    team: '',
    h2h: '',
  });

  const [gameStatsId, setGameStatsId] = useState<string>('');

  const [teamParams, setTeamParams] = useState<Record<string, string>>({
    id: '',
    name: '',
    code: '',
    league: '',
    conference: '',
    division: '',
    search: '',
  });

  const [teamStatsParams, setTeamStatsParams] = useState<Record<string, string>>({
    id: '',
    season: '',
    stage: '',
  });

  const [playerParams, setPlayerParams] = useState<Record<string, string>>({
    id: '',
    name: '',
    team: '',
    season: '',
    country: '',
    search: '',
  });

  const [playerStatsParams, setPlayerStatsParams] = useState<Record<string, string>>({
    id: '',
    game: '',
    team: '',
    season: '',
  });

  const [standingsParams, setStandingsParams] = useState<Record<string, string>>({
    league: '',
    season: '',
    team: '',
    conference: '',
    division: '',
  });

  return {
    gameParams,
    setGameParams,
    gameStatsId,
    setGameStatsId,
    teamParams,
    setTeamParams,
    teamStatsParams,
    setTeamStatsParams,
    playerParams,
    setPlayerParams,
    playerStatsParams,
    setPlayerStatsParams,
    standingsParams,
    setStandingsParams,
  };
};

// Tab state hook
export const useTabState = () => {
  const [selectedTab, setSelectedTab] = useState<string>('seasons');
  const [gamesSubTab, setGamesSubTab] = useState<string>('games');
  const [teamsSubTab, setTeamsSubTab] = useState<string>('teams');
  const [playersSubTab, setPlayersSubTab] = useState<string>('players');

  return {
    selectedTab,
    setSelectedTab,
    gamesSubTab,
    setGamesSubTab,
    teamsSubTab,
    setTeamsSubTab,
    playersSubTab,
    setPlayersSubTab,
  };
};
