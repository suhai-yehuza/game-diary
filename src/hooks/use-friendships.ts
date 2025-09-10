import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

import { useOptimizedMutation } from '@/hooks/use-optimized-mutation';
import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '@/lib/graphql/mutations';
import {
  GET_USER_FRIENDSHIPS,
  GET_FRIENDSHIP_STATUS,
  GET_FRIENDSHIP_REQUESTS,
  SEARCH_USERS,
  GET_FRIENDSHIPS_COUNTS,
  GET_FRIENDSHIPS_WITH_COUNTS,
  GET_FRIENDSHIPS_DETAILED,
  GET_FRIENDSHIP_REQUESTS_COUNTS,
  GET_FRIENDSHIP_REQUESTS_WITH_COUNTS,
  GET_FRIENDSHIP_REQUESTS_DETAILED,
  GET_USER_SEARCH_COUNTS,
  GET_USER_SEARCH_WITH_COUNTS,
  GET_USER_SEARCH_DETAILED,
} from '@/lib/graphql/queries';
import { errorHandlers } from '@/lib/utils/error-handler';
import { ErrorCategory, ErrorSeverity } from '@/types';
import type {
  IFriendship,
  FriendshipFilters,
  IFriendshipStatus,
  IFriendshipStatusType,
  UserSummary,
  IUserFriendshipsResponse,
  IFriendshipStatusResponse,
  IFriendshipRequestsResponse,
  ISearchUsersResponse,
  IFriendshipMutationResponse,
  IRemoveFriendResponse,
  IUseOptimizedFriendshipsOptions,
  IUseOptimizedFriendshipsReturn,
  IUseOptimizedFriendshipRequestsOptions,
  IUseOptimizedFriendshipRequestsReturn,
  IUseOptimizedUserSearchOptions,
  IUseOptimizedUserSearchReturn,
} from '@/types';

// ============================================================================
// BASIC FRIENDSHIP HOOKS (Original functionality)
// ============================================================================

export function useFriendships(filters: FriendshipFilters = {}, options: { skip?: boolean } = {}) {
  const [friendships, setFriendships] = useState<IFriendship[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const hasLoggedWarning = useRef(false);

  // Memoize the onCompleted callback to prevent infinite re-renders
  const onCompleted = useCallback((data: IUserFriendshipsResponse) => {
    if (data?.userFriendships) {
      setFriendships(data.userFriendships.edges.map(edge => edge.node));
      setTotalCount(data.userFriendships.totalCount);
      setEndCursor(data.userFriendships.pageInfo.endCursor ?? null);
      setHasNextPage(!!data.userFriendships.pageInfo.hasNextPage);
    }
  }, []);

  // Memoize the context to prevent query recreation
  const context = useMemo(
    () => ({
      component: 'useFriendships',
      action: 'Load user friendships',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    }),
    []
  );

  const { loading, error, refetch, fetchMore } = useOptimizedQuery<IUserFriendshipsResponse>(
    GET_USER_FRIENDSHIPS,
    {
      variables: { filters, pagination: { first: 10 } },
      context,
      onCompleted,
      skip: options.skip,
    }
  );

  // Log slow queries for performance monitoring (only once per query, after 2 seconds)
  useEffect(() => {
    if (loading && !hasLoggedWarning.current) {
      const timer = setTimeout(() => {
        if (loading) {
          console.warn(`Slow friendships query detected: query is still loading`, { filters });
          hasLoggedWarning.current = true;
        }
      }, 2000); // Wait 2 seconds before warning

      return () => clearTimeout(timer);
    } else if (!loading) {
      hasLoggedWarning.current = false;
    }
  }, [loading, filters]);

  // Create a custom refetch function that forces a network request
  const forceRefetch = useCallback(async () => {
    try {
      const result = await refetch();

      // Manually update the local state with the new data
      const typedResult = result as { data?: IUserFriendshipsResponse };
      if (typedResult.data?.userFriendships) {
        setFriendships(typedResult.data.userFriendships.edges.map(edge => edge.node));
        setTotalCount(typedResult.data.userFriendships.totalCount);
        setEndCursor(typedResult.data.userFriendships.pageInfo.endCursor ?? null);
        setHasNextPage(!!typedResult.data.userFriendships.pageInfo.hasNextPage);
      }

      return result;
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'React Hook',
        action: 'Refetch friendships',
      });
      return null;
    }
  }, [refetch]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            first: 10,
            after: endCursor,
          },
        },
      });

      const typedResult = result as { data?: IUserFriendshipsResponse };
      if (typedResult.data?.userFriendships) {
        const newFriendships = typedResult.data.userFriendships.edges.map(edge => edge.node);
        setFriendships(prev => [...prev, ...newFriendships]);
        setEndCursor(typedResult.data.userFriendships.pageInfo.endCursor ?? null);
        setHasNextPage(!!typedResult.data.userFriendships.pageInfo.hasNextPage);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useFriendships',
        action: 'Load more friendships',
      });
    }
  }, [hasNextPage, endCursor, fetchMore]);

  return {
    friendships,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: forceRefetch,
    hasNextPage,
    loadMore,
    totalCount,
    // Performance metrics
    queryTime: loading,
    isSlowQuery: loading,
  };
}

