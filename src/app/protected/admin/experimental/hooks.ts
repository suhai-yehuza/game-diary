import { useState, useCallback } from 'react';

import type { TabValue } from '@/lib/types/constant.types';
import { TABS } from '@/lib/types/constant.types';

// API fetch hook
export const useApiFetch = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearData = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  const handleFetch = useCallback(
    async (endpoint: string, params: Record<string, string>, requiredFields: string[] = []) => {
      // Validate required parameters
      const missingParams = requiredFields.filter(param => !params[param]);
      if (missingParams.length > 0) {
        setError(`Missing required parameters: ${missingParams.join(', ')}`);
        return;
      }

      // Only require at least one parameter for endpoints that need it
      if (!endpoint.endsWith('/seasons') && !endpoint.endsWith('/leagues')) {
        const hasAnyParam = Object.values(params).some(value => value.trim() !== '');
        if (!hasAnyParam) {
          setError('At least one parameter is required');
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        // Build query string
        const url = new URL(`/api/proxy${endpoint}`, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            url.searchParams.append(key, value);
          }
        });
        const response = await fetch(url.toString(), {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        // Use unknown and type guard for result
        const result: unknown = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, handleFetch, clearData };
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
  const [selectedTab, setSelectedTab] = useState<TabValue>(TABS.SEASONS);
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
