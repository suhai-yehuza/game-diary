/**
 * Centralized type exports for the Game Diary application
 *
 * This file provides a single entry point for importing types across the app.
 * Organized by category for better maintainability.
 */

// ============================================================================
// Core Domain Types
// ============================================================================
export type {
  // Game types that actually exist
  Game,
  GameTeam,
  GameScore,
  GameStatistics,
  GameFilters,
  GameApiResponse,
  GameResponseData,
  GameField,
  GameDate,
  GameStatus,
  GameArena,
  GamePeriods,
  ExtendedGame,
  SearchGame,

  // Game Log types
  GameLogInput,
  GameLogFormData,
  GameLogFormProps,

  // Component types that exist in consolidated
  GameStatsProps,
  TeamDisplayProps,

  // Team and Player types
  TeamSummary,
  Arena,
  TeamData,
  PlayerData,
  ApiTeam,

  // Database types
  DBGameRecord,
} from './consolidated.types';

// ============================================================================
// Component Types that exist in component-props.types
// ============================================================================
export type {
  ActivityTimelineProps,
  FriendActivityProps,
  StatsChartProps,
  ReactionDisplayProps,
  ReactionPickerProps,
} from './component-props.types';

// ============================================================================
// Configuration & Environment
// ============================================================================
export type {
  GameStatusValue,
  WatchedSettingValue,
  WatchedScopeValue,
  ClassificationValue,
} from './config.types';

export type { EnvConfig, DbEnvConfig } from '../validations/env';
export { envSchema, dbEnvSchema, validateRuntimeEnv } from '../validations/env';

// ============================================================================
// Database & API Types
// ============================================================================
export type { DatabaseClient, QueryOptions } from './database.types';
export type { CacheOptions, RedisClient } from './cache.types';

// ============================================================================
// GraphQL Types
// ============================================================================
export type {
  Player,
  Team,
  GameLog,
  Classification,
  TeamStats,
  TeamFilters,
} from './generated/graphql';

// ============================================================================
// Resolver Types
// ============================================================================
export type {
  PaginationArgs,
  UserFilters,
  UserSearchFilters,
  PlayerFilters,
  TeamFilters as ResolverTeamFilters,
  FilterArgs,
  ResolverContext,
} from './resolver.types';

// ============================================================================
// Validation Schemas
// ============================================================================
export type { TeamInput } from '../validations/team';
export { teamSchema } from '../validations/team';

export { createGameLogSchema } from '../validations/game-log';

// ============================================================================
// Utility Types
// ============================================================================
export type { RawTeamStatistics } from './shared.types';
export type { AppNotification, NotificationType } from './notification.types';