export function useFriendshipStatus(userId: string) {
  const [status, setStatus] = useState<IFriendshipStatus | null>(null);
  const hasLoggedWarning = useRef(false);

  // Memoize the onCompleted callback to prevent infinite re-renders
  const onCompleted = useCallback((data: IFriendshipStatusResponse) => {
    if (data?.friendshipStatus) {
      setStatus({
        status: data.friendshipStatus.status as IFriendshipStatusType,
        friendshipId: data.friendshipStatus.friendshipId ?? undefined,
        isInitiator: data.friendshipStatus.isInitiator ?? undefined,
      });
    }
  }, []);

  // Memoize the context to prevent query recreation
  const context = useMemo(
    () => ({
      component: 'useFriendshipStatus',
      action: 'Load friendship status',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    }),
    []
  );

  const { loading, error, refetch } = useOptimizedQuery<IFriendshipStatusResponse>(
    GET_FRIENDSHIP_STATUS,
    {
      variables: userId?.trim() ? { userId } : {},
      skip: !userId || userId.trim() === '',
      context,
      onCompleted,
    }
  );

  // Log slow queries for performance monitoring (only once per query)
  if (loading && !hasLoggedWarning.current) {
    console.warn(`Slow friendship status query detected: query is still loading`, { userId });
    hasLoggedWarning.current = true;
  } else if (!loading) {
    hasLoggedWarning.current = false;
  }

  // Create a custom refetch function that forces a network request
  const forceRefetch = useCallback(async () => {
    try {
      const result = await refetch();

      // Update local state with the new data
      const typedResult = result as { data?: IFriendshipStatusResponse };
      if (typedResult.data?.friendshipStatus) {
        setStatus({
          status: typedResult.data.friendshipStatus.status as IFriendshipStatusType,
          friendshipId: typedResult.data.friendshipStatus.friendshipId ?? undefined,
          isInitiator: typedResult.data.friendshipStatus.isInitiator ?? undefined,
        });
      } else {
        // If no friendship status, set to null
        setStatus(null);
      }

      return result;
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'React Hook',
        action: 'Refetch friendship status',
      });
      return null;
    }
  }, [refetch]);

  return {
    status,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: forceRefetch,
    // Performance metrics
    queryTime: loading,
    isSlowQuery: loading,
  };
}

