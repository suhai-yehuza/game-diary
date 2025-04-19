import type { ValidationError } from './graphql';
import { NextApiRequest } from 'next';
import { DocumentNode, ApolloCache, FetchResult } from '@apollo/client';
import type { DatabaseClient } from '../db.types';
import type {
  BaseUser,
  BaseGame,
  BaseGameLog,
  BaseComment,
  BaseReaction,
  BaseFriendship,
  DBPlayer,
} from '../shared.types';
import type { Pool } from 'pg';

export type DBUser = BaseUser & {
  comments: BaseComment[];
  gameLogs: BaseGameLog[];
  initiated_friendships: BaseFriendship[];
  received_friendships: BaseFriendship[];
  reactions: BaseReaction[];
};

export type DBSeason = {
  id: string;
  year: number;
  start_date: Date;
  end_date: Date;
  is_current: boolean;
  is_playoffs: boolean;
  display_year: string;
};

export type DbGame = BaseGame & {
  arena: {
    name: string;
    city: string;
  };
  league: string;
  season: number;
  stage: number;
  periods: {
    current: number;
  };
  teams: {
    home: {
      id: string;
      name: string;
      nickname: string;
      logo?: string;
    };
    visitors: {
      id: string;
      name: string;
      nickname: string;
      logo?: string;
    };
  };
  scores: {
    home: {
      points: number;
    };
    visitors: {
      points: number;
    };
  };
  officials: string[];
  timesTied?: number;
  leadChanges?: number;
  nugget?: string;
  isCompleted: boolean;
};

export type DBTeam = {
  id: string;
  name: string;
  nickname: string;
  code: string;
  city: string;
  logo?: string;
  allStar: boolean;
  nbaFranchise: boolean;
  leagues: any;
  created_at: Date;
  updated_at: Date;
};

export type DBTeamStats = {
  games?: number;
  points?: number;
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
  fastBreakPoints?: number;
  pointsInPaint?: number;
  biggestLead?: number;
  secondChancePoints?: number;
  pointsOffTurnovers?: number;
  longestRun?: number;
};

export type DBComment = BaseComment & {
  user: BaseUser;
  reactions: BaseReaction[];
};

export type DBReaction = BaseReaction & {
  user: BaseUser;
};

export type DBUserSummary = BaseUser;

export type DBFriendship = BaseFriendship;

export type DBGameLog = BaseGameLog & {
  game: DbGame;
  user: BaseUser;
  comments: BaseComment[];
  reactions: BaseReaction[];
};

export type DBClassification = 'WATCHED' | 'PLANNED' | 'SKIPPED';

export type DBWatchedSettingType = 'LIVE' | 'REPLAY' | 'HIGHLIGHTS';

export type DBLoaders = {
  user: (id: string) => Promise<DBUser>;
  game: (id: string) => Promise<DbGame>;
  team: (id: string) => Promise<DBTeam>;
  player: (id: string) => Promise<DBPlayer>;
  gameLog: (id: string) => Promise<DBGameLog>;
  comment: (id: string) => Promise<DBComment>;
  reaction: (id: string) => Promise<DBReaction>;
  friendship: (id: string) => Promise<DBFriendship>;
};

export type DBContext = {
  user?: DBUser;
  loaders: DBLoaders;
  db: DatabaseClient;
};

export class UuidGenerationError extends Error {
  code: string;
  details?: string;

  constructor(message: string, code: string = 'UUID_GENERATION_ERROR', details?: string) {
    super(message);
    this.name = 'UuidGenerationError';
    this.code = code;
    this.details = details;
  }
}

export type UuidGenerationOptions = {
  name?: string;
  logProgress?: boolean;
  useV7?: boolean;
  maxRetries?: number;
  batchSize?: number;
};

export interface BatchProcessor<T, R> {
  processFn: (batch: T[], context?: Record<string, unknown>) => Promise<R>;
  context?: Record<string, unknown>;
}

export interface DatabaseConfig {
  dbPool?: Pool;
}

export type DateFields = {
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
};

export type ButtonProps = {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
};

export type InputProps = {
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  min?: number;
  max?: number;
  autoComplete?: string;
  spellCheck?: string;
};

export type StarRatingProps = {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export type UseMutationWithOptimisticUpdateOptions<T, V> = {
  mutation: DocumentNode;
  update?: (cache: ApolloCache<T>, result: FetchResult<T>) => void;
  optimisticResponse: (variables: V) => T;
  validate?: (variables: V) => ValidationError[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

export type UsePullToRefreshOptions = {
  onRefresh: () => Promise<void>;
  enabled?: boolean;
  threshold?: number;
  maxPullDistance?: number;
};

export type SwipeAction = {
  label: string;
  color: string;
  onAction: () => void;
};

export type UseSwipeActionsOptions = {
  actions: SwipeAction[];
  threshold?: number;
  maxSwipeDistance?: number;
  onSwipe?: (direction: 'left' | 'right') => void;
};

export type MonitoringMetrics = {
  queryPerformance: Record<string, {
    count: number;
    totalTime: number;
    avgTime: number;
  }>;
  cacheMetrics: {
    hits: number;
    misses: number;
    sets: number;
  };
  apiMetrics: Record<string, {
    count: number;
    errors: number;
    avgResponseTime: number;
  }>;
  errors: {
    count: number;
    types: Record<string, number>;
  };
};

export type ExtendedNextApiRequest = NextApiRequest & {
  user?: DBUser;
  db: DatabaseClient;
  loaders: DBLoaders;
  selectedFields?: string[];
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
};

export type TeamData = {
  id: string;
  name: string;
  nickname: string;
  code: string;
  logo: string;
  allStar: boolean;
  nbaFranchise: boolean;
  leagues: {
    standard?: {
      conference?: string;
      division?: string;
    };
    [key: string]: {
      conference?: string;
      division?: string;
    } | undefined;
  };
  created_at: string;
  updated_at: string;
}; 