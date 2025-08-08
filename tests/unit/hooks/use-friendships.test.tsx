import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  useFriendships,
  useFriendshipRequests,
  useFriendshipStatus,
  useUserSearch,
  useFriendshipMutations,
} from '@/hooks/use-friendships';

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(() => ({
    loading: false,
    error: null,
    data: null,
    refetch: vi.fn(),
    fetchMore: vi.fn(),
  })),
  useMutation: vi.fn(() => [vi.fn(), { loading: false }]),
  gql: vi.fn(() => ''),
}));

describe('Friendship Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useFriendships', () => {
    it('should be a function', () => {
      expect(typeof useFriendships).toBe('function');
    });

    it('should return an object with expected properties', () => {
      const { result } = renderHook(() => useFriendships());

      expect(result.current).toHaveProperty('friendships');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('hasNextPage');
      expect(result.current).toHaveProperty('loadMore');
      expect(result.current).toHaveProperty('totalCount');
    });

    it('should accept filters parameter', () => {
      const filters = { status: 'accepted' };
      const { result } = renderHook(() => useFriendships(filters));

      expect(result.current).toHaveProperty('friendships');
      expect(result.current).toHaveProperty('loading');
    });
  });

  describe('useFriendshipRequests', () => {
    it('should be a function', () => {
      expect(typeof useFriendshipRequests).toBe('function');
    });

    it('should return an object with expected properties', () => {
      const { result } = renderHook(() => useFriendshipRequests());

      expect(result.current).toHaveProperty('requests');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('hasNextPage');
      expect(result.current).toHaveProperty('loadMore');
      expect(result.current).toHaveProperty('totalCount');
    });
  });

  describe('useFriendshipStatus', () => {
    it('should be a function', () => {
      expect(typeof useFriendshipStatus).toBe('function');
    });

    it('should return an object with expected properties', () => {
      const { result } = renderHook(() => useFriendshipStatus('user123'));

      expect(result.current).toHaveProperty('status');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should handle empty userId', () => {
      const { result } = renderHook(() => useFriendshipStatus(''));
      expect(result.current.status).toBeNull();
    });
  });

  describe('useUserSearch', () => {
    it('should be a function', () => {
      expect(typeof useUserSearch).toBe('function');
    });

    it('should return an object with expected properties', () => {
      const { result } = renderHook(() => useUserSearch());

      expect(result.current).toHaveProperty('users');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('search');
      expect(result.current).toHaveProperty('hasNextPage');
      expect(result.current).toHaveProperty('loadMore');
      expect(result.current).toHaveProperty('totalCount');
    });

    it('should handle empty search term', async () => {
      const { result } = renderHook(() => useUserSearch());

      const searchResult = await result.current.search('');
      expect(searchResult).toEqual({ data: { searchUsers: { edges: [], totalCount: 0 } } });
      expect(result.current.users).toEqual([]);
    });
  });

  describe('useFriendshipMutations', () => {
    it('should be a function', () => {
      expect(typeof useFriendshipMutations).toBe('function');
    });

    it('should return an object with expected properties', () => {
      const { result } = renderHook(() => useFriendshipMutations());

      expect(result.current).toHaveProperty('sendFriendRequest');
      expect(result.current).toHaveProperty('acceptFriendRequest');
      expect(result.current).toHaveProperty('rejectFriendRequest');
      expect(result.current).toHaveProperty('removeFriend');
      expect(result.current).toHaveProperty('loading');
    });
  });
});