export function useFriendshipRequests(options: { skip?: boolean } = {}) {
  const [requests, setRequests] = useState<IFriendship[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const hasLoggedWarning = useRef(false);

  // Memoize the onCompleted callback to prevent infinite re-renders
  const onCompleted = useCallback((data: IFriendshipRequestsResponse) => {
    if (data?.friendshipRequests) {
      setRequests(data.friendshipRequests.edges.map(edge => edge.node));
      setTotalCount(data.friendshipRequests.totalCount);
      setEndCursor(data.friendshipRequests.pageInfo.endCursor ?? null);
      setHasNextPage(!!data.friendshipRequests.pageInfo.hasNextPage);
    }
  }, []);

  // Memoize the context to prevent query recreation
  const context = useMemo(
    () => ({
      component: 'useFriendshipRequests',
      action: 'Load friendship requests',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    }),
    []
  );

  const { loading, error, refetch, fetchMore } = useOptimizedQuery<IFriendshipRequestsResponse>(
    GET_FRIENDSHIP_REQUESTS,
    {
      variables: { pagination: { first: 10 } },
      context,
      onCompleted,
      skip: options.skip,
    }
  );

  // Log slow queries for performance monitoring (only once per query, after 2 seconds)
  useEffect(() => {
    if (loading && !hasLoggedWarning.current) {
      const timer = setTimeout(() => {
        if (loading) {
          console.warn(`Slow friendship requests query detected: query is still loading`);
          hasLoggedWarning.current = true;
        }
      }, 2000); // Wait 2 seconds before warning

      return () => clearTimeout(timer);
    } else if (!loading) {
      hasLoggedWarning.current = false;
    }
  }, [loading]);

  // Create a custom refetch function that forces a network request
  const forceRefetch = useCallback(async () => {
    try {
      const result = await refetch();

      // Manually update the local state with the new data
      const typedResult = result as { data?: IFriendshipRequestsResponse };
      if (typedResult.data?.friendshipRequests) {
        setRequests(typedResult.data.friendshipRequests.edges.map(edge => edge.node));
        setTotalCount(typedResult.data.friendshipRequests.totalCount);
        setEndCursor(typedResult.data.friendshipRequests.pageInfo.endCursor ?? null);
        setHasNextPage(!!typedResult.data.friendshipRequests.pageInfo.hasNextPage);
      }

      return result;
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'React Hook',
        action: 'Refetch friendship requests',
      });
      return null;
    }
  }, [refetch]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            first: 10,
            after: endCursor,
          },
        },
      });

      const typedResult = result as { data?: IFriendshipRequestsResponse };
      if (typedResult.data?.friendshipRequests) {
        const newRequests = typedResult.data.friendshipRequests.edges.map(edge => edge.node);
        setRequests(prev => [...prev, ...newRequests]);
        setEndCursor(typedResult.data.friendshipRequests.pageInfo.endCursor ?? null);
        setHasNextPage(!!typedResult.data.friendshipRequests.pageInfo.hasNextPage);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useFriendshipRequests',
        action: 'Load more friendship requests',
      });
    }
  }, [hasNextPage, endCursor, fetchMore]);

  return {
    requests,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: forceRefetch,
    hasNextPage,
    loadMore,
    totalCount,
    // Performance metrics
    queryTime: loading,
    isSlowQuery: loading,
  };
}

