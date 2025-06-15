import type { InferSelectModel } from 'drizzle-orm';

import type { nba_games } from '@src/lib/db/schema/nba-schemas';
import type {
  GAME_STATUS_VALUES,
  IClassificationType as ClassificationType,
} from '@src/lib/types/config.types';
import type { ISortDirection } from '@src/lib/types/shared.types';

// Database Types
export type IDBGameRecord = InferSelectModel<typeof nba_games>;

export interface IGameWithPossibleId extends IGame {
  gameId?: string;
}

// Core Game Types
export interface IGameTeam {
  id: string;
  name: string;
  nickname: string;
  code: string;
  logo: string | null;
}

export interface IGameScore {
  points: number;
  win?: number;
  loss?: number;
  series?: {
    win: number;
    loss: number;
  };
  linescore?: number[];
}

export interface IGameArena {
  name?: string;
  city?: string;
  state?: string | null;
  country?: string | null;
}

export interface IGamePeriods {
  current: number;
  total: number;
  endOfPeriod: boolean;
}

export interface IGameStatus {
  long?: string;
  short?: string;
  clock?: string | null;
  halftime?: boolean;
}

export interface IGameDate {
  start: string;
  end?: string;
  duration?: string;
}

export interface IGameTeams {
  home: IGameTeam;
  visitors: IGameTeam;
}

export interface IGameScores {
  home: IGameScore;
  visitors: IGameScore;
}

export interface IGame {
  id: string;
  date: {
    start: string;
    end: string | null;
    duration: string | number | null;
  };
  status: {
    long: string;
    short: string;
    clock?: string | null;
    halftime?: boolean;
  };
  arena?: IGameArena;
  league: string;
  season: number;
  stage: number;
  periods?: IGamePeriods;
  teams: IGameTeams;
  scores: IGameScores;
  officials?: string[];
  timesTied?: number | null;
  leadChanges?: number | null;
  nugget?: string | null;
  createdAt?: string;
  updatedAt?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  isCompleted?: boolean;
  awayTeamScore?: number | null;
  homeTeamScore?: number | null;
  gameType?: string;
  nbaGameId?: string;
}

export interface IExtendedGame extends IGame {
  extended?: boolean;
}

export type ISearchGame = IGame;

// Additional game-related types from common/types.ts
export interface IGameScoresLegacy {
  visitors?: {
    points?: number;
  };
  home?: {
    points?: number;
  };
}

export interface IGameData {
  id: string;
  date: string;
  status: string;
  homeTeam: IGameTeam;
  awayTeam: IGameTeam;
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

export interface IMappedGame {
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
  scores: IGameScoresLegacy;
  officials: string[];
  timesTied: number | null;
  leadChanges: number | null;
  nugget: string | null;
  createdAt: string;
  updatedAt: string;
  homeTeamId: string;
  awayTeamId: string;
  teams: {
    home: IGameTeam | null;
    visitors: IGameTeam | null;
  };
  is_completed: boolean;
  awayTeamScore: number | null;
  homeTeamScore: number | null;
  gameType: string;
  nbaGameId: string;
}

// Game Statistics Types
export interface IGameTeamStatistic {
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

export interface IGameTeamWithStats extends IGameTeam {
  stats: IGameTeamStatistic;
}

export interface IGameTeamStatistics {
  team: {
    id: number | string;
    name?: string;
    [key: string]: unknown;
  };
  statistics: IGameStatistics[];
}

export interface IGameWithStatistics extends IGame {
  statistics: IGameStatistics[];
}

export interface IGameStatistics {
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
export interface IGameFilters {
  gameId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  season?: number;
  status?: (typeof GAME_STATUS_VALUES)[keyof typeof GAME_STATUS_VALUES];
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
  sortDirection?: ISortDirection;
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

export interface IGameSortInput {
  field: string;
  direction: 'asc' | 'desc';
}

export type IGameField =
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
export interface IGameEdge {
  node: IGame;
}

export interface IGameConnection {
  edges: IGameEdge[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface IGameQueryResponse {
  games: {
    edges: IGameEdge[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

// Game Component Props
export interface IGameCardProps {
  game: ISearchGame;
  className?: string;
  index?: number;
  imageErrors?: Set<string>;
  onImageError?: (gameId: string) => void;
}

export interface IGamesListProps {
  games: IGame[];
  loading?: boolean;
  initialFilters?: IGameFilters;
  onGameSelect?: (game: IGame) => void;
}

export interface IProcessedGames {
  live: IGame[];
  scheduled: IGame[];
  completed: IGame[];
}
