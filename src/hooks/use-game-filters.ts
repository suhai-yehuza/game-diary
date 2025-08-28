import { useState, useCallback, useMemo } from 'react';

import type { IGameResponse } from '@/lib/types';

export interface IFilterState {
  searchTerm: string;
  statusFilter: string;
  seasonFilter: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
  customStartDate: string;
  customEndDate: string;
  arenaFilter: string;
  teamFilter: string;
  sortBy: 'date' | 'status' | 'arena' | 'team';
  sortDirection: 'asc' | 'desc';
}

export interface IFilterOptions {
  arenas: string[];
  teams: string[];
  seasons: number[];
  statuses: string[];
}

const INITIAL_FILTERS: IFilterState = {
  searchTerm: '',
  statusFilter: 'all',
  seasonFilter: 'all',
  dateRange: 'all',
  customStartDate: '',
  customEndDate: '',
  arenaFilter: 'all',
  teamFilter: 'all',
  sortBy: 'date',
  sortDirection: 'desc',
};

export function useGameFilters(games: IGameResponse[]) {
  const [filters, setFilters] = useState<IFilterState>(INITIAL_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Generate filter options from games data
  const filterOptions = useMemo((): IFilterOptions => {
    const arenas = Array.from(
      new Set(games.map(game => game.arena?.name).filter(name => name && typeof name === 'string'))
    ).sort();
    const teams = Array.from(
      new Set([
        ...games.map(game => game.teams.home.name).filter(name => name && typeof name === 'string'),
        ...games
          .map(game => game.teams.visitors.name)
          .filter(name => name && typeof name === 'string'),
      ])
    ).sort();
    const seasons = Array.from(
      new Set(games.map(game => game.season).filter(season => season && typeof season === 'number'))
    ).sort((a, b) => b - a);
    const statuses = Array.from(
      new Set(
        games
          .map(game => {
            const status = game.status?.short;
            return status ? (typeof status === 'string' ? status : String(status)) : null;
          })
          .filter((status): status is string => status !== null && typeof status === 'string')
      )
    ).sort();

    return { arenas, teams, seasons, statuses };
  }, [games]);

  // Filter and sort games
  const filteredGames = useMemo(() => {
    let filtered = [...games];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(game => {
        const homeTeam = game.teams.home.name?.toLowerCase() ?? '';
        const awayTeam = game.teams.visitors.name?.toLowerCase() ?? '';
        const arena = game.arena?.name?.toLowerCase() ?? '';
        const gameDate = new Date(game.date.start).toLocaleDateString().toLowerCase();
        const season = game.season?.toString() ?? '';

        return (
          homeTeam.includes(searchLower) ||
          awayTeam.includes(searchLower) ||
          arena.includes(searchLower) ||
          gameDate.includes(searchLower) ||
          season.includes(searchLower)
        );
      });
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(game => {
        const gameStatus = game.status?.short;
        const gameStatusLong = game.status?.long;
        const gameDate = new Date(game.date.start);
        const now = new Date();

        // Handle both string and number status values
        const statusStr = typeof gameStatus === 'string' ? gameStatus : String(gameStatus || '');
        if (!statusStr) return false;

        const filterStatus = filters.statusFilter.toLowerCase();
        const status = statusStr.toLowerCase();
        const statusLong = gameStatusLong?.toLowerCase() || '';

        // Handle common status mappings
        switch (filterStatus) {
          case 'finished': {
            return status === 'ft' || status === '3' || statusLong === 'finished';
          }
          case 'live': {
            return (
              status === 'live' ||
              statusLong === 'live' ||
              ['q1', 'q2', 'q3', 'q4', 'ot', '2', '4'].includes(status)
            );
          }
          case 'scheduled': {
            // Scheduled games must have future dates
            const isScheduledStatus =
              status === 'ns' || status === '1' || statusLong === 'scheduled';
            return isScheduledStatus && gameDate > now;
          }
          case 'cancelled': {
            // Include explicitly cancelled games, postponed games, and past scheduled games
            const isExplicitlyCancelled =
              status === 'cancelled' ||
              statusLong === 'cancelled' ||
              statusLong === 'postponed' ||
              statusLong === 'cancelled/postponed';
            const isPastScheduled =
              (status === 'ns' || status === '1' || statusLong === 'scheduled') && gameDate <= now;
            return isExplicitlyCancelled || isPastScheduled;
          }
          default: {
            return status === filterStatus || statusLong === filterStatus;
          }
        }
      });
    }

    // Season filter
    if (filters.seasonFilter !== 'all') {
      filtered = filtered.filter(game => {
        const gameSeason = game.season; // Use number directly
        const filterYear = parseInt(filters.seasonFilter);
        return filterYear === gameSeason; // Compare numbers directly
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(game => {
        const gameDate = new Date(game.date.start);

        switch (filters.dateRange) {
          case 'today': {
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            return gameDate >= today && gameDate < tomorrow;
          }
          case 'week': {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return gameDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return gameDate >= monthAgo;
          }
          case 'year': {
            const yearStart = new Date(now.getFullYear(), 0, 1); // January 1st of current year
            return gameDate >= yearStart;
          }
          case 'custom': {
            if (filters.customStartDate && filters.customEndDate) {
              const startDate = new Date(filters.customStartDate);
              const endDate = new Date(filters.customEndDate);
              return gameDate >= startDate && gameDate <= endDate;
            }
            return true;
          }
          default:
            return true;
        }
      });
    }

    // Arena filter
    if (filters.arenaFilter !== 'all') {
      filtered = filtered.filter(game => game.arena?.name === filters.arenaFilter);
    }

    // Team filter
    if (filters.teamFilter !== 'all') {
      filtered = filtered.filter(
        game =>
          (game.teams.home.name ?? '') === filters.teamFilter ||
          (game.teams.visitors.name ?? '') === filters.teamFilter
      );
    }

    // Sort games
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date.start).getTime() - new Date(b.date.start).getTime();
          break;
        case 'status':
          comparison = (a.status?.short ?? '').localeCompare(b.status?.short ?? '');
          break;
        case 'arena':
          comparison = (a.arena?.name ?? '').localeCompare(b.arena?.name ?? '');
          break;
        case 'team':
          comparison = (a.teams.home.name ?? '').localeCompare(b.teams.home.name ?? '');
          break;
      }

      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [games, filters]);

  // Update filter
  const updateFilter = useCallback((key: keyof IFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.searchTerm ||
        filters.statusFilter !== 'all' ||
        filters.seasonFilter !== 'all' ||
        filters.dateRange !== 'all' ||
        filters.arenaFilter !== 'all' ||
        filters.teamFilter !== 'all'
    );
  }, [filters]);

  // Toggle advanced filters
  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(prev => !prev);
  }, []);

  return {
    filters,
    filterOptions,
    filteredGames,
    showAdvancedFilters,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    toggleAdvancedFilters,
  };
}