export function useUserSearch() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const hasLoggedWarning = useRef(false);

  // Memoize the onCompleted callback to prevent infinite re-renders
  const onCompleted = useCallback((data: ISearchUsersResponse) => {
    if (data?.searchUsers) {
      setUsers(data.searchUsers.edges.map(edge => edge.node));
      setTotalCount(data.searchUsers.totalCount);
      setEndCursor(data.searchUsers.pageInfo.endCursor ?? null);
      setHasNextPage(!!data.searchUsers.pageInfo.hasNextPage);
    }
  }, []);

  // Memoize the context to prevent query recreation
  const context = useMemo(
    () => ({
      component: 'useUserSearch',
      action: 'Search users',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    }),
    []
  );

  const { loading, error, refetch, fetchMore } = useOptimizedQuery<ISearchUsersResponse>(
    SEARCH_USERS,
    {
      variables: { searchField: '', pagination: { first: 10 } },
      context,
      onCompleted,
    }
  );

  // Log slow queries for performance monitoring (only once per query, after 2 seconds)
  useEffect(() => {
    if (loading && !hasLoggedWarning.current) {
      const timer = setTimeout(() => {
        if (loading) {
          console.warn(`Slow user search query detected: query is still loading`);
          hasLoggedWarning.current = true;
        }
      }, 2000); // Wait 2 seconds before warning

      return () => clearTimeout(timer);
    } else if (!loading) {
      hasLoggedWarning.current = false;
    }
  }, [loading]);

  const search = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setUsers([]);
        return { data: { searchUsers: { edges: [], totalCount: 0 } } };
      }

      const startTime = performance.now();

      try {
        const result = await refetch();

        const endTime = performance.now();
        const queryTime = endTime - startTime;

        // Log slow queries for performance monitoring
        if (queryTime > 1000) {
          // Log if query takes more than 1 second
          console.warn(
            `Slow user search query detected: ${queryTime.toFixed(2)}ms for term: "${searchTerm}"`
          );
        }

        const typedResult = result as { data?: ISearchUsersResponse };
        if (typedResult.data?.searchUsers) {
          setUsers(typedResult.data.searchUsers.edges.map(edge => edge.node));
          setTotalCount(typedResult.data.searchUsers.totalCount);
          setEndCursor(typedResult.data.searchUsers.pageInfo.endCursor ?? null);
          setHasNextPage(!!typedResult.data.searchUsers.pageInfo.hasNextPage);
        }

        return result;
      } catch (err) {
        const endTime = performance.now();
        const queryTime = endTime - startTime;
        console.error(`Error searching users after ${queryTime.toFixed(2)}ms:`, err);
        return { data: { searchUsers: { edges: [], totalCount: 0 } } };
      }
    },
    [refetch]
  );

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            first: 10,
            after: endCursor,
          },
        },
      });

      const typedResult = result as { data?: ISearchUsersResponse };
      if (typedResult.data?.searchUsers) {
        const newUsers = typedResult.data.searchUsers.edges.map(edge => edge.node);
        setUsers(prev => [...prev, ...newUsers]);
        setEndCursor(typedResult.data.searchUsers.pageInfo.endCursor ?? null);
        setHasNextPage(!!typedResult.data.searchUsers.pageInfo.hasNextPage);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useUserSearch',
        action: 'Load more users',
      });
    }
  }, [hasNextPage, endCursor, fetchMore]);

  return {
    users,
    loading,
    error: error ? new Error(error.message) : null,
    search,
    hasNextPage,
    loadMore,
    totalCount,
    // Performance metrics
    queryTime: loading,
    isSlowQuery: loading,
  };
}

