import { useQuery, useMutation } from '@apollo/client';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  useFriendships,
  useFriendshipRequests,
  useFriendshipStatus,
  useUserSearch,
  useFriendshipMutations,
} from '@/hooks/use-friendships';

// Mock error handlers
vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
  },
}));

// Mock Apollo Client
vi.mock('@apollo/client', () => {
  const mockUseQuery = vi.fn();
  const mockUseMutation = vi.fn();
  const mockGql = vi.fn(() => '');

  return {
    useQuery: mockUseQuery,
    useMutation: mockUseMutation,
    gql: mockGql,
  };
});

describe('Friendship Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useFriendships', () => {
    it('should be a function', () => {
      expect(typeof useFriendships).toBe('function');
    });

    it('should return an object with expected properties', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendships());

      expect(result.current).toHaveProperty('friendships');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('totalCount');
      expect(result.current).toHaveProperty('hasNextPage');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('loadMore');
    });

    it('should accept filters parameter', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      renderHook(() => useFriendships({ status: 'accepted' }));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          variables: {
            filters: { status: 'accepted' },
            pagination: { first: 10 },
          },
        })
      );
    });

    it('should handle error state', () => {
      const mockError = new Error('Test error');
      (useQuery as any).mockReturnValue({
        loading: false,
        error: mockError,
        data: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendships());

      expect(result.current.error).toStrictEqual(mockError);
    });

    it('should handle loading state', () => {
      (useQuery as any).mockReturnValue({
        loading: true,
        error: null,
        data: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendships());

      expect(result.current.loading).toBe(true);
    });

    it('should handle refetch with network-only policy', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({
        data: {
          userFriendships: {
            edges: [{ node: { id: '1', status: 'accepted' } }],
            totalCount: 1,
            pageInfo: { endCursor: 'cursor1', hasNextPage: false },
          },
        },
      });

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: mockRefetch,
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendships());

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalledWith({
        fetchPolicy: 'network-only',
      });
    });

    it('should handle refetch error', async () => {
      const { errorHandlers } = await import('@/lib/utils/error-handler');
      const mockErrorHandlers = vi.mocked(errorHandlers);
      const mockRefetch = vi.fn().mockRejectedValue(new Error('Refetch failed'));

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: mockRefetch,
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendships());

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockErrorHandlers.api).toHaveBeenCalledWith(expect.any(Error), {
        component: 'React Hook',
        action: 'Refetch friendships',
      });
    });

    it('should handle loadMore functionality', async () => {
      const mockFetchMore = vi.fn().mockResolvedValue({
        data: {
          userFriendships: {
            edges: [{ node: { id: '2', status: 'accepted' } }],
            pageInfo: { endCursor: 'cursor2', hasNextPage: false },
          },
        },
      });

      // Mock initial data to set up internal state
      const mockData = {
        userFriendships: {
          edges: [{ node: { id: '1', status: 'accepted' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: true },
        },
      };

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useFriendships());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockFetchMore).toHaveBeenCalledWith({
        variables: {
          filters: {},
          pagination: { first: 10, after: 'cursor1' },
        },
      });
    });

    it('should not loadMore when hasNextPage is false', async () => {
      const mockFetchMore = vi.fn();

      // Mock data with hasNextPage: false
      const mockData = {
        userFriendships: {
          edges: [{ node: { id: '1', status: 'accepted' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: false },
        },
      };

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useFriendships());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockFetchMore).not.toHaveBeenCalled();
    });

    it('should not loadMore when loading is true', async () => {
      const mockFetchMore = vi.fn();

      (useQuery as any).mockReturnValue({
        loading: true,
        error: null,
        data: null,
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useFriendships());

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockFetchMore).not.toHaveBeenCalled();
    });

    it('should handle loadMore error', async () => {
      const { errorHandlers } = await import('@/lib/utils/error-handler');
      const mockErrorHandlers = vi.mocked(errorHandlers);
      const mockFetchMore = vi.fn().mockRejectedValue(new Error('Load more failed'));

      // Mock initial data to set up internal state
      const mockData = {
        userFriendships: {
          edges: [{ node: { id: '1', status: 'accepted' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: true },
        },
      };

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useFriendships());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockErrorHandlers.api).toHaveBeenCalledWith(expect.any(Error), {
        component: 'React Hook',
        action: 'Load more friendships',
      });
    });
  });

  describe('useFriendshipRequests', () => {
    it('should be a function', () => {
      expect(typeof useFriendshipRequests).toBe('function');
    });

    it('should return an object with expected properties', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendshipRequests());

      expect(result.current).toHaveProperty('requests');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('totalCount');
      expect(result.current).toHaveProperty('hasNextPage');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('loadMore');
    });

    it('should handle refetch with network-only policy', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({
        data: {
          friendshipRequests: {
            edges: [{ node: { id: '1', status: 'pending' } }],
            totalCount: 1,
            pageInfo: { endCursor: 'cursor1', hasNextPage: false },
          },
        },
      });

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: mockRefetch,
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendshipRequests());

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalledWith({
        fetchPolicy: 'network-only',
      });
    });

    it('should handle loadMore functionality', async () => {
      const mockFetchMore = vi.fn().mockResolvedValue({
        data: {
          friendshipRequests: {
            edges: [{ node: { id: '2', status: 'pending' } }],
            pageInfo: { endCursor: 'cursor2', hasNextPage: false },
          },
        },
      });

      // Mock initial data to set up internal state
      const mockData = {
        friendshipRequests: {
          edges: [{ node: { id: '1', status: 'pending' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: true },
        },
      };

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useFriendshipRequests());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockFetchMore).toHaveBeenCalledWith({
        variables: {
          pagination: { first: 10, after: 'cursor1' },
        },
      });
    });
  });

  describe('useFriendshipStatus', () => {
    it('should be a function', () => {
      expect(typeof useFriendshipStatus).toBe('function');
    });

    it('should return an object with expected properties', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useFriendshipStatus('user123'));

      expect(result.current).toHaveProperty('status');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should handle empty userId', () => {
      const { result } = renderHook(() => useFriendshipStatus(''));

      expect(result.current.status).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle refetch with network-only policy', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({
        data: {
          friendshipStatus: { status: 'accepted' },
        },
      });

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useFriendshipStatus('user123'));

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalledWith({
        fetchPolicy: 'network-only',
      });
    });

    it('should handle refetch with null data', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({
        data: null,
      });

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useFriendshipStatus('user123'));

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalledWith({
        fetchPolicy: 'network-only',
      });
    });

    it('should skip query when userId is empty', () => {
      renderHook(() => useFriendshipStatus(''));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          skip: true,
        })
      );
    });
  });

  describe('useUserSearch', () => {
    it('should be a function', () => {
      expect(typeof useUserSearch).toBe('function');
    });

    it('should return an object with expected properties', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useUserSearch());

      expect(result.current).toHaveProperty('users');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('totalCount');
      expect(result.current).toHaveProperty('hasNextPage');
      expect(result.current).toHaveProperty('search');
      expect(result.current).toHaveProperty('loadMore');
    });

    it('should handle empty search term', () => {
      const { result } = renderHook(() => useUserSearch());

      expect(result.current.users).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle successful search', () => {
      const mockData = {
        searchUsers: {
          edges: [{ node: { id: '1', username: 'user1' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: false },
        },
      };

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useUserSearch());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      expect(result.current.users).toEqual([{ id: '1', username: 'user1' }]);
      expect(result.current.totalCount).toBe(1);
      expect(result.current.hasNextPage).toBe(false);
    });

    it('should handle search error', () => {
      const mockError = new Error('Search failed');
      (useQuery as any).mockReturnValue({
        loading: false,
        error: mockError,
        data: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useUserSearch());

      expect(result.current.error).toStrictEqual(mockError);
    });

    it('should handle loadMore functionality', async () => {
      const mockFetchMore = vi.fn().mockResolvedValue({
        data: {
          searchUsers: {
            edges: [{ node: { id: '2', username: 'user2' } }],
            pageInfo: { endCursor: 'cursor2', hasNextPage: false },
          },
        },
      });

      // Mock initial data to set up internal state
      const mockData = {
        searchUsers: {
          edges: [{ node: { id: '1', username: 'user1' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: true },
        },
      };

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useUserSearch());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockFetchMore).toHaveBeenCalledWith({
        variables: {
          pagination: { first: 10, after: 'cursor1' },
        },
      });
    });

    it('should handle search functionality with empty term', async () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useUserSearch());

      await act(async () => {
        const searchResult = await result.current.search('');
        expect(searchResult).toEqual({ data: { searchUsers: { edges: [], totalCount: 0 } } });
        expect(result.current.users).toEqual([]);
      });
    });

    it('should handle search functionality with valid term', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({
        data: {
          searchUsers: {
            edges: [{ node: { id: '1', username: 'user1' } }],
            totalCount: 1,
            pageInfo: { endCursor: 'cursor1', hasNextPage: false },
          },
        },
      });

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: mockRefetch,
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useUserSearch());

      await act(async () => {
        const searchResult = await result.current.search('user1');
        expect(searchResult).toEqual({
          data: {
            searchUsers: {
              edges: [{ node: { id: '1', username: 'user1' } }],
              totalCount: 1,
              pageInfo: { endCursor: 'cursor1', hasNextPage: false },
            },
          },
        });
      });

      // The users state should be updated after the search completes
      expect(result.current.users).toEqual([{ id: '1', username: 'user1' }]);
      expect(mockRefetch).toHaveBeenCalledWith({
        searchTerm: 'user1',
        searchField: 'all',
        pagination: { first: 10 },
      });
    });

    it('should handle search error', async () => {
      const mockRefetch = vi.fn().mockRejectedValue(new Error('Search failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        refetch: mockRefetch,
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useUserSearch());

      await act(async () => {
        const searchResult = await result.current.search('user1');
        expect(searchResult).toEqual({ data: { searchUsers: { edges: [], totalCount: 0 } } });
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error searching users:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle loadMore error', async () => {
      const mockFetchMore = vi.fn().mockRejectedValue(new Error('Load more failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock initial data to set up internal state
      const mockData = {
        searchUsers: {
          edges: [{ node: { id: '1', username: 'user1' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: true },
        },
      };

      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useUserSearch());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error loading more users:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('useFriendshipMutations', () => {
    it('should be a function', () => {
      expect(typeof useFriendshipMutations).toBe('function');
    });

    it('should return an object with expected properties', () => {
      (useMutation as any).mockReturnValue([vi.fn(), { loading: false }]);

      const { result } = renderHook(() => useFriendshipMutations());

      expect(result.current).toHaveProperty('sendFriendRequest');
      expect(result.current).toHaveProperty('acceptFriendRequest');
      expect(result.current).toHaveProperty('rejectFriendRequest');
      expect(result.current).toHaveProperty('removeFriend');
    });

    it('should handle successful sendFriendRequest', async () => {
      const mockSendRequest = vi.fn().mockResolvedValue({
        data: { sendFriendRequest: { success: true } },
      });

      (useMutation as any).mockReturnValue([mockSendRequest, { loading: false }]);

      const { result } = renderHook(() => useFriendshipMutations());

      await act(async () => {
        await result.current.sendFriendRequest('user123');
      });

      expect(mockSendRequest).toHaveBeenCalledWith({ variables: { userId: 'user123' } });
    });

    it('should handle sendFriendRequest with errors', async () => {
      const mockSendRequest = vi.fn().mockResolvedValue({
        data: { sendFriendRequest: { success: false, errors: [{ message: 'Error message' }] } },
      });

      (useMutation as any).mockReturnValue([mockSendRequest, { loading: false }]);

      const { result } = renderHook(() => useFriendshipMutations());

      await act(async () => {
        await expect(result.current.sendFriendRequest('user123')).rejects.toThrow('Error message');
      });

      expect(mockSendRequest).toHaveBeenCalledWith({ variables: { userId: 'user123' } });
    });

    it('should handle successful acceptFriendRequest', async () => {
      const mockAcceptRequest = vi.fn().mockResolvedValue({
        data: { acceptFriendRequest: { success: true } },
      });

      (useMutation as any).mockReturnValue([mockAcceptRequest, { loading: false }]);

      const { result } = renderHook(() => useFriendshipMutations());

      await act(async () => {
        await result.current.acceptFriendRequest('request123');
      });

      expect(mockAcceptRequest).toHaveBeenCalledWith({ variables: { friendshipId: 'request123' } });
    });

    it('should handle acceptFriendRequest with errors', async () => {
      const mockAcceptRequest = vi.fn().mockResolvedValue({
        data: { acceptFriendRequest: { success: false, errors: [{ message: 'Error message' }] } },
      });

      (useMutation as any).mockReturnValue([mockAcceptRequest, { loading: false }]);

      const { result } = renderHook(() => useFriendshipMutations());

      await act(async () => {
        await expect(result.current.acceptFriendRequest('request123')).rejects.toThrow(
          'Error message'
        );
      });

      expect(mockAcceptRequest).toHaveBeenCalledWith({ variables: { friendshipId: 'request123' } });
    });

    it('should handle successful rejectFriendRequest', async () => {
      const mockRejectRequest = vi.fn().mockResolvedValue({
        data: { rejectFriendRequest: { success: true } },
      });

      (useMutation as any).mockReturnValue([mockRejectRequest, { loading: false }]);

      const { result } = renderHook(() => useFriendshipMutations());

      await act(async () => {
        await result.current.rejectFriendRequest('request123');
      });

      expect(mockRejectRequest).toHaveBeenCalledWith({ variables: { friendshipId: 'request123' } });
    });

    it('should handle successful removeFriend', async () => {
      const mockRemoveFriend = vi.fn().mockResolvedValue({
        data: { removeFriend: { success: true } },
      });

      (useMutation as any).mockReturnValue([mockRemoveFriend, { loading: false }]);

      const { result } = renderHook(() => useFriendshipMutations());

      await act(async () => {
        await result.current.removeFriend('user123');
      });

      expect(mockRemoveFriend).toHaveBeenCalledWith({ variables: { friendshipId: 'user123' } });
    });
  });
});
