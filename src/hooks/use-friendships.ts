import { useQuery, useMutation } from '@apollo/client';
import { useState, useCallback } from 'react';

import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '@/lib/graphql/mutations';
import {
  GET_USER_FRIENDSHIPS,
  GET_FRIENDSHIP_REQUESTS,
  GET_FRIENDSHIP_STATUS,
  SEARCH_USERS,
} from '@/lib/graphql/queries';
import type {
  IFriendship,
  IFriendshipFilters,
  IFriendshipStatus,
  IUserSummaryBasic,
  IUserFriendshipsResponse,
  IFriendshipRequestsResponse,
  IFriendshipStatusResponse,
  IGraphQLSearchUsersResponse,
  ISendFriendRequestResponse,
  IAcceptFriendRequestResponse,
  IRejectFriendRequestResponse,
  IRemoveFriendResponse,
} from '@/lib/types/hooks.types';

export function useFriendships(filters: IFriendshipFilters = {}) {
  const [friendships, setFriendships] = useState<IFriendship[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { loading, error, refetch, fetchMore } = useQuery<IUserFriendshipsResponse>(
    GET_USER_FRIENDSHIPS,
    {
      variables: { filters, pagination: { first: 10 } },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      onCompleted: data => {
        if (data?.userFriendships) {
          setFriendships(data.userFriendships.edges.map(edge => edge.node));
          setTotalCount(data.userFriendships.totalCount);
          setEndCursor(data.userFriendships.pageInfo.endCursor ?? null);
          setHasNextPage(!!data.userFriendships.pageInfo.hasNextPage);
        }
      },
    }
  );

  // Create a custom refetch function that forces a network request
  const forceRefetch = useCallback(async () => {
    try {
      const result = await refetch({
        fetchPolicy: 'network-only', // Force network request
      });

      // Manually update the local state with the new data
      if (result.data?.userFriendships) {
        setFriendships(result.data.userFriendships.edges.map(edge => edge.node));
        setTotalCount(result.data.userFriendships.totalCount);
        setEndCursor(result.data.userFriendships.pageInfo.endCursor ?? null);
        setHasNextPage(!!result.data.userFriendships.pageInfo.hasNextPage);
      }

      return result;
    } catch (error) {
      console.error('Error refetching friendships:', error);
      return null;
    }
  }, [refetch]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading || !endCursor) return;

    try {
      const result = await fetchMore({
        variables: {
          filters,
          pagination: { first: 10, after: endCursor },
        },
      });

      if (result.data?.userFriendships) {
        const newFriendships = result.data.userFriendships.edges.map(edge => edge.node);
        const existingIds = new Set(friendships.map(f => f.id));
        const uniqueNewFriendships = newFriendships.filter(f => !existingIds.has(f.id));

        setFriendships(prev => [...prev, ...uniqueNewFriendships]);
        setEndCursor(result.data.userFriendships.pageInfo.endCursor ?? null);
        setHasNextPage(!!result.data.userFriendships.pageInfo.hasNextPage);
      }
    } catch (err) {
      console.error('Error loading more friendships:', err);
    }
  }, [fetchMore, filters, endCursor, hasNextPage, loading, friendships]);

  return {
    friendships,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: forceRefetch,
    hasNextPage,
    loadMore,
    totalCount,
  };
}

export function useFriendshipRequests() {
  const [requests, setRequests] = useState<IFriendship[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { loading, error, refetch, fetchMore } = useQuery<IFriendshipRequestsResponse>(
    GET_FRIENDSHIP_REQUESTS,
    {
      variables: { pagination: { first: 10 } },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      onCompleted: data => {
        if (data?.friendshipRequests) {
          setRequests(data.friendshipRequests.edges.map(edge => edge.node));
          setTotalCount(data.friendshipRequests.totalCount);
          setEndCursor(data.friendshipRequests.pageInfo.endCursor ?? null);
          setHasNextPage(!!data.friendshipRequests.pageInfo.hasNextPage);
        }
      },
    }
  );

  // Create a custom refetch function that forces a network request
  const forceRefetch = useCallback(async () => {
    try {
      const result = await refetch({
        fetchPolicy: 'network-only', // Force network request
      });

      // Manually update the local state with the new data
      if (result.data?.friendshipRequests) {
        setRequests(result.data.friendshipRequests.edges.map(edge => edge.node));
        setTotalCount(result.data.friendshipRequests.totalCount);
        setEndCursor(result.data.friendshipRequests.pageInfo.endCursor ?? null);
        setHasNextPage(!!result.data.friendshipRequests.pageInfo.hasNextPage);
      }

      return result;
    } catch (error) {
      console.error('Error refetching friendship requests:', error);
      return null;
    }
  }, [refetch]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading || !endCursor) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: { first: 10, after: endCursor },
        },
      });

      if (result.data?.friendshipRequests) {
        const newRequests = result.data.friendshipRequests.edges.map(edge => edge.node);
        const existingIds = new Set(requests.map(r => r.id));
        const uniqueNewRequests = newRequests.filter(r => !existingIds.has(r.id));

        setRequests(prev => [...prev, ...uniqueNewRequests]);
        setEndCursor(result.data.friendshipRequests.pageInfo.endCursor ?? null);
        setHasNextPage(!!result.data.friendshipRequests.pageInfo.hasNextPage);
      }
    } catch (err) {
      console.error('Error loading more requests:', err);
    }
  }, [fetchMore, endCursor, hasNextPage, loading, requests]);

  return {
    requests,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: forceRefetch,
    hasNextPage,
    loadMore,
    totalCount,
  };
}