export function useFriendRequestMutations() {
  const [sendFriendRequest, { loading: sendLoading, error: sendError }] = useOptimizedMutation<{
    sendFriendRequest?: IFriendshipMutationResponse;
  }>(SEND_FRIEND_REQUEST, {
    context: {
      component: 'useFriendRequestMutations',
      action: 'Send friend request',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
  });

  const [acceptFriendRequest, { loading: acceptLoading, error: acceptError }] =
    useOptimizedMutation<{
      acceptFriendRequest?: IFriendshipMutationResponse;
    }>(ACCEPT_FRIEND_REQUEST, {
      context: {
        component: 'useFriendRequestMutations',
        action: 'Accept friend request',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
    });

  const [rejectFriendRequest, { loading: rejectLoading, error: rejectError }] =
    useOptimizedMutation<{
      rejectFriendRequest?: IFriendshipMutationResponse;
    }>(REJECT_FRIEND_REQUEST, {
      context: {
        component: 'useFriendRequestMutations',
        action: 'Reject friend request',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
    });

  const [removeFriend, { loading: removeLoading, error: removeError }] = useOptimizedMutation<{
    removeFriend?: IRemoveFriendResponse;
  }>(REMOVE_FRIEND, {
    context: {
      component: 'useFriendRequestMutations',
      action: 'Remove friend',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
  });

  return {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    loading: sendLoading || acceptLoading || rejectLoading || removeLoading,
    error: sendError || acceptError || rejectError || removeError,
  };
}

// ============================================================================
// OPTIMIZED FRIENDSHIP HOOKS (Performance-optimized versions)
// ============================================================================

export function useOptimizedFriendships(
  filters: FriendshipFilters = {},
  options: IUseOptimizedFriendshipsOptions = {}
): IUseOptimizedFriendshipsReturn {
  const [friendships, setFriendships] = useState<IFriendship[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const hasLoggedWarning = useRef(false);

  const { limit = 10, skip: _skip = false, useCountsOnly = false, useDetailed = false } = options;

  // Choose the appropriate query based on options
  const query = useMemo(() => {
    if (useCountsOnly) return GET_FRIENDSHIPS_COUNTS;
    if (useDetailed) return GET_FRIENDSHIPS_DETAILED;
    return GET_FRIENDSHIPS_WITH_COUNTS;
  }, [useCountsOnly, useDetailed]);

  // Memoize the onCompleted callback to prevent infinite re-renders
  const onCompleted = useCallback(
    (data: IUserFriendshipsResponse) => {
      if (data?.userFriendships) {
        if (useCountsOnly) {
          setTotalCount(data.userFriendships.totalCount);
        } else {
          setFriendships(data.userFriendships.edges.map(edge => edge.node));
          setTotalCount(data.userFriendships.totalCount);
          setEndCursor(data.userFriendships.pageInfo.endCursor ?? null);
          setHasNextPage(!!data.userFriendships.pageInfo.hasNextPage);
        }
      }
    },
    [useCountsOnly]
  );

  // Memoize the context to prevent query recreation
  const context = useMemo(
    () => ({
      component: 'useOptimizedFriendships',
      action: 'Load optimized friendships',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    }),
    []
  );

  const { loading, error, refetch, fetchMore } = useOptimizedQuery<IUserFriendshipsResponse>(
    query,
    {
      variables: {
        filters,
        pagination: useCountsOnly ? { first: 1 } : { first: limit },
      },
      context,
      onCompleted,
      skip: _skip || useCountsOnly,
    }
  );

  // Log slow queries for performance monitoring (only once per query, after 2 seconds)
  useEffect(() => {
    if (loading && !hasLoggedWarning.current) {
      const timer = setTimeout(() => {
        if (loading) {
          console.warn(`Slow optimized friendships query detected: query is still loading`, {
            filters,
          });
          hasLoggedWarning.current = true;
        }
      }, 2000); // Wait 2 seconds before warning

      return () => clearTimeout(timer);
    } else if (!loading) {
      hasLoggedWarning.current = false;
    }
  }, [loading, filters]);

  // Create a custom refetch function that forces a network request
  const forceRefetch = useCallback(async () => {
    try {
      const result = await refetch();

      // Manually update the local state with the new data
      const typedResult = result as { data?: IUserFriendshipsResponse };
      if (typedResult.data?.userFriendships) {
        if (useCountsOnly) {
          setTotalCount(typedResult.data.userFriendships.totalCount);
        } else {
          setFriendships(typedResult.data.userFriendships.edges.map(edge => edge.node));
          setTotalCount(typedResult.data.userFriendships.totalCount);
          setEndCursor(typedResult.data.userFriendships.pageInfo.endCursor ?? null);
          setHasNextPage(!!typedResult.data.userFriendships.pageInfo.hasNextPage);
        }
      }

      return result;
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useOptimizedFriendships',
        action: 'Refetch optimized friendships',
      });
      return null;
    }
  }, [refetch, useCountsOnly]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor || useCountsOnly) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            first: limit,
            after: endCursor,
          },
        },
      });

      const typedResult = result as { data?: IUserFriendshipsResponse };
      if (typedResult.data?.userFriendships) {
        const newFriendships = typedResult.data.userFriendships.edges.map(edge => edge.node);
        setFriendships(prev => [...prev, ...newFriendships]);
        setEndCursor(typedResult.data.userFriendships.pageInfo.endCursor ?? null);
        setHasNextPage(!!typedResult.data.userFriendships.pageInfo.hasNextPage);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useOptimizedFriendships',
        action: 'Load more optimized friendships',
      });
    }
  }, [hasNextPage, endCursor, fetchMore, limit, useCountsOnly]);

  return {
    friendships,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: forceRefetch,
    hasNextPage,
    loadMore,
    totalCount,
    // Performance metrics
    queryTime: loading,
    isSlowQuery: loading,
  };
}

