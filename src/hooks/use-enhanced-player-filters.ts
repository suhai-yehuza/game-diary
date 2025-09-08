import { useState, useCallback, useMemo, useEffect } from 'react';

import { API_LIMITS } from '@/lib/constants';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type {
  IPlayerResponse,
  IEnhancedPlayerFilterState,
  IEnhancedPlayerFilterOptions,
} from '@/types';

const INITIAL_FILTERS: IEnhancedPlayerFilterState = {
  searchTerm: '',
  positionFilter: 'all',
  teamFilter: 'all',
  activeFilter: 'all',
  collegeFilter: 'all',
  countryFilter: 'all',
  sortBy: 'name',
  sortDirection: 'asc',
  customFilters: {},
};

export function useEnhancedPlayerFilters(options: { forceRefresh?: boolean } = {}) {
  const { forceRefresh = false } = options;

  const [filters, setFilters] = useState<IEnhancedPlayerFilterState>(INITIAL_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [players, setPlayers] = useState<IPlayerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'cached' | 'fresh' | 'none'>('none');
  const [filterOptions, setFilterOptions] = useState<IEnhancedPlayerFilterOptions>({
    positions: [],
    teams: [],
    colleges: [],
    countries: [],
    customFilterOptions: {},
  });
  const [totalPlayers, setTotalPlayers] = useState(0);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const bypassParam = forceRefresh ? '&bypass-cache=true' : '';
      const response = await fetch(`/api/players?options=true${bypassParam}`);
      if (response.ok) {
        const options = await response.json();
        setFilterOptions({
          positions: options.positions || [],
          teams: options.teams || [],
          colleges: options.colleges || [],
          countries: options.countries || [],
          customFilterOptions: options.customFilterOptions || {},
        });

        // Set cache status for filter options
        setCacheStatus(forceRefresh ? 'fresh' : 'cached');
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useEnhancedPlayerFilters',
        action: 'Fetch filter options',
      });
      setCacheStatus('none');
    }
  }, [forceRefresh]);

  // Fetch players with current filters
  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (filters.searchTerm.trim()) {
        params.append('search', filters.searchTerm.trim());
      }
      if (filters.positionFilter !== 'all') {
        params.append('position', filters.positionFilter);
      }
      if (filters.teamFilter !== 'all') {
        params.append('team', filters.teamFilter);
      }
      if (filters.collegeFilter !== 'all') {
        params.append('college', filters.collegeFilter);
      }
      if (filters.countryFilter !== 'all') {
        params.append('country', filters.countryFilter);
      }
      params.append('sortBy', filters.sortBy);
      params.append('sortDirection', filters.sortDirection);
      params.append('limit', API_LIMITS.PLAYERS.LARGE.toString());

      // Add cache bypass parameter
      if (forceRefresh) {
        params.append('bypass-cache', 'true');
      }

      const response = await fetch(`/api/players?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      setPlayers(data.response || []);
      setTotalPlayers(data.results || 0);

      // Set cache status for players
      setCacheStatus(forceRefresh ? 'fresh' : 'cached');

      logger.info('Players loaded', {
        count: data.response?.length || 0,
        source: forceRefresh ? 'fresh' : 'cached',
        cacheStatus: forceRefresh ? 'fresh' : 'cached',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      errorHandlers.api(error, {
        component: 'useEnhancedPlayerFilters',
        action: 'Fetch players',
      });
      setError(error.message);
      setPlayers([]);
      setTotalPlayers(0);
      setCacheStatus('none');
    } finally {
      setLoading(false);
    }
  }, [filters, forceRefresh]);

  // Fetch data when filters change or force refresh is triggered
  useEffect(() => {
    void fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    void fetchPlayers();
  }, [fetchPlayers]);

  const updateFilter = useCallback((key: keyof IEnhancedPlayerFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(prev => !prev);
  }, []);

  const refetch = useCallback(() => {
    void fetchPlayers();
  }, [fetchPlayers]);

  const refreshCache = useCallback(() => {
    void Promise.all([fetchFilterOptions(), fetchPlayers()]);
  }, [fetchFilterOptions, fetchPlayers]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm.trim() !== '' ||
      filters.positionFilter !== 'all' ||
      filters.teamFilter !== 'all' ||
      filters.collegeFilter !== 'all' ||
      filters.countryFilter !== 'all'
    );
  }, [filters]);

  return {
    filters,
    showAdvancedFilters,
    players,
    loading,
    error,
    cacheStatus,
    filterOptions,
    totalPlayers,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    toggleAdvancedFilters,
    refetch,
    refreshCache,
  };
}
