import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useNBAPlayers } from '@/hooks/use-nba-players';

// Mock the environment check
vi.mock('@/lib/utils/e2e-test-setup', () => ({
  isTestOrCIEnvironment: () => true,
}));

// Mock Redis service to avoid complex internal fetch calls
// Cache mock removed

// Mock fetch globally
global.fetch = vi.fn();

const mockPlayersResponse = {
  response: [
    {
      id: 1,
      name: 'LeBron James',
      firstname: 'LeBron',
      lastname: 'James',
      birth: {
        date: '1984-12-30',
        country: 'USA',
      },
      nba: {
        start: 2003,
        pro: 20,
      },
      height: {
        feets: '6',
        inches: '9',
        meters: '2.06',
      },
      weight: {
        pounds: '250',
        kilograms: '113.4',
      },
      college: 'St. Vincent-St. Mary HS (OH)',
      affiliation: 'St. Vincent-St. Mary HS (OH)',
      leagues: {
        standard: {
          jersey: 23,
          active: true,
          pos: 'F',
        },
      },
      team: {
        id: 14,
        name: 'Los Angeles Lakers',
        nickname: 'Lakers',
        code: 'LAL',
        city: 'Los Angeles',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/1200px-Los_Angeles_Lakers_logo.svg.png',
        allStar: false,
        nbaFranchise: true,
        conferences: {
          east: false,
          west: true,
        },
        division: {
          id: 15,
          name: 'Pacific',
          nameShort: 'PAC',
          season: 2023,
          logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Pacific_Division_logo.svg/1200px-Pacific_Division_logo.svg.png',
        },
      },
    },
    {
      id: 2,
      name: 'Stephen Curry',
      firstname: 'Stephen',
      lastname: 'Curry',
      birth: {
        date: '1988-03-14',
        country: 'USA',
      },
      nba: {
        start: 2009,
        pro: 14,
      },
      height: {
        feets: '6',
        inches: '3',
        meters: '1.91',
      },
      weight: {
        pounds: '185',
        kilograms: '83.9',
      },
      college: 'Davidson',
      affiliation: 'Davidson',
      leagues: {
        standard: {
          jersey: 30,
          active: true,
          pos: 'G',
        },
      },
      team: {
        id: 9,
        name: 'Golden State Warriors',
        nickname: 'Warriors',
        code: 'GSW',
        city: 'Golden State',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Golden_State_Warriors_logo.svg/1200px-Golden_State_Warriors_logo.svg.png',
        allStar: false,
        nbaFranchise: true,
        conferences: {
          east: false,
          west: true,
        },
        division: {
          id: 15,
          name: 'Pacific',
          nameShort: 'PAC',
          season: 2023,
          logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Pacific_Division_logo.svg/1200px-Pacific_Division_logo.svg.png',
        },
      },
    },
  ],
};

const mockInactivePlayer = {
  ...mockPlayersResponse.response[0],
  id: 3,
  name: 'Inactive Player',
  leagues: {
    standard: {
      jersey: 99,
      active: false,
      pos: 'F',
    },
  },
};

describe('useNBAPlayers Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.__API_MOCK_MODE__
    if (typeof window !== 'undefined') {
      (window as any).__API_MOCK_MODE__ = false;
    }
  });

  it('returns players data on successful fetch', async () => {
    const mockPlayers = [
      {
        id: 1,
        firstname: 'LeBron',
        lastname: 'James',
        birth: {
          date: '1984-12-30',
          country: 'USA',
        },
        nba: {
          start: 2003,
          pro: 20,
        },
        height: {
          feets: '6',
          inches: '9',
          meters: '2.06',
        },
        weight: {
          pounds: '250',
          kilograms: '113',
        },
        college: 'St. Vincent-St. Mary HS (OH)',
        affiliation: 'St. Vincent-St. Mary HS (OH)',
        leagues: {
          standard: {
            jersey: 23,
            active: true,
            pos: 'F',
          },
        },
      },
      {
        id: 2,
        firstname: 'Stephen',
        lastname: 'Curry',
        birth: {
          date: '1988-03-14',
          country: 'USA',
        },
        nba: {
          start: 2009,
          pro: 14,
        },
        height: {
          feets: '6',
          inches: '3',
          meters: '1.91',
        },
        weight: {
          pounds: '185',
          kilograms: '84',
        },
        college: 'Davidson',
        affiliation: 'Davidson',
        leagues: {
          standard: {
            jersey: 30,
            active: true,
            pos: 'G',
          },
        },
      },
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        get: 'players',
        parameters: {},
        errors: [],
        results: mockPlayers.length,
        response: mockPlayers,
      }),
    });

    const { result } = renderHook(() => useNBAPlayers({ forceRealData: true }));

    await waitFor(() => {
      expect(result.current.players).toHaveLength(2);
    });

    expect(result.current.players[0].firstname).toBe('LeBron');
    expect(result.current.players[0].lastname).toBe('James');
    expect(result.current.players[1].firstname).toBe('Stephen');
    expect(result.current.players[1].lastname).toBe('Curry');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should filter out inactive players', async () => {
    const playersWithInactive = [...mockPlayersResponse.response, mockInactivePlayer];
    const responseWithInactive = {
      get: 'players',
      parameters: {},
      errors: [],
      results: playersWithInactive.length,
      response: playersWithInactive,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => responseWithInactive,
    });

    const { result } = renderHook(() => useNBAPlayers({ forceRealData: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should only include active players
    expect(result.current.players).toHaveLength(2);
    expect(result.current.players.every(player => player.leagues?.standard?.active !== false)).toBe(
      true
    );
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useNBAPlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.players).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('should handle non-ok response status', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useNBAPlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.players).toEqual([]);
    expect(result.current.error).toBe('Mock API request failed: 500 Internal Server Error');
  });

  it('should skip fetching when skip option is true', async () => {
    const { result } = renderHook(() => useNBAPlayers({ skip: true }));

    expect(result.current.loading).toBe(false);
    expect(result.current.players).toEqual([]);
    expect(result.current.error).toBeNull();

    // Should not have called fetch
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should include team filter in API request when teamId is provided', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayersResponse,
    });

    renderHook(() => useNBAPlayers({ teamId: 'lakers', forceRealData: true }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/players?limit=200&team=lakers')
      );
    });
  });

  it('should use mock data when API_MOCK_MODE is enabled', async () => {
    // Enable mock mode
    if (typeof window !== 'undefined') {
      (window as any).__API_MOCK_MODE__ = true;
    }

    const mockServerResponse = {
      data: mockPlayersResponse,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServerResponse,
    });

    const { result } = renderHook(() => useNBAPlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/mock-server?action=mock-data&type=nba-players')
    );
    expect(result.current.players).toHaveLength(2);
  });

  it('should force real data when forceRealData is true', async () => {
    // Enable mock mode but force real data
    if (typeof window !== 'undefined') {
      (window as any).__API_MOCK_MODE__ = true;
    }

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayersResponse,
    });

    renderHook(() => useNBAPlayers({ forceRealData: true }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/players?limit=200'));
    });
  });

  it('should provide refetch function', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayersResponse,
    });

    const { result } = renderHook(() => useNBAPlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');

    // Mock second call
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: [] }),
    });

    result.current.refetch();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle empty response gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: [] }),
    });

    const { result } = renderHook(() => useNBAPlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.players).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle malformed response gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: 'response' }),
    });

    const { result } = renderHook(() => useNBAPlayers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.players).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