export function useOptimizedFriendshipRequests(
  options: IUseOptimizedFriendshipRequestsOptions = {}
): IUseOptimizedFriendshipRequestsReturn {
  const [requests, setRequests] = useState<IFriendship[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const hasLoggedWarning = useRef(false);

  const { limit = 10, skip: _skip = false, useCountsOnly = false, useDetailed = false } = options;

  // Choose the appropriate query based on options
  const query = useMemo(() => {
    if (useCountsOnly) return GET_FRIENDSHIP_REQUESTS_COUNTS;
    if (useDetailed) return GET_FRIENDSHIP_REQUESTS_DETAILED;
    return GET_FRIENDSHIP_REQUESTS_WITH_COUNTS;
  }, [useCountsOnly, useDetailed]);

  // Memoize the onCompleted callback to prevent infinite re-renders
  const onCompleted = useCallback(
    (data: IFriendshipRequestsResponse) => {
      if (data?.friendshipRequests) {
        if (useCountsOnly) {
          setTotalCount(data.friendshipRequests.totalCount);
        } else {
          setRequests(data.friendshipRequests.edges.map(edge => edge.node));
          setTotalCount(data.friendshipRequests.totalCount);
          setEndCursor(data.friendshipRequests.pageInfo.endCursor ?? null);
          setHasNextPage(!!data.friendshipRequests.pageInfo.hasNextPage);
        }
      }
    },
    [useCountsOnly]
  );

  // Memoize the context to prevent query recreation
  const context = useMemo(
    () => ({
      component: 'useOptimizedFriendshipRequests',
      action: 'Load optimized friendship requests',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    }),
    []
  );

  const { loading, error, refetch, fetchMore } = useOptimizedQuery<IFriendshipRequestsResponse>(
    query,
    {
      variables: {
        pagination: useCountsOnly ? { first: 1 } : { first: limit },
      },
      context,
      onCompleted,
      skip: _skip || useCountsOnly,
    }
  );

  // Log slow queries for performance monitoring (only once per query, after 2 seconds)
  useEffect(() => {
    if (loading && !hasLoggedWarning.current) {
      const timer = setTimeout(() => {
        if (loading) {
          console.warn(`Slow optimized friendship requests query detected: query is still loading`);
          hasLoggedWarning.current = true;
        }
      }, 2000); // Wait 2 seconds before warning

      return () => clearTimeout(timer);
    } else if (!loading) {
      hasLoggedWarning.current = false;
    }
  }, [loading]);

  // Create a custom refetch function that forces a network request
  const forceRefetch = useCallback(async () => {
    try {
      const result = await refetch();

      // Manually update the local state with the new data
      const typedResult = result as { data?: IFriendshipRequestsResponse };
      if (typedResult.data?.friendshipRequests) {
        if (useCountsOnly) {
          setTotalCount(typedResult.data.friendshipRequests.totalCount);
        } else {
          setRequests(typedResult.data.friendshipRequests.edges.map(edge => edge.node));
          setTotalCount(typedResult.data.friendshipRequests.totalCount);
          setEndCursor(typedResult.data.friendshipRequests.pageInfo.endCursor ?? null);
          setHasNextPage(!!typedResult.data.friendshipRequests.pageInfo.hasNextPage);
        }
      }

      return result;
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useOptimizedFriendshipRequests',
        action: 'Refetch optimized friendship requests',
      });
      return null;
    }
  }, [refetch, useCountsOnly]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor || useCountsOnly) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            first: limit,
            after: endCursor,
          },
        },
      });

      const typedResult = result as { data?: IFriendshipRequestsResponse };
      if (typedResult.data?.friendshipRequests) {
        const newRequests = typedResult.data.friendshipRequests.edges.map(edge => edge.node);
        setRequests(prev => [...prev, ...newRequests]);
        setEndCursor(typedResult.data.friendshipRequests.pageInfo.endCursor ?? null);
        setHasNextPage(!!typedResult.data.friendshipRequests.pageInfo.hasNextPage);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useOptimizedFriendshipRequests',
        action: 'Load more optimized friendship requests',
      });
    }
  }, [hasNextPage, endCursor, fetchMore, limit, useCountsOnly]);

  return {
    requests,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: forceRefetch,
    hasNextPage,
    loadMore,
    totalCount,
    // Performance metrics
    queryTime: loading,
    isSlowQuery: loading,
  };
}

