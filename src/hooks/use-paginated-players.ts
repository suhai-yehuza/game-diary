import { useCallback, useEffect, useState } from 'react';

import type {
  IPlayerResponse,
  IPaginatedPlayersOptions,
  IPaginatedPlayersResponse,
  IPaginatedPlayersReturn,
} from '@/types';

function isMockModeEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.MOCK_MODE === 'true';
}

function isTestOrCIEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST === 'true' ||
    (typeof window !== 'undefined' && Boolean(window.__PLAYWRIGHT_TEST__))
  );
}

export function usePaginatedPlayers(
  options: IPaginatedPlayersOptions = {}
): IPaginatedPlayersReturn {
  const {
    search = '',
    position = 'all',
    year = 'all',
    college = 'all',
    country = 'all',
    sortBy = 'name',
    sortDirection = 'asc',
    page = 1,
    limit = 24,
    skip = false,
    forceRefresh = false,
  } = options;

  const [players, setPlayers] = useState<IPlayerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<IPaginatedPlayersResponse['pagination'] | null>(
    null
  );
  const [cacheInfo, setCacheInfo] = useState<IPaginatedPlayersResponse['cacheInfo'] | null>(null);

  // State for dynamic parameters
  const [currentPage, setCurrentPage] = useState(page);
  const [currentSearch, setCurrentSearch] = useState(search);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [currentYear, setCurrentYear] = useState(year);
  const [currentCollege, setCurrentCollege] = useState(college);
  const [currentCountry, setCurrentCountry] = useState(country);
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);
  const [currentSortDirection, setCurrentSortDirection] = useState(sortDirection);
  const [currentLimit, setCurrentLimit] = useState(limit);

  // Sync internal state with props
  useEffect(() => {
    setCurrentPage(page);
    setCurrentSearch(search);
    setCurrentPosition(position);
    setCurrentYear(year);
    setCurrentCollege(college);
    setCurrentCountry(country);
    setCurrentSortBy(sortBy);
    setCurrentSortDirection(sortDirection);
    setCurrentLimit(limit);
  }, [page, search, position, year, college, country, sortBy, sortDirection, limit]);

  const fetchPlayers = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);

      // Use mock data in development if MOCK_MODE is enabled, or in test environments
      const useMockData = isMockModeEnabled() || isTestOrCIEnvironment();

      if (useMockData) {
        // For mock data, fetch from mock endpoint
        const mockUrl = new URL('/api/players/mock', window.location.origin);
        mockUrl.searchParams.set('page', currentPage.toString());
        mockUrl.searchParams.set('limit', currentLimit.toString());
        if (currentSearch) mockUrl.searchParams.set('search', currentSearch);
        if (currentPosition !== 'all') mockUrl.searchParams.set('position', currentPosition);
        if (currentYear !== 'all') mockUrl.searchParams.set('year', currentYear);
        if (currentCollege !== 'all') mockUrl.searchParams.set('college', currentCollege);
        if (currentCountry !== 'all') mockUrl.searchParams.set('country', currentCountry);
        mockUrl.searchParams.set('sortBy', currentSortBy);
        mockUrl.searchParams.set('sortDirection', currentSortDirection);
        if (forceRefresh) mockUrl.searchParams.set('bypass-cache', 'true');

        const response = await fetch(mockUrl.toString());
        if (!response.ok) {
          throw new Error(`Mock API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setPlayers(data.response || data.players || []);
        setPagination(data.pagination || null);
        setCacheInfo(data.cacheInfo || null);
        return;
      }

      // Build API URL with current parameters
      const apiUrl = new URL('/api/players', window.location.origin);
      apiUrl.searchParams.set('page', currentPage.toString());
      apiUrl.searchParams.set('limit', currentLimit.toString());

      if (currentSearch) apiUrl.searchParams.set('search', currentSearch);
      if (currentPosition !== 'all') apiUrl.searchParams.set('position', currentPosition);
      if (currentYear !== 'all') apiUrl.searchParams.set('year', currentYear);
      if (currentCollege !== 'all') apiUrl.searchParams.set('college', currentCollege);
      if (currentCountry !== 'all') apiUrl.searchParams.set('country', currentCountry);
      apiUrl.searchParams.set('sortBy', currentSortBy);
      apiUrl.searchParams.set('sortDirection', currentSortDirection);

      if (forceRefresh) apiUrl.searchParams.set('bypass-cache', 'true');

      const response = await fetch(apiUrl.toString());
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: IPaginatedPlayersResponse = await response.json();

      if (!data.success) {
        throw new Error(data.errors?.[0] || 'Failed to fetch players');
      }

      setPlayers(data.response || data.players || []);

      // Calculate pagination info
      const totalCount = data.total || data.results || 0;
      const totalPages = Math.ceil(totalCount / currentLimit);

      setPagination({
        page: currentPage,
        limit: currentLimit,
        totalPages,
        totalCount,
      });

      setCacheInfo(data.cacheInfo || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch players';
      setError(errorMessage);
      console.error('Error fetching paginated players:', err);
    } finally {
      setLoading(false);
    }
  }, [
    skip,
    currentPage,
    currentSearch,
    currentPosition,
    currentYear,
    currentCollege,
    currentCountry,
    currentSortBy,
    currentSortDirection,
    currentLimit,
    forceRefresh,
  ]);

  // Fetch players when parameters change
  useEffect(() => {
    void fetchPlayers();
  }, [fetchPlayers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    currentSearch,
    currentPosition,
    currentYear,
    currentCollege,
    currentCountry,
    currentSortBy,
    currentSortDirection,
    currentLimit,
  ]);

  // Memoized setters to prevent unnecessary re-renders
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setSearch = useCallback((search: string) => {
    setCurrentSearch(search);
  }, []);

  const setPosition = useCallback((position: string) => {
    setCurrentPosition(position);
  }, []);

  const setYear = useCallback((year: string) => {
    setCurrentYear(year);
  }, []);

  const setCollege = useCallback((college: string) => {
    setCurrentCollege(college);
  }, []);

  const setCountry = useCallback((country: string) => {
    setCurrentCountry(country);
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    setCurrentSortBy(sortBy);
  }, []);

  const setSortDirection = useCallback((direction: 'asc' | 'desc') => {
    setCurrentSortDirection(direction);
  }, []);

  const setLimit = useCallback((limit: number) => {
    setCurrentLimit(limit);
  }, []);

  const refetch = useCallback(async () => {
    await fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    loading,
    error,
    pagination,
    cacheInfo,
    refetch,
    setPage,
    setSearch,
    setPosition,
    setYear,
    setCollege,
    setCountry,
    setSortBy,
    setSortDirection,
    setLimit,
  };
}
