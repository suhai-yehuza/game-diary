'use client';

import { useState, useEffect, useCallback } from 'react';

import type { ITeamResponse, IPaginatedTeamsOptions, IPaginatedTeamsReturn } from '@/types';

export function usePaginatedTeams(options: IPaginatedTeamsOptions = {}): IPaginatedTeamsReturn {
  const {
    search = '',
    conference = 'all',
    division = 'all',
    sortBy = 'name',
    sortDirection = 'asc',
    page = 1,
    limit = 30,
    skip = false,
    forceRefresh = false,
  } = options;

  const [teams, setTeams] = useState<ITeamResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  } | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{
    cached: boolean;
    timestamp: number;
    ttl: number;
  } | null>(null);

  // Internal state for page management
  const [currentPage, setCurrentPage] = useState(page);

  const fetchTeams = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search,
        conference,
        division,
        sortBy,
        sortDirection,
        ...(forceRefresh && { 'bypass-cache': 'true' }),
      });

      const response = await fetch(`/api/teams?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.teams && Array.isArray(data.teams)) {
        setTeams(data.teams);
        setPagination(data.pagination || null);
        setCacheInfo(data.cacheInfo || null);
      } else {
        setTeams([]);
        setPagination(null);
        setCacheInfo(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setTeams([]);
      setPagination(null);
      setCacheInfo(null);
    } finally {
      setLoading(false);
    }
  }, [skip, currentPage, limit, search, conference, division, sortBy, sortDirection, forceRefresh]);

  // Reset page to 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, search, conference, division, sortBy, sortDirection]);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  const setPage = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const setSearch = useCallback((_newSearch: string) => {
    // This will be handled by the parent component
  }, []);

  const setConference = useCallback((_newConference: string) => {
    // This will be handled by the parent component
  }, []);

  const setDivision = useCallback((_newDivision: string) => {
    // This will be handled by the parent component
  }, []);

  const setSortBy = useCallback((_newSortBy: 'name' | 'city' | 'conference') => {
    // This will be handled by the parent component
  }, []);

  const setSortDirection = useCallback((_newSortDirection: 'asc' | 'desc') => {
    // This will be handled by the parent component
  }, []);

  const setLimit = useCallback((_newLimit: number) => {
    // This will be handled by the parent component
  }, []);

  return {
    teams,
    loading,
    error,
    pagination,
    cacheInfo,
    refetch: fetchTeams,
    setPage,
    setSearch,
    setConference,
    setDivision,
    setSortBy,
    setSortDirection,
    setLimit,
  };
}