export function useOptimizedUserSearch(
  options: IUseOptimizedUserSearchOptions = {}
): IUseOptimizedUserSearchReturn {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const hasLoggedWarning = useRef(false);

  const { limit = 10, skip: _skip = false, useCountsOnly = false, useDetailed = false } = options;

  // Choose the appropriate query based on options
  const query = useMemo(() => {
    if (useCountsOnly) return GET_USER_SEARCH_COUNTS;
    if (useDetailed) return GET_USER_SEARCH_DETAILED;
    return GET_USER_SEARCH_WITH_COUNTS;
  }, [useCountsOnly, useDetailed]);

  // Memoize the onCompleted callback to prevent infinite re-renders
  const onCompleted = useCallback(
    (data: ISearchUsersResponse) => {
      if (data?.searchUsers) {
        if (useCountsOnly) {
          setTotalCount(data.searchUsers.totalCount);
        } else {
          setUsers(data.searchUsers.edges.map(edge => edge.node));
          setTotalCount(data.searchUsers.totalCount);
          setEndCursor(data.searchUsers.pageInfo.endCursor ?? null);
          setHasNextPage(!!data.searchUsers.pageInfo.hasNextPage);
        }
      }
    },
    [useCountsOnly]
  );

  // Memoize the context to prevent query recreation
  const context = useMemo(
    () => ({
      component: 'useOptimizedUserSearch',
      action: 'Search optimized users',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    }),
    []
  );

  const { loading, error, refetch, fetchMore } = useOptimizedQuery<ISearchUsersResponse>(query, {
    variables: {
      searchTerm: '',
      searchField: 'all',
      pagination: useCountsOnly ? { first: 1 } : { first: limit },
    },
    context,
    onCompleted,
    skip: true, // Always skip initial query, use search function instead
  });

  // Log slow queries for performance monitoring (only once per query, after 2 seconds)
  useEffect(() => {
    if (loading && !hasLoggedWarning.current) {
      const timer = setTimeout(() => {
        if (loading) {
          console.warn(`Slow optimized user search query detected: query is still loading`);
          hasLoggedWarning.current = true;
        }
      }, 2000); // Wait 2 seconds before warning

      return () => clearTimeout(timer);
    } else if (!loading) {
      hasLoggedWarning.current = false;
    }
  }, [loading]);

  const search = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setUsers([]);
        setTotalCount(0);
        return;
      }

      const startTime = performance.now();

      try {
        const result = await refetch();

        const endTime = performance.now();
        const queryTime = endTime - startTime;

        // Log slow queries for performance monitoring
        if (queryTime > 1000) {
          // Log if query takes more than 1 second
          console.warn(
            `Slow optimized user search query detected: ${queryTime.toFixed(2)}ms for term: "${searchTerm}"`
          );
        }

        const typedResult = result as { data?: ISearchUsersResponse };
        if (typedResult.data?.searchUsers) {
          if (useCountsOnly) {
            setTotalCount(typedResult.data.searchUsers.totalCount);
          } else {
            setUsers(typedResult.data.searchUsers.edges.map(edge => edge.node));
            setTotalCount(typedResult.data.searchUsers.totalCount);
            setEndCursor(typedResult.data.searchUsers.pageInfo.endCursor ?? null);
            setHasNextPage(!!typedResult.data.searchUsers.pageInfo.hasNextPage);
          }
        }
      } catch (err) {
        const endTime = performance.now();
        const queryTime = endTime - startTime;
        console.error(`Error searching users after ${queryTime.toFixed(2)}ms:`, err);
        errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
          component: 'useOptimizedUserSearch',
          action: 'Search users',
        });
      }
    },
    [refetch, useCountsOnly]
  );

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor || useCountsOnly) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            first: limit,
            after: endCursor,
          },
        },
      });

      const typedResult = result as { data?: ISearchUsersResponse };
      if (typedResult.data?.searchUsers) {
        const newUsers = typedResult.data.searchUsers.edges.map(edge => edge.node);
        setUsers(prev => [...prev, ...newUsers]);
        setEndCursor(typedResult.data.searchUsers.pageInfo.endCursor ?? null);
        setHasNextPage(!!typedResult.data.searchUsers.pageInfo.hasNextPage);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useOptimizedUserSearch',
        action: 'Load more optimized users',
      });
    }
  }, [hasNextPage, endCursor, fetchMore, limit, useCountsOnly]);

  return {
    users,
    loading,
    error: error ? new Error(error.message) : null,
    search,
    hasNextPage,
    loadMore,
    totalCount,
    // Performance metrics
    queryTime: loading,
    isSlowQuery: loading,
  };
}
