export interface ISearchResult {
  id: string;
  type: 'user' | 'game_log';
  username?: string;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  user_id?: string;
  game_id?: string;
  rating_for_game?: number;
  classification?: string;
  created_at: string;
}

export interface ISearchResponse {
  success: boolean;
  data: {
    users: ISearchResult[];
    gameLogs: ISearchResult[];
    totalUsers: number;
    totalGameLogs: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
