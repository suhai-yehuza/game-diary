// Types for Admin Experimental components and pages
import type { ReactNode, FormEvent } from 'react';

// Button
export type ButtonProps = {
  readonly children: ReactNode;
  readonly variant?: 'default' | 'outline';
  readonly size?: 'default' | 'sm';
  readonly className?: string;
  readonly disabled?: boolean;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

// Input
export type InputProps = {
  readonly className?: string;
  readonly type?: string;
  readonly placeholder?: string;
  readonly value?: string;
  readonly onChange?: React.ChangeEventHandler<HTMLInputElement>;
  readonly id?: string;
  readonly required?: boolean;
};

// Label
export type LabelProps = {
  readonly children: ReactNode;
  readonly htmlFor?: string;
  readonly className?: string;
};

// GamesForm
export type GamesFormProps = {
  readonly gameParams: Readonly<Record<string, string>>;
  readonly setGameParams: (params: Readonly<Record<string, string>>) => void;
  readonly loading: boolean;
  readonly onSubmit: (e: Readonly<FormEvent>) => void;
};

// GameStatsForm
export type GameStatsFormProps = {
  readonly gameStatsId: string;
  readonly setGameStatsId: (id: Readonly<string>) => void;
  readonly loading: boolean;
  readonly onSubmit: (e: Readonly<FormEvent>) => void;
};

// TeamsForm
export type TeamsFormProps = {
  readonly teamParams: Readonly<Record<string, string>>;
  readonly setTeamParams: (params: Readonly<Record<string, string>>) => void;
  readonly loading: boolean;
  readonly onSubmit: (e: Readonly<FormEvent>) => void;
};

// TeamStatsForm
export type TeamStatsFormProps = {
  readonly teamStatsParams: Readonly<Record<string, string>>;
  readonly setTeamStatsParams: (params: Readonly<Record<string, string>>) => void;
  readonly loading: boolean;
  readonly onSubmit: (e: Readonly<FormEvent>) => void;
};

// PlayersForm
export type PlayersFormProps = {
  readonly playerParams: Readonly<Record<string, string>>;
  readonly setPlayerParams: (params: Readonly<Record<string, string>>) => void;
  readonly loading: boolean;
  readonly onSubmit: (e: Readonly<FormEvent>) => void;
};

// PlayerStatsForm
export type PlayerStatsFormProps = {
  readonly playerStatsParams: Readonly<Record<string, string>>;
  readonly setPlayerStatsParams: (params: Readonly<Record<string, string>>) => void;
  readonly loading: boolean;
  readonly onSubmit: (e: Readonly<FormEvent>) => void;
};

// StandingsForm
export type StandingsFormProps = {
  readonly standingsParams: Readonly<Record<string, string>>;
  readonly setStandingsParams: (params: Readonly<Record<string, string>>) => void;
  readonly loading: boolean;
  readonly onSubmit: (e: Readonly<FormEvent>) => void;
};

// DataDisplay
export type DataDisplayProps = {
  readonly data: unknown;
  readonly loading: boolean;
  readonly error: string | null;
  readonly selectedTab: string;
};

// NavigationTabs
import type { TabValue } from '@/lib/types/constant.types';
export type NavigationTabsProps = {
  selectedTab: TabValue;
  setSelectedTab: (tab: TabValue) => void;
};

// SimpleEndpoints
export type SimpleEndpointsProps = {
  selectedTab: TabValue;
  loading: boolean;
  handleFetch: (endpoint: string, params: Readonly<Record<string, string>>) => Promise<void>;
};

// GamesSection
export type GamesSectionProps = {
  gamesSubTab: string;
  setGamesSubTab: (tab: Readonly<string>) => void;
  gameParams: Readonly<Record<string, string>>;
  setGameParams: (params: Readonly<Record<string, string>>) => void;
  gameStatsId: string;
  setGameStatsId: (id: Readonly<string>) => void;
  loading: boolean;
  handleFetchGames: (e: Readonly<FormEvent>) => void;
  handleFetchGameStats: (e: Readonly<FormEvent>) => void;
};

// TeamsSection
export type TeamsSectionProps = {
  teamsSubTab: string;
  setTeamsSubTab: (tab: Readonly<string>) => void;
  teamParams: Readonly<Record<string, string>>;
  setTeamParams: (params: Readonly<Record<string, string>>) => void;
  teamStatsParams: Readonly<Record<string, string>>;
  setTeamStatsParams: (params: Readonly<Record<string, string>>) => void;
  loading: boolean;
  handleFetchTeams: (e: Readonly<FormEvent>) => void;
  handleFetchTeamStats: (e: Readonly<FormEvent>) => void;
};

// PlayersSection
export type PlayersSectionProps = {
  playersSubTab: string;
  setPlayersSubTab: (tab: Readonly<string>) => void;
  playerParams: Readonly<Record<string, string>>;
  setPlayerParams: (params: Readonly<Record<string, string>>) => void;
  playerStatsParams: Readonly<Record<string, string>>;
  setPlayerStatsParams: (params: Readonly<Record<string, string>>) => void;
  loading: boolean;
  handleFetchPlayers: (e: Readonly<FormEvent>) => void;
  handleFetchPlayerStats: (e: Readonly<FormEvent>) => void;
};
