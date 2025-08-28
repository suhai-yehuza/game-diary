import { useState, useCallback, useMemo, useEffect } from 'react';

import type { IPlayerResponse } from '@/lib/types';

export interface IEnhancedPlayerFilterState {
  searchTerm: string;
  positionFilter: string;
  teamFilter: string;
  activeFilter: string;
  collegeFilter: string;
  countryFilter: string;
  sortBy: 'name' | 'position' | 'team' | 'age' | 'experience';
  sortDirection: 'asc' | 'desc';
}

export interface IEnhancedPlayerFilterOptions {
  positions: string[];
  teams: string[];
  colleges: string[];
  countries: string[];
}

const INITIAL_FILTERS: IEnhancedPlayerFilterState = {
  searchTerm: '',
  positionFilter: 'all',
  teamFilter: 'all',
  activeFilter: 'all',
  collegeFilter: 'all',
  countryFilter: 'all',
  sortBy: 'name',
  sortDirection: 'asc',
};

export function useEnhancedPlayerFilters() {
  const [filters, setFilters] = useState<IEnhancedPlayerFilterState>(INITIAL_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [players, setPlayers] = useState<IPlayerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<IEnhancedPlayerFilterOptions>({
    positions: [],
    teams: [],
    colleges: [],
    countries: [],
  });
  const [totalPlayers, setTotalPlayers] = useState(0);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/players?options=true');
      if (response.ok) {
        const options = await response.json();
        setFilterOptions({
          positions: options.positions || [],
          teams: options.teams || [],
          colleges: options.colleges || [],
          countries: options.countries || [],
        });
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

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
      params.append('limit', '100'); // Adjust as needed

      const response = await fetch(`/api/players?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      setPlayers(data.response || []);
      setTotalPlayers(data.results || 0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setPlayers([]);
      setTotalPlayers(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initialize and fetch data
  useEffect(() => {
    void fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    void fetchPlayers();
  }, [fetchPlayers]);

  // Update a single filter
  const updateFilter = useCallback((key: keyof IEnhancedPlayerFilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Toggle advanced filters
  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(prev => !prev);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm.trim() !== '' ||
      filters.positionFilter !== 'all' ||
      filters.teamFilter !== 'all' ||
      filters.collegeFilter !== 'all' ||
      filters.countryFilter !== 'all' ||
      filters.sortBy !== 'name' ||
      filters.sortDirection !== 'asc'
    );
  }, [filters]);

  // Refetch data
  const refetch = useCallback(() => {
    void fetchPlayers();
  }, [fetchPlayers]);

  return {
    // State
    filters,
    showAdvancedFilters,
    players,
    loading,
    error,
    filterOptions,
    totalPlayers,
    hasActiveFilters,

    // Actions
    updateFilter,
    clearFilters,
    toggleAdvancedFilters,
    refetch,
  };
}
