import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useNBAHubCounts } from '@/hooks/use-nba-hub-counts';

// Mock fetch globally
global.fetch = vi.fn();

describe('useNBAHubCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    // Mock fetch to prevent actual API calls
    vi.mocked(fetch).mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          counts: { totalGames: 0, totalTeams: 0, totalPlayers: 0, liveGames: 0 },
        }),
    } as Response);

    const { result } = renderHook(() => useNBAHubCounts());

    expect(result.current.counts).toEqual({
      totalGames: 0,
      totalTeams: 0,
      totalPlayers: 0,
      liveGames: 0,
    });
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeUndefined();
    expect(result.current.source).toBeUndefined();
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should load counts from API on initial load', async () => {
    const mockApiResponse = {
      success: true,
      counts: { games: 100, teams: 30, players: 500 },
      source: 'cache',
    };

    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockApiResponse),
    });

    const { result } = renderHook(() => useNBAHubCounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.counts).toEqual(mockApiResponse.counts);
    expect(result.current.source).toBe('cache');
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it('should fetch from API if cache miss', async () => {
    const mockApiResponse = {
      success: true,
      counts: { games: 150, teams: 35, players: 600 },
      source: 'database',
    };

    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockApiResponse),
    });

    const { result } = renderHook(() => useNBAHubCounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.counts).toEqual(mockApiResponse.counts);
    expect(result.current.source).toBe('database');
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNBAHubCounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.counts).toEqual({
      totalGames: 0,
      totalTeams: 0,
      totalPlayers: 0,
      liveGames: 0,
    });
  });

  it('should handle API response errors', async () => {
    const mockApiResponse = {
      success: false,
      error: 'Database connection failed',
    };

    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockApiResponse),
    });

    const { result } = renderHook(() => useNBAHubCounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database connection failed');
    expect(result.current.counts).toEqual({
      totalGames: 0,
      totalTeams: 0,
      totalPlayers: 0,
      liveGames: 0,
    });
  });

  it('should refresh counts when refresh function is called', async () => {
    const mockApiResponse = {
      success: true,
      counts: { games: 200, teams: 40, players: 700 },
      source: 'database',
    };

    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockApiResponse),
    });

    const { result } = renderHook(() => useNBAHubCounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Call refresh
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.counts).toEqual(mockApiResponse.counts);
    });
  });
});