export function useFriendshipStatus(userId: string) {
  const [status, setStatus] = useState<IFriendshipStatus | null>(null);

  const { loading, error, refetch } = useQuery<IFriendshipStatusResponse>(GET_FRIENDSHIP_STATUS, {
    variables: userId?.trim() ? { userId } : {},
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    skip: !userId || userId.trim() === '',
    onCompleted: data => {
      if (data?.friendshipStatus) {
        setStatus({
          status: data.friendshipStatus.status,
          friendshipId: data.friendshipStatus.friendshipId,
          isInitiator: data.friendshipStatus.isInitiator,
        });
      }
    },
  });

  // Create a custom refetch function that forces a network request
  const forceRefetch = useCallback(async () => {
    try {
      const result = await refetch({
        fetchPolicy: 'network-only', // Force network request
      });

      // Update local state with the new data
      if (result.data?.friendshipStatus) {
        setStatus({
          status: result.data.friendshipStatus.status,
          friendshipId: result.data.friendshipStatus.friendshipId,
          isInitiator: result.data.friendshipStatus.isInitiator,
        });
      } else {
        // If no friendship status, set to null
        setStatus(null);
      }

      return result;
    } catch (error) {
      console.error('Error refetching friendship status:', error);
      return null;
    }
  }, [refetch]);

  return {
    status,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: forceRefetch,
  };
}

export function useUserSearch() {
  const [users, setUsers] = useState<IUserSummaryBasic[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { loading, error, refetch, fetchMore } = useQuery<IGraphQLSearchUsersResponse>(
    SEARCH_USERS,
    {
      variables: { searchField: '', pagination: { first: 10 } },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      skip: true, // Only run when search is triggered
      onCompleted: data => {
        if (data?.searchUsers) {
          setUsers(data.searchUsers.edges.map(edge => edge.node));
          setTotalCount(data.searchUsers.totalCount);
          setEndCursor(data.searchUsers.pageInfo.endCursor ?? null);
          setHasNextPage(!!data.searchUsers.pageInfo.hasNextPage);
        }
      },
    }
  );

  const search = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setUsers([]);
        return { data: { searchUsers: { edges: [], totalCount: 0 } } };
      }

      try {
        const result = await refetch({
          searchTerm: searchTerm,
          searchField: 'all',
          pagination: { first: 10 },
        });

        if (result.data?.searchUsers) {
          setUsers(result.data.searchUsers.edges.map(edge => edge.node));
          setTotalCount(result.data.searchUsers.totalCount);
          setEndCursor(result.data.searchUsers.pageInfo.endCursor ?? null);
          setHasNextPage(!!result.data.searchUsers.pageInfo.hasNextPage);
        }

        return result;
      } catch (err) {
        console.error('Error searching users:', err);
        return { data: { searchUsers: { edges: [], totalCount: 0 } } };
      }
    },
    [refetch]
  );

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading || !endCursor) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: { first: 10, after: endCursor },
        },
      });

      if (result.data?.searchUsers) {
        const newUsers = result.data.searchUsers.edges.map(edge => edge.node);
        const existingIds = new Set(users.map(u => u.id));
        const uniqueNewUsers = newUsers.filter(u => !existingIds.has(u.id));

        setUsers(prev => [...prev, ...uniqueNewUsers]);
        setEndCursor(result.data.searchUsers.pageInfo.endCursor ?? null);
        setHasNextPage(!!result.data.searchUsers.pageInfo.hasNextPage);
      }
    } catch (err) {
      console.error('Error loading more users:', err);
    }
  }, [fetchMore, endCursor, hasNextPage, loading, users]);

  return {
    users,
    loading,
    error: error ? new Error(error.message) : null,
    search,
    hasNextPage,
    loadMore,
    totalCount,
  };
}

export function useFriendshipMutations() {
  const [sendFriendRequest] = useMutation<ISendFriendRequestResponse>(SEND_FRIEND_REQUEST);
  const [acceptFriendRequest] = useMutation<IAcceptFriendRequestResponse>(ACCEPT_FRIEND_REQUEST);
  const [rejectFriendRequest] = useMutation<IRejectFriendRequestResponse>(REJECT_FRIEND_REQUEST);
  const [removeFriend] = useMutation<IRemoveFriendResponse>(REMOVE_FRIEND);

  const sendRequest = useCallback(
    async (friendId: string) => {
      const result = await sendFriendRequest({
        variables: { userId: friendId },
      });

      const response = result.data?.sendFriendRequest;

      // Check if the response has errors
      if (response?.errors && Array.isArray(response.errors) && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      return response;
    },
    [sendFriendRequest]
  );

  const acceptRequest = useCallback(
    async (friendshipId: string) => {
      const result = await acceptFriendRequest({ variables: { friendshipId } });

      const response = result.data?.acceptFriendRequest;

      // Check if the response has errors
      if (response?.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      return response;
    },
    [acceptFriendRequest]
  );

  const rejectRequest = useCallback(
    async (friendshipId: string) => {
      const result = await rejectFriendRequest({ variables: { friendshipId } });

      const response = result.data?.rejectFriendRequest;

      // Check if the response has errors
      if (response?.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      return response;
    },
    [rejectFriendRequest]
  );

  const removeFriendAction = useCallback(
    async (friendshipId: string) => {
      const result = await removeFriend({
        variables: { friendshipId },
      });

      const response = result.data?.removeFriend;

      // Check if the response has errors
      if (response?.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      return response;
    },
    [removeFriend]
  );

  return {
    sendFriendRequest: sendRequest,
    acceptFriendRequest: acceptRequest,
    rejectFriendRequest: rejectRequest,
    removeFriend: removeFriendAction,
    loading: false, // Individual loading states would need separate tracking
  };
}
