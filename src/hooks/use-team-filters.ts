import { useState, useCallback, useMemo } from 'react';

import type { ITeamFilterState, ITeamFilterOptions } from '@/app/components/sports/team-filters';
import type { ITeamResponse } from '@/lib/types';

export type { ITeamFilterState, ITeamFilterOptions };

const INITIAL_TEAM_FILTERS: ITeamFilterState = {
  searchTerm: '',
  conferenceFilter: 'all',
  divisionFilter: 'all',
  franchiseFilter: 'all',
  sortBy: 'name',
  sortDirection: 'asc',
};

export function useTeamFilters(teams: ITeamResponse[]) {
  const [filters, setFilters] = useState<ITeamFilterState>(INITIAL_TEAM_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Generate filter options from teams data
  const filterOptions = useMemo((): ITeamFilterOptions => {
    const conferences = Array.from(
      new Set(
        teams
          .map(team => team.leagues?.standard?.conference)
          .filter((conference): conference is string =>
            Boolean(conference && typeof conference === 'string')
          )
      )
    ).sort();

    const divisions = Array.from(
      new Set(
        teams
          .map(team => team.leagues?.standard?.division)
          .filter((division): division is string =>
            Boolean(division && typeof division === 'string')
          )
      )
    ).sort();

    return {
      conferences,
      divisions,
    };
  }, [teams]);

  // Filter teams based on current filters
  const filteredTeams = useMemo(() => {
    let filtered = [...teams];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        team =>
          team.name?.toLowerCase().includes(searchLower) ||
          team.nickname?.toLowerCase().includes(searchLower) ||
          team.city?.toLowerCase().includes(searchLower) ||
          team.code?.toLowerCase().includes(searchLower)
      );
    }

    // Apply conference filter
    if (filters.conferenceFilter !== 'all') {
      filtered = filtered.filter(
        team => team.leagues?.standard?.conference === filters.conferenceFilter
      );
    }

    // Apply division filter
    if (filters.divisionFilter !== 'all') {
      filtered = filtered.filter(
        team => team.leagues?.standard?.division === filters.divisionFilter
      );
    }

    // Apply franchise filter
    if (filters.franchiseFilter !== 'all') {
      if (filters.franchiseFilter === 'nba') {
        filtered = filtered.filter(team => team.nbaFranchise === true);
      } else if (filters.franchiseFilter === 'non-nba') {
        filtered = filtered.filter(team => team.nbaFranchise === false);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'city':
          aValue = a.city || '';
          bValue = b.city || '';
          break;
        case 'conference':
          aValue = a.leagues?.standard?.conference || '';
          bValue = b.leagues?.standard?.conference || '';
          break;
        case 'division':
          aValue = a.leagues?.standard?.division || '';
          bValue = b.leagues?.standard?.division || '';
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      const comparison = aValue.localeCompare(bValue);
      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [teams, filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm !== '' ||
      filters.conferenceFilter !== 'all' ||
      filters.divisionFilter !== 'all' ||
      filters.franchiseFilter !== 'all'
    );
  }, [filters]);

  // Update filter function
  const updateFilter = useCallback((key: keyof ITeamFilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_TEAM_FILTERS);
  }, []);

  // Toggle advanced filters
  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(prev => !prev);
  }, []);

  return {
    filters,
    filterOptions,
    filteredTeams,
    showAdvancedFilters,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    toggleAdvancedFilters,
  };
}
