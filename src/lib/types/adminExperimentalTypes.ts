// Types for Admin Experimental components and pages
import type { ReactNode, FormEvent } from 'react';

// Button
export type ButtonProps = {
  children: ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

// Input
export type InputProps = {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  id?: string;
  required?: boolean;
};

// Label
export type LabelProps = {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
};

// GamesForm
export type GamesFormProps = {
  gameParams: Record<string, string>;
  setGameParams: (params: Record<string, string>) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void | Promise<void>;
};

// GameStatsForm
export type GameStatsFormProps = {
  gameStatsId: string;
  setGameStatsId: (id: string) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void | Promise<void>;
};

// TeamsForm
export type TeamsFormProps = {
  teamParams: Record<string, string>;
  setTeamParams: (params: Record<string, string>) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void | Promise<void>;
};

// TeamStatsForm
export type TeamStatsFormProps = {
  teamStatsParams: Record<string, string>;
  setTeamStatsParams: (params: Record<string, string>) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void | Promise<void>;
};

// PlayersForm
export type PlayersFormProps = {
  playerParams: Record<string, string>;
  setPlayerParams: (params: Record<string, string>) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void | Promise<void>;
};

// PlayerStatsForm
export type PlayerStatsFormProps = {
  playerStatsParams: Record<string, string>;
  setPlayerStatsParams: (params: Record<string, string>) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void | Promise<void>;
};

// StandingsForm
export type StandingsFormProps = {
  standingsParams: Record<string, string>;
  setStandingsParams: (params: Record<string, string>) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void | Promise<void>;
};

// DataDisplay
export type DataDisplayProps = {
  data: unknown;
  loading: boolean;
  error: string | null;
  selectedTab: string;
};

// NavigationTabs
import type { TabValue } from '@/lib/types/constantTypes';
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
