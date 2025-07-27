import { useState, useCallback, useEffect } from 'react';

import { API_CONFIG } from '@/lib/config/app.config';
import type { TabValue } from '@/lib/types';
import { TABS } from '@/lib/types/constant.types';

// Teams data hook
export const useTeamsData = () => {
  const [teams, setTeams] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoadingTeams(true);
    setTeamsError(null);

    try {
      const response = await fetch('/api/proxy/teams', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status} ${response.statusText}`);
      }

      const result = (await response.json()) as {
        response?: Array<{ id?: number; name?: string }>;
      };

      // Extract teams from the API response
      if (result?.response && Array.isArray(result.response)) {
        const teamOptions = result.response
          .map(team => ({
            value: team.id?.toString() ?? '',
            label: team.name ?? `Team ${team.id}`,
          }))
          .filter(team => team.value && team.label) // Filter out invalid entries
          .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by name

        // Add "None" option at the beginning
        const teamsWithNone = [{ value: '', label: 'All Teams' }, ...teamOptions];
        setTeams(teamsWithNone);
      } else {
        // Fallback to empty array if API doesn't return expected format
        setTeams([]);
      }
    } catch (err) {
      setTeamsError(err instanceof Error ? err.message : 'Failed to fetch teams');
      // Fallback to empty array on error
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  // Fetch teams on mount
  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  return { teams, loadingTeams, teamsError, refetchTeams: fetchTeams };
};

// Seasons data hook
export const useSeasonsData = () => {
  const [seasons, setSeasons] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [seasonsError, setSeasonsError] = useState<string | null>(null);

  const fetchSeasons = useCallback(async () => {
    setLoadingSeasons(true);
    setSeasonsError(null);

    try {
      const response = await fetch('/api/proxy/seasons', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch seasons: ${response.status} ${response.statusText}`);
      }

      const result = (await response.json()) as { response?: Array<number> };

      // Extract seasons from the API response
      if (result?.response && Array.isArray(result.response)) {
        const seasonOptions = result.response
          .map(season => ({
            value: season.toString(),
            label: season.toString(),
          }))
          .sort((a, b) => parseInt(b.value) - parseInt(a.value)); // Sort in descending order (latest first)
        setSeasons(seasonOptions);
      } else {
        // Fallback to current year if API doesn't return expected format
        const currentYear = new Date().getFullYear();
        setSeasons([{ value: currentYear.toString(), label: currentYear.toString() }]);
      }
    } catch (err) {
      setSeasonsError(err instanceof Error ? err.message : 'Failed to fetch seasons');
      // Fallback to current year on error
      const currentYear = new Date().getFullYear();
      setSeasons([{ value: currentYear.toString(), label: currentYear.toString() }]);
    } finally {
      setLoadingSeasons(false);
    }
  }, []);

  // Fetch seasons on mount
  useEffect(() => {
    void fetchSeasons();
  }, [fetchSeasons]);

  return { seasons, loadingSeasons, seasonsError, refetchSeasons: fetchSeasons };
};

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
      if (
        !endpoint.endsWith(API_CONFIG.endpoints.SEASONS) &&
        !endpoint.endsWith(API_CONFIG.endpoints.LEAGUES)
      ) {
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
          if (
            value &&
            value.trim() !== '' &&
            value.trim() !== 'null' &&
            value.trim() !== 'undefined'
          ) {
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
export const useFormState = (seasons: Array<{ value: string; label: string }> = []) => {
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

  // Update season defaults when seasons data becomes available
  useEffect(() => {
    if (seasons.length > 0) {
      const defaultSeason = seasons[0]?.value ?? '';

      // Only update if current season is empty
      if (!gameParams.season) {
        setGameParams(prev => ({ ...prev, season: defaultSeason }));
      }
      if (!teamStatsParams.season) {
        setTeamStatsParams(prev => ({ ...prev, season: defaultSeason }));
      }
      if (!playerParams.season) {
        setPlayerParams(prev => ({ ...prev, season: defaultSeason }));
      }
      if (!playerStatsParams.season) {
        setPlayerStatsParams(prev => ({ ...prev, season: defaultSeason }));
      }
      if (!standingsParams.season) {
        setStandingsParams(prev => ({ ...prev, season: defaultSeason }));
      }
    }
  }, [
    seasons,
    gameParams.season,
    teamStatsParams.season,
    playerParams.season,
    playerStatsParams.season,
    standingsParams.season,
  ]);

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
