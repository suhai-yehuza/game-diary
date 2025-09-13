import type { IGameLog } from '@/types';

// Helper function to format watched setting values with proper capitalization
export const formatWatchedSetting = (setting: string | null | undefined): string => {
  if (!setting) return 'Not specified';

  // Convert to proper capitalization
  const formatted = setting.toLowerCase().replace(/_/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Helper function to generate distinct colors for tags
export const generateDistinctTagColors = (tags: string[]): Record<string, string> => {
  // Define a palette using centralized color system
  const colorPalette = [
    'bg-semantic-error text-theme-inverse border-semantic-error',
    'bg-brand-primary text-theme-inverse border-brand-primary',
    'bg-semantic-success text-theme-inverse border-semantic-success',
    'bg-semantic-warning text-theme-primary border-semantic-warning',
    'bg-semantic-info text-theme-inverse border-semantic-info',
    'bg-semantic-error/80 text-theme-inverse border-semantic-error',
    'bg-brand-primary/80 text-theme-inverse border-brand-primary',
    'bg-semantic-success/80 text-theme-inverse border-semantic-success',
    'bg-semantic-warning/80 text-theme-primary border-semantic-warning',
    'bg-semantic-info/80 text-theme-inverse border-semantic-info',
    'bg-brand-secondary text-theme-inverse border-brand-secondary',
    'bg-brand-secondary/80 text-theme-inverse border-brand-secondary',
    'bg-theme-muted text-theme-primary border-theme-muted',
    'bg-theme-secondary text-theme-primary border-theme-secondary',
    'bg-theme-tertiary text-theme-primary border-theme-tertiary',
    'bg-theme-primary text-theme-inverse border-theme-primary',
    'bg-theme-elevated text-theme-primary border-theme-elevated',
    'bg-theme-primary/80 text-theme-inverse border-theme-primary',
  ];

  // Create a mapping of tags to colors
  const tagColorMap: Record<string, string> = {};

  // Sort tags to ensure consistent color assignment
  const sortedTags = [...tags].sort();

  // Assign colors to tags deterministically, ensuring no duplicates
  sortedTags.forEach((tag, index) => {
    tagColorMap[tag] = colorPalette[index % colorPalette.length];
  });

  return tagColorMap;
};

// Helper function to get team objects with logo and name
export const getTeamObjects = (
  game: IGameLog['game']
): { homeTeam: { name: string; logo: string }; awayTeam: { name: string; logo: string } } => {
  if (!game || typeof game !== 'object') {
    return {
      homeTeam: { name: 'Unknown Team', logo: '/defaults/team-logo.svg' },
      awayTeam: { name: 'Unknown Team', logo: '/defaults/team-logo.svg' },
    };
  }

  // Handle multiple data formats: home_team/away_team, teams.home/teams.away, and teams.visitors/teams.home
  let homeTeam, awayTeam;
  if ('home_team' in game && 'away_team' in game) {
    const gameData = game as {
      home_team?: { code?: string; nickname?: string; name?: string; logo?: string } | null;
      away_team?: { code?: string; nickname?: string; name?: string; logo?: string } | null;
    };
    homeTeam = gameData.home_team;
    awayTeam = gameData.away_team;
  } else if ('teams' in game) {
    const gameData = game as {
      teams?: {
        home?: { code?: string; nickname?: string; name?: string; logo?: string } | null;
        away?: { code?: string; nickname?: string; name?: string; logo?: string } | null;
        visitors?: { code?: string; nickname?: string; name?: string; logo?: string } | null;
      } | null;
    };
    // Handle both away/visitors naming conventions
    homeTeam = gameData.teams?.home;
    awayTeam = gameData.teams?.away || gameData.teams?.visitors;
  } else {
    return {
      homeTeam: { name: 'Unknown Team', logo: '/defaults/team-logo.svg' },
      awayTeam: { name: 'Unknown Team', logo: '/defaults/team-logo.svg' },
    };
  }

  // Check if teams are valid objects
  if (!homeTeam || !awayTeam || typeof homeTeam !== 'object' || typeof awayTeam !== 'object') {
    return {
      homeTeam: { name: 'Unknown Team', logo: '/defaults/team-logo.svg' },
      awayTeam: { name: 'Unknown Team', logo: '/defaults/team-logo.svg' },
    };
  }

  const homeTeamName = homeTeam.name ?? homeTeam.nickname ?? homeTeam.code ?? 'Unknown Team';
  const awayTeamName = awayTeam.name ?? awayTeam.nickname ?? awayTeam.code ?? 'Unknown Team';
  const homeTeamLogo =
    homeTeam.logo && homeTeam.logo.trim() !== '' ? homeTeam.logo : '/defaults/team-logo.svg';
  const awayTeamLogo =
    awayTeam.logo && awayTeam.logo.trim() !== '' ? awayTeam.logo : '/defaults/team-logo.svg';

  return {
    homeTeam: { name: homeTeamName, logo: homeTeamLogo },
    awayTeam: { name: awayTeamName, logo: awayTeamLogo },
  };
};

// Helper function to get team display from game data
export const getTeamDisplay = (game: IGameLog['game'], includeDate = true): string => {
  if (!game || typeof game !== 'object') {
    return 'Unknown Teams';
  }

  // Handle multiple data formats: home_team/away_team, teams.home/teams.away, and teams.visitors/teams.home
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
        visitors?: { code?: string; nickname?: string; name?: string } | null;
      } | null;
      date?: string | Date;
    };
    // Handle both away/visitors naming conventions
    homeTeam = gameData.teams?.home;
    awayTeam = gameData.teams?.away || gameData.teams?.visitors;
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
