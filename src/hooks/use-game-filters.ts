import { useState, useCallback, useMemo } from 'react';

import { GAME_STATUS_VALUES } from '@/lib/constants';
import type { IGameResponse, IFilterState, IFilterOptions } from '@/types';

const INITIAL_FILTERS: IFilterState = {
  searchTerm: '',
  statusFilter: 'all',
  seasonFilter: 'all',
  dateRange: 'all',
  customStartDate: '',
  customEndDate: '',
  arenaFilter: 'all',
  teamFilter: 'all',
  conferenceFilter: 'all',
  divisionFilter: 'all',
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
        ...games
          .map(game => game.teams?.home?.name)
          .filter(name => name && typeof name === 'string'),
        ...games
          .map(game => game.teams?.visitors?.name)
          .filter(name => name && typeof name === 'string'),
      ])
    ).sort();
    const seasons = Array.from(
      new Set(games.map(game => game.season).filter(season => season && typeof season === 'number'))
    ).sort((a, b) => {
      const numA = typeof a === 'number' ? a : 0;
      const numB = typeof b === 'number' ? b : 0;
      return numB - numA;
    });
    const statuses = Array.from(
      new Set(
        games
          .map(game => {
            const status = typeof game.status === 'string' ? game.status : game.status?.short;
            return status ? (typeof status === 'string' ? status : String(status)) : null;
          })
          .filter((status): status is string => status !== null && typeof status === 'string')
      )
    ).sort();

    return {
      arenas: arenas
        .filter((arena): arena is string => Boolean(arena))
        .map(arena => ({ value: arena, label: arena })),
      status: statuses.filter(status => status).map(status => ({ value: status, label: status })),
      season: seasons
        .filter(season => season !== undefined)
        .map(season => ({ value: season.toString(), label: season.toString() })),
      teams: teams
        .filter((team): team is string => Boolean(team))
        .map(team => ({ value: team, label: team })),
    };
  }, [games]);

  // Filter and sort games
  const filteredGames = useMemo(() => {
    // If no filters are applied, return games as-is without processing
    const hasActiveFilters =
      filters.searchTerm ||
      filters.statusFilter !== 'all' ||
      filters.seasonFilter !== 'all' ||
      filters.dateRange !== 'all' ||
      filters.arenaFilter !== 'all' ||
      filters.teamFilter !== 'all';

    if (!hasActiveFilters) {
      return games; // Return games without processing when no filters
    }

    let filtered = [...games];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(game => {
        const homeTeam = game.teams?.home?.name?.toLowerCase() ?? '';
        const awayTeam = game.teams?.visitors?.name?.toLowerCase() ?? '';
        const arena = game.arena?.name?.toLowerCase() ?? '';
        const gameDate =
          typeof game.date === 'string'
            ? new Date(game.date).toLocaleDateString().toLowerCase()
            : new Date(game.date.start).toLocaleDateString().toLowerCase();
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
        const gameStatus = typeof game.status === 'string' ? game.status : game.status?.short;
        const gameStatusLong = typeof game.status === 'string' ? game.status : game.status?.long;
        const gameDate =
          typeof game.date === 'string' ? new Date(game.date) : new Date(game.date.start);
        const now = new Date();

        // Handle both string and number status values
        const statusStr = typeof gameStatus === 'string' ? gameStatus : String(gameStatus || '');
        if (!statusStr) return false;

        const filterStatus = filters.statusFilter.toLowerCase();
        const status = statusStr.toLowerCase();
        const statusLong = gameStatusLong?.toLowerCase() || '';

        // Handle common status mappings
        switch (filterStatus) {
          case GAME_STATUS_VALUES.FINISHED.toLowerCase(): {
            return (
              status === GAME_STATUS_VALUES.FINISHED.toLowerCase() ||
              status === 'ft' ||
              status === '3' ||
              statusLong === 'finished'
            );
          }
          case GAME_STATUS_VALUES.LIVE.toLowerCase(): {
            return (
              status === GAME_STATUS_VALUES.LIVE.toLowerCase() ||
              statusLong === 'live' ||
              ['q1', 'q2', 'q3', 'q4', 'ot', '2', '4'].includes(status)
            );
          }
          case GAME_STATUS_VALUES.IN_PROGRESS.toLowerCase(): {
            // Games that are in progress but not currently live
            return (
              status === GAME_STATUS_VALUES.IN_PROGRESS.toLowerCase() ||
              statusLong === 'in_progress' ||
              ['2', '4'].includes(status) // Numeric status codes for in-progress games
            );
          }
          case GAME_STATUS_VALUES.SCHEDULED.toLowerCase(): {
            // Scheduled games must have future dates
            const isScheduledStatus =
              status === 'ns' || status === '1' || statusLong === 'scheduled';
            return isScheduledStatus && gameDate > now;
          }
          case GAME_STATUS_VALUES.CANCELLED.toLowerCase(): {
            // Only include explicitly cancelled or postponed games
            const isExplicitlyCancelled =
              status === GAME_STATUS_VALUES.CANCELLED.toLowerCase() ||
              statusLong === 'cancelled' ||
              statusLong === 'postponed' ||
              statusLong === 'cancelled/postponed';

            // Don't automatically mark past scheduled games as cancelled
            // They might have been played and have scores
            return isExplicitlyCancelled;
          }
          default: {
            return status === filterStatus || statusLong === filterStatus;
          }
        }
      });
    }

    // Season filter
    if (filters.seasonFilter !== 'all') {
      // Season filter applied: ${filters.seasonFilter} (${typeof filters.seasonFilter})

      filtered = filtered.filter(game => {
        const gameSeason = game.season; // Use number directly
        const filterYear = parseInt(filters.seasonFilter);

        // Handle both string and number season values
        if (typeof gameSeason === 'string') {
          return parseInt(gameSeason) === filterYear;
        } else if (typeof gameSeason === 'number') {
          return gameSeason === filterYear;
        }

        return false; // Skip games without season data
      });

      // After season filter: ${filtered.length} games remaining
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(game => {
        const gameDate =
          typeof game.date === 'string' ? new Date(game.date) : new Date(game.date.start);

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
          (game.teams?.home?.name ?? '') === filters.teamFilter ||
          (game.teams?.visitors?.name ?? '') === filters.teamFilter
      );
    }

    // Sort games
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date': {
          const aDate = typeof a.date === 'string' ? new Date(a.date) : new Date(a.date.start);
          const bDate = typeof b.date === 'string' ? new Date(b.date) : new Date(b.date.start);
          comparison = aDate.getTime() - bDate.getTime();
          break;
        }
        case 'status': {
          const aStatus = typeof a.status === 'string' ? a.status : a.status?.short;
          const bStatus = typeof b.status === 'string' ? b.status : b.status?.short;
          comparison = (aStatus?.toString() ?? '').localeCompare(bStatus?.toString() ?? '');
          break;
        }
        case 'arena':
          comparison = (a.arena?.name ?? '').localeCompare(b.arena?.name ?? '');
          break;
        case 'team':
          comparison = (a.teams?.home?.name ?? '').localeCompare(b.teams?.home?.name ?? '');
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
