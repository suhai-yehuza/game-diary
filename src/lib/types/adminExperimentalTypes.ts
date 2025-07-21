// Types for Admin Experimental components and pages
import type { ReactNode, FormEvent } from 'react';
import type { TabValue } from '@/lib/types/constantTypes';
import type { IBaseButtonProps, IBaseInputProps } from '@/lib/types/uiTypes';
import type {
  IGamesFormProps,
  IGameStatsFormProps,
  ITeamsFormProps,
  ITeamStatsFormProps,
  IPlayersFormProps,
  IPlayerStatsFormProps,
  IStandingsFormProps,
} from '@/lib/types/formTypes';

// Button - extends base button interface
export type ButtonProps = IBaseButtonProps & {
  children: ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

// Input - extends base input interface
export type InputProps = IBaseInputProps;

// Label
export type LabelProps = {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
};

// Form types - re-export from formTypes.ts
export type {
  IGamesFormProps as GamesFormProps,
  IGameStatsFormProps as GameStatsFormProps,
  ITeamsFormProps as TeamsFormProps,
  ITeamStatsFormProps as TeamStatsFormProps,
  IPlayersFormProps as PlayersFormProps,
  IPlayerStatsFormProps as PlayerStatsFormProps,
  IStandingsFormProps as StandingsFormProps,
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
};
