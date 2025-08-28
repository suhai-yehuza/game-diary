export interface ISearchResult<T = unknown> {
  items?: T[];
  total?: number;
  query?: string;
  filters?: Record<string, any>;
  suggestions?: string[];
  // User-specific fields
  id: string;
  type: 'user' | 'game_log' | 'game' | 'team' | 'player';
  username?: string;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  user_id?: string;
  game_id?: string;
  rating_for_game?: number;
  classification?: string;
  created_at: string;
  // Game-specific fields
  date?: string;
  status?: string;
  home_team_score?: number;
  away_team_score?: number;
  average_rating?: number | string;
  total_ratings?: number;
  home_team_name?: string;
  home_team_nickname?: string;
  home_team_city?: string;
  away_team_name?: string;
  away_team_nickname?: string;
  away_team_city?: string;
  // Team-specific fields
  name?: string;
  nickname?: string;
  city?: string;
  state?: string;
  conference?: string;
  division?: string;
  // Player-specific fields
  birth?: string;
  nba?: string;
  height?: string;
  weight?: string;
  college?: string;
  affiliation?: string;
  teams?: string;
  leagues?: string;
  image_url?: string;
}

export interface ISearchResponse {
  success: boolean;
  data: {
    users: ISearchResult[];
    gameLogs: ISearchResult[];
    games: ISearchResult[];
    teams: ISearchResult[];
    players: ISearchResult[];
    totalUsers: number;
    totalGameLogs: number;
    totalGames: number;
    totalTeams: number;
    totalPlayers: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
