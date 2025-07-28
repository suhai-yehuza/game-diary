/**
 * Consolidated Admin Types
 * All admin-related type definitions
 */

import type { ReactNode, FormEvent } from 'react';
import type { IBaseButtonProps, IBaseInputProps } from './ui.types';
import type { IPageInfo } from './core.types';
import type { TabValue } from './constant.types';
import type {
  IGamesFormProps,
  IGameStatsFormProps,
  ITeamsFormProps,
  ITeamStatsFormProps,
  IPlayersFormProps,
  IPlayerStatsFormProps,
  IStandingsFormProps,
} from './form.types';

// ========================================
// ADMIN DATABASE TYPES
// ========================================

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

// ========================================
// ADMIN EXPERIMENTAL TYPES
// ========================================

// Button - extends base button interface
export type ButtonProps = IBaseButtonProps & {
  children: ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

// Input - extends base input interface
export type InputProps = IBaseInputProps;

// Select - for dropdown components
export type SelectProps = {
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  className?: string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
};

// Label
export type LabelProps = {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
};

// Form types - re-export from formTypes.ts with seasons prop
export type GamesFormProps = IGamesFormProps & {
  seasons: Array<{ value: string; label: string }>;
  teams: Array<{ value: string; label: string }>;
};

export type GameStatsFormProps = IGameStatsFormProps;

export type TeamsFormProps = ITeamsFormProps & {
  seasons: Array<{ value: string; label: string }>;
  teams: Array<{ value: string; label: string }>;
};

export type TeamStatsFormProps = ITeamStatsFormProps & {
  seasons: Array<{ value: string; label: string }>;
  teams: Array<{ value: string; label: string }>;
};

export type PlayersFormProps = IPlayersFormProps & {
  seasons: Array<{ value: string; label: string }>;
  teams: Array<{ value: string; label: string }>;
};

export type PlayerStatsFormProps = IPlayerStatsFormProps & {
  seasons: Array<{ value: string; label: string }>;
  teams: Array<{ value: string; label: string }>;
};

export type StandingsFormProps = IStandingsFormProps & {
  seasons: Array<{ value: string; label: string }>;
};

// DataDisplay
export type DataDisplayProps = {
  data: unknown;
  loading: boolean;
  error: string | null;
  selectedTab: string;
};

// NavigationTabs
export type NavigationTabsProps = {
  selectedTab: TabValue;
  setSelectedTab: (tab: TabValue) => void;
};

// SimpleEndpoints
export type SimpleEndpointsProps = {
  selectedTab: TabValue;
  loading: boolean;
  handleFetch: (endpoint: string, params: Record<string, string>) => Promise<void>;
};

// GamesSection
export type GamesSectionProps = {
  gamesSubTab: string;
  setGamesSubTab: (tab: string) => void;
  gameParams: Record<string, string>;
  setGameParams: (params: Record<string, string>) => void;
  gameStatsId: string;
  setGameStatsId: (id: string) => void;
  loading: boolean;
  handleFetchGames: (e: FormEvent) => void;
  handleFetchGameStats: (e: FormEvent) => void;
  handleFetch: (endpoint: string, params: Record<string, string>) => Promise<void>;
  seasons: Array<{ value: string; label: string }>;
  teams: Array<{ value: string; label: string }>;
};

// TeamsSection
export type TeamsSectionProps = {
  teamsSubTab: string;
  setTeamsSubTab: (tab: string) => void;
  teamParams: Record<string, string>;
  setTeamParams: (params: Record<string, string>) => void;
  teamStatsParams: Record<string, string>;
  setTeamStatsParams: (params: Record<string, string>) => void;
  loading: boolean;
  handleFetchTeams: (e: FormEvent) => void;
  handleFetchTeamStats: (e: FormEvent) => void;
  seasons: Array<{ value: string; label: string }>;
  teams: Array<{ value: string; label: string }>;
};

// PlayersSection
export type PlayersSectionProps = {
  playersSubTab: string;
  setPlayersSubTab: (tab: string) => void;
  playerParams: Record<string, string>;
  setPlayerParams: (params: Record<string, string>) => void;
  playerStatsParams: Record<string, string>;
  setPlayerStatsParams: (params: Record<string, string>) => void;
  loading: boolean;
  handleFetchPlayers: (e: FormEvent) => void;
  handleFetchPlayerStats: (e: FormEvent) => void;
  seasons: Array<{ value: string; label: string }>;
  teams: Array<{ value: string; label: string }>;
};

// StandingsSection
export type StandingsSectionProps = {
  standingsParams: Record<string, string>;
  setStandingsParams: (params: Record<string, string>) => void;
  loading: boolean;
  handleFetchStandings: (e: FormEvent) => void;
  seasons: Array<{ value: string; label: string }>;
};
