// Types for Admin Database components and pages
import type { IPageInfo } from '@/lib/types';

// User-related types
export interface IUserSummary {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number?: string;
  image_url?: string;
  created_at?: string;
}

// Game log-related types
export interface IGameLogSummary {
  id: string;
  game_id: string;
  rating_for_game: number;
  classification: string;
  watched_setting?: string;
  watched_location?: string;
  watched_scope?: string;
  watched_date?: string;
  created_at?: string;
  user?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

// GraphQL response types
export interface ISearchUsersResponse {
  data?: {
    searchUsers?: {
      edges?: { node?: IUserSummary; cursor: string }[];
      pageInfo?: IPageInfo;
      totalCount?: number;
    };
  };
  errors?: { message: string }[];
}

export interface ISearchGameLogsResponse {
  data?: {
    searchGameLogs?: {
      edges?: { node?: IGameLogSummary; cursor: string }[];
      pageInfo?: IPageInfo;
      totalCount?: number;
    };
  };
  errors?: { message: string }[];
}

// Search field types
export type UserSearchField = 'all' | 'username' | 'first_name' | 'last_name' | 'email_address';

export type GameLogSearchField =
  | 'all'
  | 'user_id'
  | 'game_id'
  | 'classification'
  | 'rating_for_game'
  | 'watched_setting'
  | 'watched_location';
