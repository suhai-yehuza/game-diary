import type { InferSelectModel } from 'drizzle-orm';

import type { nba_games } from '@src/lib/db/schema/nba-schemas';
import type { GameStatusValue, ClassificationType } from '@src/lib/types/config.types';
import type { SortDirection } from '@src/lib/types/shared.types';

// Database Types
export type DBGameRecord = InferSelectModel<typeof nba_games>;

export type GameWithPossibleId = Game & { gameId?: string };

// Core Game Types
export interface GameTeam {
  id: string;
  name: string;
  nickname: string;
  code: string;
  logo: string | null;
}

export interface GameScore {
  points: number;
  win?: number;
  loss?: number;
  series?: {
    win: number;
    loss: number;
  };
  linescore?: number[];
}

export interface GameArena {
  name?: string;
  city?: string;
  state?: string | null;
  country?: string | null;
}

export interface GamePeriods {
  current: number;
  total: number;
  endOfPeriod: boolean;
}

export interface GameStatus {
  long?: string;
  short?: string;
  clock?: string | null;
  halftime?: boolean;
}

export interface GameDate {
  start: string;
  end?: string;
  duration?: string;
}

export interface GameTeams {
  home: GameTeam;
  visitors: GameTeam;
}

export interface GameScores {
  home: GameScore;
  visitors: GameScore;
}

export interface Game {
  id: string;
  date: GameDate;
  status: GameStatus;
  teams: GameTeams;
  scores: GameScores;
  arena?: GameArena;
  league: string;
  season: number;
  stage: number;
  periods?: GamePeriods;
  officials?: string[];
  timesTied?: number;
  leadChanges?: number;
  nugget?: string;
  createdAt?: string;
  updatedAt?: string;
  homeTeamId?: string;
  awayTeamId?: string;
}

export type ExtendedGame = Game & { extended?: boolean };
export type SearchGame = Game;

// Additional game-related types from common/types.ts
export interface GameScoresLegacy {
  visitors?: {
    points?: number;
  };
  home?: {
    points?: number;
  };
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
  scores: GameScoresLegacy;
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

// Game Statistics Types
export interface GameTeamStatistic {
  fastBreakPoints?: number;
  pointsInPaint?: number;
  biggestLead?: number;
  secondChancePoints?: number;
  pointsOffTurnovers?: number;
  longestRun?: number;
  fgm?: number;
  fga?: number;
  fgp?: string;
  ftm?: number;
  fta?: number;
  ftp?: string;
  tpm?: number;
  tpa?: number;
  tpp?: string;
  offReb?: number;
  defReb?: number;
  totReb?: number;
  assists?: number;
  pFouls?: number;
  steals?: number;
  turnovers?: number;
  blocks?: number;
  plusMinus?: number;
  min?: number;
  points?: number;
}

export interface GameTeamWithStats extends GameTeam {
  stats?: GameTeamStatistics;
}

export type GameTeamStatistics = {
  team: {
    id: number | string;
    name?: string;
    [key: string]: unknown;
  };
  statistics: GameStatistics[];
};

export interface GameWithStatistics extends Game {
  statistics: GameStatistics[];
}

export interface GameStatistics {
  playerId: string;
  teamId: string;
  minutes: string;
  minutesPlayed: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  turnovers: number;
  fouls: number;
  plusMinus: number;
  fieldGoals: {
    made: number;
    attempted: number;
    percentage: string;
  };
  threePointers: {
    made: number;
    attempted: number;
    percentage: string;
  };
  freeThrows: {
    made: number;
    attempted: number;
    percentage: string;
  };
}

// Game Filter Types
export interface GameFilters {
  gameId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  season?: number;
  status?: GameStatusValue;
  dateRange?: {
    start: Date;
    end?: Date;
  };
  classification?: ClassificationType;
  userId?: string;
  leadChangesMin?: number;
  leadChangesMax?: number;
  timesTiedMin?: number;
  timesTiedMax?: number;
  minScore?: number;
  maxScore?: number;
  officials?: string[];
  teamId?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
  league?: string;
  stage?: number;
  period?: number;
  arena?: string;
  nugget?: string;
}

export interface GameSortInput {
  field: string;
  direction: 'asc' | 'desc';
}

export type GameField =
  | 'season'
  | 'league'
  | 'date'
  | 'id'
  | 'stage'
  | 'status'
  | 'periods'
  | 'arena'
  | 'teams'
  | 'scores'
  | 'officials'
  | 'timesTied'
  | 'leadChanges'
  | 'nugget'
  | 'createdAt'
  | 'updatedAt';

// Game Query Types
export interface GameEdge {
  node: Game;
}

export interface GameConnection {
  edges: GameEdge[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface GameQueryResponse {
  games: GameConnection;
}

// Game Component Props
export type GameCardProps = {
  game: SearchGame;
  className?: string;
  index?: number;
  imageErrors?: Set<string>;
  onImageError?: (gameId: string) => void;
};

export type GamesListProps = {
  games: Game[];
  loading?: boolean;
  initialFilters?: GameFilters;
  onGameSelect?: (game: Game) => void;
};
