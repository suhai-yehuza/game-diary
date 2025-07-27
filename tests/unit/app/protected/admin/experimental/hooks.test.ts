import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  useTeamsData,
  useSeasonsData,
  useApiFetch,
  useFormState,
  useTabState,
} from '@/app/protected/admin/experimental/hooks';

// Mock fetch
global.fetch = vi.fn();

// Mock the config
vi.mock('@/lib/config/app.config', () => ({
  API_CONFIG: {
    endpoints: {
      SEASONS: '/api/seasons',
      LEAGUES: '/api/leagues',
      GAMES: '/api/games',
      TEAMS: '/api/teams',
      PLAYERS: '/api/players',
      STANDINGS: '/api/standings',
    },
  },
}));

// Mock the types
vi.mock('@/lib/types/constant.types', () => ({
  TABS: {
    SEASONS: 'seasons',
    LEAGUES: 'leagues',
    GAMES: 'games',
    TEAMS: 'teams',
    PLAYERS: 'players',
    STANDINGS: 'standings',
  },
}));

describe('Admin Experimental Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('useTeamsData', () => {
    it('initializes with empty teams array', () => {
      const { result } = renderHook(() => useTeamsData());

      expect(result.current.teams).toEqual([]);
      expect(result.current.loadingTeams).toBe(true);
      expect(result.current.teamsError).toBeNull();
    });

    it('fetches teams successfully', async () => {
      const mockTeams = [
        { id: 1, name: 'Team A' },
        { id: 2, name: 'Team B' },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: mockTeams }),
      });

      const { result } = renderHook(() => useTeamsData());

      // Wait for the async operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loadingTeams).toBe(false);
      expect(result.current.teams).toHaveLength(3); // Including "All Teams" option
      expect(result.current.teams[0]).toEqual({ value: '', label: 'All Teams' });
      expect(result.current.teams[1]).toEqual({ value: '1', label: 'Team A' });
      expect(result.current.teams[2]).toEqual({ value: '2', label: 'Team B' });
      expect(result.current.teamsError).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTeamsData());

      // Wait for the async operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loadingTeams).toBe(false);
      expect(result.current.teams).toEqual([]);
      expect(result.current.teamsError).toBe('Network error');
    });

    it('handles malformed API response', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'not-an-array' }),
      });

      const { result } = renderHook(() => useTeamsData());

      // Wait for the async operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loadingTeams).toBe(false);
      expect(result.current.teams).toEqual([]);
      expect(result.current.teamsError).toBeNull();
    });
  });

  describe('useSeasonsData', () => {
    it('initializes with empty seasons array', () => {
      const { result } = renderHook(() => useSeasonsData());

      expect(result.current.seasons).toEqual([]);
      expect(result.current.loadingSeasons).toBe(true);
      expect(result.current.seasonsError).toBeNull();
    });

    it('fetches seasons successfully', async () => {
      const mockSeasons = [2023, 2022, 2021];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: mockSeasons }),
      });

      const { result } = renderHook(() => useSeasonsData());

      // Wait for the async operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loadingSeasons).toBe(false);
      expect(result.current.seasons).toHaveLength(3);
      expect(result.current.seasons[0]).toEqual({ value: '2023', label: '2023' });
      expect(result.current.seasons[1]).toEqual({ value: '2022', label: '2022' });
      expect(result.current.seasons[2]).toEqual({ value: '2021', label: '2021' });
      expect(result.current.seasonsError).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSeasonsData());

      // Wait for the async operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loadingSeasons).toBe(false);
      expect(result.current.seasons).toHaveLength(1); // Fallback to current year
      expect(result.current.seasonsError).toBe('Network error');
    });
  });

  describe('useApiFetch', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useApiFetch());

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(typeof result.current.handleFetch).toBe('function');
      expect(typeof result.current.clearData).toBe('function');
    });

    it('clears data correctly', () => {
      const { result } = renderHook(() => useApiFetch());

      act(() => {
        result.current.clearData();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles missing required parameters', async () => {
      const { result } = renderHook(() => useApiFetch());

      await act(async () => {
        await result.current.handleFetch('/api/test', {}, ['required']);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Missing required parameters: required');
    });

    it('handles empty parameters for non-simple endpoints', async () => {
      const { result } = renderHook(() => useApiFetch());

      await act(async () => {
        await result.current.handleFetch('/api/games', {});
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('At least one parameter is required');
    });
  });

  describe('useFormState', () => {
    it('initializes with default form data', () => {
      const { result } = renderHook(() => useFormState());

      expect(result.current.gameParams).toEqual({
        id: '',
        date: '',
        season: '',
        league: '',
        team: '',
        h2h: '',
      });
      expect(result.current.teamParams).toEqual({
        id: '',
        name: '',
        code: '',
        league: '',
        conference: '',
        division: '',
        search: '',
      });
      expect(result.current.playerParams).toEqual({
        id: '',
        name: '',
        team: '',
        season: '',
        country: '',
        search: '',
      });
    });

    it('initializes with provided seasons', () => {
      const mockSeasons = [
        { value: '2023', label: '2023' },
        { value: '2022', label: '2022' },
      ];

      const { result } = renderHook(() => useFormState(mockSeasons));

      expect(result.current.gameParams.season).toBe('2023');
      expect(result.current.teamStatsParams.season).toBe('2023');
      expect(result.current.playerParams.season).toBe('2023');
      expect(result.current.playerStatsParams.season).toBe('2023');
      expect(result.current.standingsParams.season).toBe('2023');
    });

    it('updates game parameters', () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.setGameParams(prev => ({ ...prev, id: '123', season: '2023' }));
      });

      expect(result.current.gameParams).toEqual({
        id: '123',
        date: '',
        season: '2023',
        league: '',
        team: '',
        h2h: '',
      });
    });

    it('updates team parameters', () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.setTeamParams(prev => ({ ...prev, name: 'Test Team', league: 'NBA' }));
      });

      expect(result.current.teamParams).toEqual({
        id: '',
        name: 'Test Team',
        code: '',
        league: 'NBA',
        conference: '',
        division: '',
        search: '',
      });
    });

    it('updates player parameters', () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.setPlayerParams(prev => ({ ...prev, name: 'Test Player', team: '1' }));
      });

      expect(result.current.playerParams).toEqual({
        id: '',
        name: 'Test Player',
        team: '1',
        season: '',
        country: '',
        search: '',
      });
    });

    it('updates standings parameters', () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.setStandingsParams(prev => ({ ...prev, league: 'NBA', season: '2023' }));
      });

      expect(result.current.standingsParams).toEqual({
        league: 'NBA',
        season: '2023',
        team: '',
        conference: '',
        division: '',
      });
    });
  });

  describe('useTabState', () => {
    it('initializes with default tab state', () => {
      const { result } = renderHook(() => useTabState());

      expect(result.current.selectedTab).toBe('seasons');
      expect(result.current.gamesSubTab).toBe('games');
      expect(result.current.teamsSubTab).toBe('teams');
      expect(result.current.playersSubTab).toBe('players');
    });

    it('updates selected tab', () => {
      const { result } = renderHook(() => useTabState());

      act(() => {
        result.current.setSelectedTab('teams');
      });

      expect(result.current.selectedTab).toBe('teams');
    });

    it('updates sub tabs', () => {
      const { result } = renderHook(() => useTabState());

      act(() => {
        result.current.setGamesSubTab('statistics');
        result.current.setTeamsSubTab('players');
        result.current.setPlayersSubTab('stats');
      });

      expect(result.current.gamesSubTab).toBe('statistics');
      expect(result.current.teamsSubTab).toBe('players');
      expect(result.current.playersSubTab).toBe('stats');
    });
  });
});
