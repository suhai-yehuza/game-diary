'use client';

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';

import type {
  IGameLog,
  IPaginatedGameLogsOptions,
  IPaginatedGameLogsReturn,
  IGameLogsFiltersState,
} from '@/types';

export function usePaginatedGameLogs({
  userId,
  tab,
  page = 1,
  limit = 20,
  useCountsOnly: _useCountsOnly = false,
  filters = {},
}: IPaginatedGameLogsOptions & {
  useCountsOnly?: boolean;
  filters?: Partial<IGameLogsFiltersState>;
}): IPaginatedGameLogsReturn {
  const [gameLogs, setGameLogs] = useState<IGameLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [cacheInfo, setCacheInfo] = useState({
    cached: false,
    source: 'rest-api',
    hit: false,
    key: '',
    ttl: 300,
    status: 'active',
  });

  // Ref to track if a request is in progress to prevent infinite loops
  const isRequestInProgress = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Clean and validate filters - memoized to prevent infinite loops
  const cleanFilters = useMemo(() => {
    return Object.entries(filters).reduce<Record<string, string | string[]>>(
      (acc, [key, value]) => {
        // Only include non-empty values
        if (value !== '' && value !== null && value !== undefined) {
          // Handle tags array specifically
          if (key === 'tags' && typeof value === 'string') {
            const tagArray = value
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0);
            if (tagArray.length > 0) {
              acc[key] = tagArray.join(',');
            }
          } else {
            acc[key] = value;
          }
        }
        return acc;
      },
      {}
    );
  }, [filters]);

  const fetchGameLogs = useCallback(async () => {
    // Skip if no user and not public logs
    if (!userId && tab !== 'public-logs') {
      console.log('🔍 usePaginatedGameLogs: Skipping fetch - no userId and not public logs', {
        userId,
        tab,
      });
      return;
    }

    // Skip if already making a request to prevent infinite loops
    if (isRequestInProgress.current) {
      console.log('🔍 usePaginatedGameLogs: Skipping fetch - request already in progress');
      return;
    }

    console.log('🔍 usePaginatedGameLogs: Starting fetch', {
      userId,
      tab,
      page,
      limit,
      cleanFilters,
    });

    try {
      isRequestInProgress.current = true;
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        tab,
        page: page.toString(),
        limit: limit.toString(),
        ...cleanFilters,
      });

      // Add user-specific parameters - always pass userId when available
      if (userId) {
        params.set('userId', userId);
      }

      const apiUrl = `/api/game-logs?${params.toString()}`;
      console.log('🔍 usePaginatedGameLogs: Making API request to:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error(
          '🔍 usePaginatedGameLogs: API request failed:',
          response.status,
          response.statusText
        );
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔍 usePaginatedGameLogs: API response:', data);

      if (!data.success) {
        console.error('🔍 usePaginatedGameLogs: API returned error:', data.error);
        throw new Error(data.error || 'Failed to fetch game logs');
      }

      setGameLogs(data.gameLogs || []);
      setPagination(
        data.pagination || {
          page,
          limit,
          totalCount: 0,
          totalPages: 0,
        }
      );
      setCacheInfo(
        data.cacheInfo || {
          cached: false,
          source: 'rest-api',
          hit: false,
          key: '',
          ttl: 300,
          status: 'active',
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch game logs';
      setError(errorMessage);
      console.error('Error fetching game logs:', err);
    } finally {
      setLoading(false);
      isRequestInProgress.current = false;
    }
  }, [userId, tab, page, limit, cleanFilters]);

  // Fetch game logs when parameters change with debouncing
  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new timeout to debounce the request
    debounceTimeout.current = setTimeout(() => {
      void fetchGameLogs();
    }, 100); // 100ms debounce

    // Cleanup function
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [fetchGameLogs]);

  // Note: Removed global event listener to prevent page reloads
  // Cache updates should handle UI updates automatically

  const setPage = useCallback((_newPage: number) => {
    // Page is managed by the component, this is just for compatibility
  }, []);

  const setLimit = useCallback((_newLimit: number) => {
    // Limit is managed by the component, this is just for compatibility
  }, []);

  const setTab = useCallback((_newTab: 'my-logs' | 'friends-logs' | 'public-logs') => {
    // Tab is managed by the component, this is just for compatibility
  }, []);

  const refetch = useCallback(() => {
    void fetchGameLogs();
  }, [fetchGameLogs]);

  return {
    gameLogs,
    loading,
    error,
    pagination,
    cacheInfo,
    setPage,
    setLimit,
    setTab,
    refetch,
  };
}
