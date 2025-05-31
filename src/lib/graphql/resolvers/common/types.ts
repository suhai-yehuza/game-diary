import type { Context } from '@/lib/types/context.types';
import type { GameTeam } from '@/lib/types/shared.types';

// Common types for game data
export interface GameScores {
  visitors?: {
    points?: number;
  };
  home?: {
    points?: number;
  };
}

export interface GameTeams {
  home: GameTeam;
  visitors: GameTeam;
}

export interface GameArena {
  name?: string;
  city?: string;
  state?: string | null;
  country?: string | null;
}

export interface GameStatus {
  clock?: string;
  halftime?: boolean;
  long?: string;
  short?: string;
}

export interface GameData {
  id: string;
  date: string;
  status: string;
  homeTeam: GameTeam;
  awayTeam: GameTeam;
  homeTeamScore: number;
  awayTeamScore: number;
  arena?: {
    name: string;
    city: string;
    state?: string;
    country?: string;
  };
  league: string;
  season: number;
  stage: number;
  periods?: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  officials?: string[];
  timesTied?: number;
  leadChanges?: number;
  nugget?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MappedGame {
  id: string;
  date: {
    start: string;
    end: string | null;
    duration: string | null;
  };
  status: {
    clock: string;
    halftime: boolean;
    long: string;
    short: string;
  };
  arena: string;
  league: string;
  season: number;
  stage: number;
  periods: unknown[];
  scores: GameScores;
  officials: string[];
  timesTied: number | null;
  leadChanges: number | null;
  nugget: string | null;
  createdAt: string;
  updatedAt: string;
  homeTeamId: string;
  awayTeamId: string;
  teams: {
    home: GameTeam | null;
    visitors: GameTeam | null;
  };
  is_completed: boolean;
  awayTeamScore: number | null;
  homeTeamScore: number | null;
  gameType: string;
  nbaGameId: string;
}

// Common resolver context
export type ResolverContext = Context;

// Common pagination args
export interface PaginationArgs {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

// Common filter args
export interface FilterArgs {
  filters?: {
    [key: string]: unknown;
  };
}
