/// <reference types="vitest/globals" />

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  useGameLogs,
  useMyGameLogs,
  usePublicGameLogs,
  useFriendsGameLogs,
} from '@/hooks/use-game-logs';

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(() => ({
    loading: false,
    error: null,
    data: null,
    refetch: vi.fn(),
    fetchMore: vi.fn(),
  })),
  gql: vi.fn(() => ''),
}));

describe('Game Logs Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGameLogs', () => {
    it('should be a function', () => {
      expect(typeof useGameLogs).toBe('function');
    });

    it('should return an object with expected properties', () => {
      const { result } = renderHook(() => useGameLogs());

      expect(result.current).toHaveProperty('gameLogs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('gameLogsTotalCount');
      expect(result.current).toHaveProperty('gameLogsHasNextPage');
    });

    it('should accept options parameter', () => {
      const options = {
        filters: { userId: 'user123' },
        pagination: { first: 20 },
      };
      const { result } = renderHook(() => useGameLogs(options));

      expect(result.current).toHaveProperty('gameLogs');
      expect(result.current).toHaveProperty('loading');
    });
  });

  describe('useMyGameLogs', () => {
    it('should be a function', () => {
      expect(typeof useMyGameLogs).toBe('function');
    });

    it('should return an object with expected properties', () => {
      const { result } = renderHook(() => useMyGameLogs('user123'));

      expect(result.current).toHaveProperty('gameLogs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('gameLogsTotalCount');
      expect(result.current).toHaveProperty('gameLogsHasNextPage');
    });

    it('should handle undefined userId', () => {
      const { result } = renderHook(() => useMyGameLogs());
      expect(result.current.gameLogs).toEqual([]);
    });
  });

  describe('usePublicGameLogs', () => {
    it('should be a function', () => {
      expect(typeof usePublicGameLogs).toBe('function');
    });

    it('should return an object with expected properties', () => {
      const { result } = renderHook(() => usePublicGameLogs());

      expect(result.current).toHaveProperty('gameLogs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('gameLogsTotalCount');
      expect(result.current).toHaveProperty('gameLogsHasNextPage');
    });
  });

  describe('useFriendsGameLogs', () => {
    it('should be a function', () => {
      expect(typeof useFriendsGameLogs).toBe('function');
    });

    it('should return an object with expected properties', () => {
      const { result } = renderHook(() => useFriendsGameLogs());

      expect(result.current).toHaveProperty('logs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
    });
  });
});
