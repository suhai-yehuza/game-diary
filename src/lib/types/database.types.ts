import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { Pool } from 'pg';

import type * as schema from '@src/lib/db/schema';
import type { baseTableConfig } from '@src/lib/db/schema/base-types';
import type {
  gameStatusEnum,
  notificationTypeEnum,
  reactionTypeEnum,
  watchedSettingEnum,
} from '@src/lib/db/schema/enums';
import type { game_logs, game_ratings, games } from '@src/lib/db/schema/game-schemas';
import type {
  nba_players,
  nba_player_stats,
  game_stats,
  seasons,
  nba_games,
  team_h2h,
} from '@src/lib/db/schema/nba-schemas';
import type { notifications } from '@src/lib/db/schema/notification-schemas';
import type {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
} from '@src/lib/db/schema/relations';
import type { teams } from '@src/lib/db/schema/team-schemas';
import type { reactions, users, friendships, comments } from '@src/lib/db/schema/user-schemas';
import type { OptimizedAPIClient } from '@src/lib/db/seed/utils/api-client';

export type IBaseDatabaseClient = NeonHttpDatabase<typeof schema>;

export type IDatabaseRow = Record<string, unknown>;

export interface IDatabaseConfig {
  env?: string;
  connectionString?: string;
  dbPool?: Pool;
}

export interface IDatabaseClient extends NeonHttpDatabase<typeof schema> {
  raw?: unknown;
}

export interface IDatabaseSeedingConfig {
  CONCURRENT_OPERATIONS: number;
  BATCH_SIZE: number;
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  USER_COUNT: number;
  DEFAULT_SAMPLE_COUNT: number;
}

export interface IQueryOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  retries?: number; // Alias for retryAttempts for backward compatibility
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  where?: Record<string, unknown>;
}

export interface IBatchProcessor<T, R> {
  processFn: (batch: T[], context?: Record<string, unknown>) => Promise<R>;
  context?: Record<string, unknown>;
}

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

export interface IUuidGenerationOptions {
  namespace?: string;
  logProgress?: boolean;
  useV7?: boolean;
  maxRetries?: number;
  batchSize?: number;
}

// Database Seeder Types
export interface IApplicationSeederOptions {
  db?: IDatabaseClient;
  apiClient: OptimizedAPIClient;
  processor: import('@src/lib/db/seed/data-processor').DataProcessor;
  tables?: string[];
  appendingData?: boolean;
  env?: string;
  shouldResetDb?: boolean;
  shouldTruncateTables?: boolean;
  seasons?: number[];
  skipExternalDb?: boolean;
  skipApplicationDb?: boolean;
  concurrency?: number;
  batchSize?: number;
  enableMonitoring?: boolean;
  skipUsers?: boolean;
  startDate?: string;
}

// Database Monitoring Types
export interface IMonitoringMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  queryPerformance: {
    [key: string]: {
      count: number;
      totalTime: number;
      avgTime: number;
    };
  };
  apiCalls: {
    [key: string]: number;
  };
  cacheMetrics: {
    hits: number;
    misses: number;
    size: number;
  };
  apiMetrics: {
    [key: string]: {
      count: number;
      success: number;
      failure: number;
      avgResponseTime: number;
    };
  };
  errors: {
    [key: string]: number;
  };
}

// Schema table types (moved from schema/types.ts)
export type BaseTable = typeof baseTableConfig;
export type UsersTable = typeof users;
export type TeamsTable = typeof teams;
export type CommentsTable = typeof comments;
export type ReactionsTable = typeof reactions;
export type NotificationsTable = typeof notifications;
export type FriendshipsTable = typeof friendships;
export type GameLogsTable = typeof game_logs;
export type GameRatingsTable = typeof game_ratings;
export type GamesTable = typeof games;
export type NBAGamesTable = typeof nba_games;
export type TeamH2HTable = typeof team_h2h;
export type NBAPlayersTable = typeof nba_players;
export type NBAPlayerStatsTable = typeof nba_player_stats;
export type GameStatsTable = typeof game_stats;
export type SeasonsTable = typeof seasons;

// Define schema type
export type Schema = {
  users: UsersTable & { relations: typeof usersRelations };
  teams: TeamsTable;
  comments: CommentsTable & { relations: typeof commentsRelations };
  reactions: ReactionsTable & { relations: typeof reactionsRelations };
  notifications: NotificationsTable;
  friendships: FriendshipsTable;
  game_logs: GameLogsTable & { relations: typeof gameLogsRelations };
  game_ratings: GameRatingsTable;
  games: GamesTable;
  nba_games: NBAGamesTable;
  team_h2h: TeamH2HTable;
  nba_players: NBAPlayersTable;
  nba_player_stats: NBAPlayerStatsTable;
  game_stats: GameStatsTable;
  seasons: SeasonsTable;
  enums: {
    game_status: typeof gameStatusEnum;
    notification_type: typeof notificationTypeEnum;
    reaction_type: typeof reactionTypeEnum;
    watchedSetting: typeof watchedSettingEnum;
  };
  base: typeof baseTableConfig;
};

// Define relations type
export type Relations = {
  users: typeof usersRelations;
  comments: typeof commentsRelations;
  reactions: typeof reactionsRelations;
  game_logs: typeof gameLogsRelations;
};
