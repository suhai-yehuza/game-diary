import type { IGameLog } from '@/types';

// Helper function to get team display from game data
export const getTeamDisplay = (game: IGameLog['game'], includeDate = true): string => {
  if (!game || typeof game !== 'object') {
    return 'Unknown Teams';
  }

  // Handle both data formats: home_team/away_team and teams.home/teams.away
  let homeTeam, awayTeam, gameDate;
  if ('home_team' in game && 'away_team' in game) {
    const gameData = game as {
      home_team?: { code?: string; nickname?: string; name?: string } | null;
      away_team?: { code?: string; nickname?: string; name?: string } | null;
      date?: string | Date;
    };
    homeTeam = gameData.home_team;
    awayTeam = gameData.away_team;
    gameDate = gameData.date;
  } else if ('teams' in game) {
    const gameData = game as {
      teams?: {
        home?: { code?: string; nickname?: string; name?: string } | null;
        away?: { code?: string; nickname?: string; name?: string } | null;
      } | null;
      date?: string | Date;
    };
    homeTeam = gameData.teams?.home;
    awayTeam = gameData.teams?.away;
    gameDate = gameData.date;
  } else {
    return 'Unknown Teams';
  }

  // Check if teams are valid objects
  if (!homeTeam || !awayTeam || typeof homeTeam !== 'object' || typeof awayTeam !== 'object') {
    return 'Unknown Teams';
  }

  const homeTeamCode = homeTeam.code ?? homeTeam.nickname ?? homeTeam.name ?? 'Unknown';
  const awayTeamCode = awayTeam.code ?? awayTeam.nickname ?? awayTeam.name ?? 'Unknown';

  // Format the date if available and includeDate is true
  let dateString = '';
  if (includeDate && gameDate) {
    const parsedDate = new Date(gameDate);
    if (!isNaN(parsedDate.getTime())) {
      dateString = ` on ${parsedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })}`;
    }
  }

  return `${awayTeamCode} @ ${homeTeamCode}${dateString}`;
};

export const filterAndSortGameLogs = (
  logs: IGameLog[],
  searchTerm: string,
  searchField: string,
  sortConfig: { field: string; direction: 'asc' | 'desc' } | null
): IGameLog[] => {
  let filtered = logs;

  // Apply search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(log => {
      if (searchField === 'all') {
        return (
          getTeamDisplay(log.game).toLowerCase().includes(searchLower) ||
          log.notes?.toLowerCase().includes(searchLower) ||
          log.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
          log.classification.toLowerCase().includes(searchLower) ||
          log.watched_setting?.toLowerCase().includes(searchLower) ||
          log.watched_scope?.toLowerCase().includes(searchLower)
        );
      }
      if (searchField === 'classification') {
        return log.classification.toLowerCase().includes(searchLower);
      }
      if (searchField === 'watched_setting') {
        return log.watched_setting?.toLowerCase().includes(searchLower) ?? false;
      }
      if (searchField === 'watched_scope') {
        return log.watched_scope?.toLowerCase().includes(searchLower) ?? false;
      }
      if (searchField === 'notes') {
        return log.notes?.toLowerCase().includes(searchLower) ?? false;
      }
      if (searchField === 'tags') {
        return log.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ?? false;
      }
      if (searchField === 'team') {
        return getTeamDisplay(log.game).toLowerCase().includes(searchLower);
      }
      return true;
    });
  }

  // Apply sorting
  if (sortConfig) {
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortConfig.field) {
        case 'rating_for_game':
          aValue = a.rating_for_game ?? 0;
          bValue = b.rating_for_game ?? 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'classification':
          aValue = a.classification;
          bValue = b.classification;
          break;
        case 'watched_setting':
          aValue = a.watched_setting ?? '';
          bValue = b.watched_setting ?? '';
          break;
        case 'watched_scope':
          aValue = a.watched_scope ?? '';
          bValue = b.watched_scope ?? '';
          break;
        case 'game_id':
          aValue = a.game_id ?? '';
          bValue = b.game_id ?? '';
          break;
        case 'team':
          aValue = (a.game as { home_team?: { name?: string } })?.home_team?.name ?? '';
          bValue = (b.game as { home_team?: { name?: string } })?.home_team?.name ?? '';
          break;
        case 'owner':
          aValue = (a.user as { username?: string })?.username ?? '';
          bValue = (b.user as { username?: string })?.username ?? '';
          break;
        case 'tags':
          aValue = a.tags?.join(', ') ?? '';
          bValue = b.tags?.join(', ') ?? '';
          break;
        default:
          // Use type assertion for dynamic property access
          aValue = (a as unknown as Record<string, unknown>)[sortConfig.field] as
            | string
            | number
            | Date;
          bValue = (b as unknown as Record<string, unknown>)[sortConfig.field] as
            | string
            | number
            | Date;
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  return filtered;
};
