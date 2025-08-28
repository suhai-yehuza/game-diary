import { useState, useCallback, useMemo } from 'react';

import type { IPlayerFilterState, IPlayerFilterOptions, IPlayerResponse } from '@/lib/types';

export type { IPlayerFilterState, IPlayerFilterOptions };

const INITIAL_PLAYER_FILTERS: IPlayerFilterState = {
  searchTerm: '',
  positionFilter: 'all',
  teamFilter: 'all',
  activeFilter: 'all',
  countryFilter: 'all',
  collegeFilter: 'all',
  sortBy: 'name',
  sortDirection: 'asc',
};

export function usePlayerFilters(players: IPlayerResponse[]) {
  const [filters, setFilters] = useState<IPlayerFilterState>(INITIAL_PLAYER_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Generate filter options from players data
  const filterOptions = useMemo((): IPlayerFilterOptions => {
    const positions = Array.from(
      new Set(
        players
          .map(player => player.leagues?.standard?.pos)
          .filter((position): position is string =>
            Boolean(position && typeof position === 'string')
          )
      )
    ).sort();

    const teams: string[] = []; // TODO: Implement team names when available in player data

    const countries = Array.from(
      new Set(
        players
          .map(player => player.birth?.country)
          .filter((country): country is string => Boolean(country && typeof country === 'string'))
      )
    ).sort();

    const colleges = Array.from(
      new Set(
        players
          .map(player => player.college)
          .filter((college): college is string => Boolean(college && typeof college === 'string'))
      )
    ).sort();

    return {
      positions,
      teams,
      countries,
      colleges,
    };
  }, [players]);

  // Helper function to get player's full name
  const getPlayerFullName = useCallback((player: IPlayerResponse) => {
    return `${player.firstname || ''} ${player.lastname || ''}`.trim();
  }, []);

  // Helper function to get player's age
  const getPlayerAge = useCallback((player: IPlayerResponse) => {
    if (!player.birth?.date) return 0;
    const birthDate = new Date(player.birth.date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }, []);

  // Helper function to get player's experience
  const getPlayerExperience = useCallback((player: IPlayerResponse) => {
    const start = player.nba?.start;
    const pro = player.nba?.pro;

    if (start && start <= 2024) {
      return 2024 - start + 1;
    }
    if (pro) {
      return pro;
    }
    return 0;
  }, []);

  // Filter players based on current filters
  const filteredPlayers = useMemo(() => {
    let filtered = [...players];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(player => {
        const fullName = getPlayerFullName(player).toLowerCase();
        return fullName.includes(searchLower);
      });
    }

    // Apply position filter
    if (filters.positionFilter !== 'all') {
      filtered = filtered.filter(
        player => player.leagues?.standard?.pos === filters.positionFilter
      );
    }

    // Apply active filter
    if (filters.activeFilter !== 'all') {
      if (filters.activeFilter === 'active') {
        filtered = filtered.filter(player => player.leagues?.standard?.active !== false);
      } else if (filters.activeFilter === 'inactive') {
        filtered = filtered.filter(player => player.leagues?.standard?.active === false);
      }
    }

    // Apply country filter
    if (filters.countryFilter !== 'all') {
      filtered = filtered.filter(player => player.birth?.country === filters.countryFilter);
    }

    // Apply college filter
    if (filters.collegeFilter !== 'all') {
      filtered = filtered.filter(player => player.college === filters.collegeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case 'name':
          aValue = getPlayerFullName(a);
          bValue = getPlayerFullName(b);
          break;
        case 'position':
          aValue = a.leagues?.standard?.pos || '';
          bValue = b.leagues?.standard?.pos || '';
          break;
        case 'age':
          aValue = getPlayerAge(a);
          bValue = getPlayerAge(b);
          break;
        case 'experience':
          aValue = getPlayerExperience(a);
          bValue = getPlayerExperience(b);
          break;
        case 'team':
          // Since we don't have team names directly, we'll sort by team ID for now
          aValue = ''; // placeholder
          bValue = ''; // placeholder
          break;
        default:
          aValue = getPlayerFullName(a);
          bValue = getPlayerFullName(b);
      }

      let comparison: number;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = (aValue as number) - (bValue as number);
      }

      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [players, filters, getPlayerFullName, getPlayerAge, getPlayerExperience]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm !== '' ||
      filters.positionFilter !== 'all' ||
      filters.teamFilter !== 'all' ||
      filters.activeFilter !== 'all' ||
      filters.countryFilter !== 'all' ||
      filters.collegeFilter !== 'all'
    );
  }, [filters]);

  // Update filter function
  const updateFilter = useCallback((key: keyof IPlayerFilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_PLAYER_FILTERS);
  }, []);

  // Toggle advanced filters
  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(prev => !prev);
  }, []);

  return {
    filters,
    filterOptions,
    filteredPlayers,
    showAdvancedFilters,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    toggleAdvancedFilters,
  };
}
