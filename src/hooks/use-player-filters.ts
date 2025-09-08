import { useState, useCallback, useMemo } from 'react';

import type { IPlayerResponse, IPlayerFilterState, IPlayerFilterOptions } from '@/types';

const INITIAL_PLAYER_FILTERS: IPlayerFilterState = {
  searchTerm: '',
  positionFilter: 'all',
  activeFilter: 'all',
  collegeFilter: 'all',
  countryFilter: 'all',
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
          .filter((pos): pos is string => Boolean(pos && typeof pos === 'string'))
      )
    ).sort();

    const colleges = Array.from(
      new Set(
        players
          .map(player => player.college || '')
          .filter((name): name is string => Boolean(name && typeof name === 'string'))
      )
    ).sort();

    const countries = Array.from(
      new Set(
        players
          .map(player => player.birth?.country)
          .filter((country): country is string => Boolean(country && typeof country === 'string'))
      )
    ).sort();

    return {
      positions,
      colleges,
      countries,
    };
  }, [players]);

  // Filter players based on current filters
  const filteredPlayers = useMemo(() => {
    let filtered = [...players];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(player => {
        const fullName = `${player.firstname || ''} ${player.lastname || ''}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          player.college?.toLowerCase().includes(searchLower) ||
          player.birth?.country?.toLowerCase().includes(searchLower)
        );
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
        filtered = filtered.filter(player => player.leagues?.standard?.active === true);
      } else if (filters.activeFilter === 'inactive') {
        filtered = filtered.filter(player => player.leagues?.standard?.active === false);
      }
    }

    // Apply college filter
    if (filters.collegeFilter !== 'all') {
      filtered = filtered.filter(player => player.college === filters.collegeFilter);
    }

    // Apply country filter
    if (filters.countryFilter !== 'all') {
      filtered = filtered.filter(player => player.birth?.country === filters.countryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case 'name': {
          const aFullName = `${a.firstname || ''} ${a.lastname || ''}`;
          const bFullName = `${b.firstname || ''} ${b.lastname || ''}`;
          aValue = aFullName;
          bValue = bFullName;
          break;
        }
        case 'position':
          aValue = a.leagues?.standard?.pos || '';
          bValue = b.leagues?.standard?.pos || '';
          break;

        case 'age':
          aValue = a.birth?.date
            ? new Date().getFullYear() - new Date(a.birth.date).getFullYear()
            : 0;
          bValue = b.birth?.date
            ? new Date().getFullYear() - new Date(b.birth.date).getFullYear()
            : 0;
          break;
        case 'height':
          aValue = a.height ? parseFloat(a.height) : 0;
          bValue = b.height ? parseFloat(b.height) : 0;
          break;
        case 'weight':
          aValue = a.weight ? parseFloat(a.weight) : 0;
          bValue = b.weight ? parseFloat(b.weight) : 0;
          break;
        default:
          aValue = `${a.firstname || ''} ${a.lastname || ''}`.trim();
          bValue = `${b.firstname || ''} ${b.lastname || ''}`.trim();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (filters.sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        if (filters.sortDirection === 'asc') {
          return (aValue as number) - (bValue as number);
        } else {
          return (bValue as number) - (aValue as number);
        }
      }
    });

    return filtered;
  }, [players, filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm !== '' ||
      filters.positionFilter !== 'all' ||
      filters.activeFilter !== 'all' ||
      filters.collegeFilter !== 'all' ||
      filters.countryFilter !== 'all'
    );
  }, [filters]);

  // Update a specific filter
  const updateFilter = useCallback((key: keyof IPlayerFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_PLAYER_FILTERS);
  }, []);

  // Toggle advanced filters visibility
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
