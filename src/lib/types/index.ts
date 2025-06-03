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
  // Game types
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

  // User & Social types
  UserProfile,
  UserActivity,
  Friend,
  FriendGroup,
  FriendRequest,

  // API Response types
  ApiResponse,
  APIError,
  Activity,
} from './consolidated.types';

// ============================================================================
// Component Types
// ============================================================================
export type {
  GameLogFormProps,
  GameStatsProps,
  UserSearchProps,
  FriendActivityProps,
} from './component-props.types';

export type { ComponentWithChildren, PageProps, LayoutProps } from './component.types';

// ============================================================================
// Configuration & Environment
// ============================================================================
export type {
  GameStatusValue,
  WatchedSettingValue,
  WatchedScopeValue,
  ClassificationValue,
} from './config.types';

export type { EnvConfig } from './validations/env';
export { envSchema, validateRuntimeEnv } from './validations/env';

// ============================================================================
// Database & API Types
// ============================================================================
export type { DatabaseClient, QueryOptions, PaginationOptions } from './database.types';

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
// Validation Schemas
// ============================================================================
export type { TeamInput } from '@/lib/validations/team';
export { teamSchema } from '@/lib/validations/team';

export type { GameLogInput } from '@/lib/validations/game-log';
export { createGameLogSchema } from '@/lib/validations/game-log';

// ============================================================================
// Utility Types
// ============================================================================
export type { RawTeamStatistics } from './shared.types';
export type { AppNotification, NotificationType } from './notification.types';
