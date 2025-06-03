/**
 * Consolidated types for configuration and constants
 * This file combines types from:
 * - constants.types.ts
 * - api-config.types.ts
 */

import { SortDirection } from '@/lib/types/consolidated.types';

// ============= Constants =============

// Reaction emoji source of truth
export const REACTION_EMOJIS = {
  LIKE: '👍',
  LOVE: '❤️',
  LAUGH: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😠',
  FIRE: '🔥',
  CLAP: '👏',
  EYES: '👀',
  ROCKET: '🚀',
  MUSCLE: '💪',
  GOAT: '🐐',
  BULLSEYE: '🎯',
  THUMBS_DOWN: '👎',
  BASKETBALL: '🏀',
  SOCCER: '⚽',
  FOOTBALL: '🏈',
  BASEBALL: '⚾',
  TENNIS: '🎾',
  GOLF: '⛳',
} as const;

export type ReactionEmojiKey = keyof typeof REACTION_EMOJIS;
export type ReactionEmojiValue = (typeof REACTION_EMOJIS)[ReactionEmojiKey];

// Cache Configuration
export const CACHE_TTL = {
  USER: 3600, // 1 hour
  GAME: 3600, // 1 hour
  TEAM: 3600, // 1 hour
  PLAYER: 3600, // 1 hour
  STANDINGS: 3600, // 1 hour
  USER_GAME_LOGS: 3600, // 1 hour
  COMMENTS: 3600, // 1 hour
  REACTIONS: 3600, // 1 hour
  FRIEND_REQUESTS: 3600, // 1 hour
  DEFAULT: 3600, // 1 hour default
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Game-related Constants
export const validDivisions = [
  'Atlantic',
  'Central',
  'Southeast',
  'Northwest',
  'Pacific',
  'Southwest',
] as const;

export const validConferences = ['Eastern', 'Western'] as const;

export const validPositions = ['PG', 'SG', 'SF', 'PF', 'C'] as const;

// Enums as Constant Objects
export const CLASSIFICATION = {
  PRIVATE: 'Private',
  PROTECTED: 'Protected',
  PUBLIC: 'Public',
} as const;

export const FRIENDSHIP_STATUS = {
  ACCEPTED: 'Accepted',
  BLOCKED: 'Blocked',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
} as const;

export const WATCHED_SETTING = {
  TV: 'TV',
  ARENA: 'Arena',
  PHONE: 'Phone',
  LAPTOP: 'Laptop',
  BAR: 'Bar',
  HOME: 'Home',
  OTHER: 'Other',
} as const;

export const WATCHED_SCOPE = {
  FULL_GAME: 'Full Game',
  HALF_GAME: 'Half Game',
  HIGHLIGHTS: 'Highlights',
  PRE_GAME: 'Pre-Game',
  POST_GAME: 'Post-Game',
  SHORTS: 'Shorts',
  OTHER: 'Other',
} as const;

export const CONFERENCES = {
  EAST: 'east',
  WEST: 'west',
} as const;

export const DIVISIONS = {
  ATLANTIC: 'atlantic',
  CENTRAL: 'central',
  SOUTHEAST: 'southeast',
  NORTHWEST: 'northwest',
  PACIFIC: 'pacific',
  SOUTHWEST: 'southwest',
} as const;

export const GAME_STATUS_VALUES = {
  FINISHED: 'Finished',
  Live: 'Live',
  SCHEDULED: 'Scheduled',
} as const;

export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
  CREATE: 'create',
  UPDATE: 'update',
} as const;

export const RESOURCES = {
  USER: 'user',
  GAME_LOG: 'game_log',
  COMMENT: 'comment',
  REACTION: 'reaction',
  FRIENDSHIP: 'friendship',
  GAME_RATING: 'game_rating',
} as const;

export const SORT_DIRECTION = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export const TARGET_TYPES = {
  game_log: 'game_log',
  comment: 'comment',
} as const;

export const LEAGUES = {
  NBA: 'NBA',
  NHL: 'NHL',
  MLB: 'MLB',
  NFL: 'NFL',
  MLS: 'MLS',
};

// ============= Type Definitions =============

// Status and Settings Types
export type ClassificationType = keyof typeof CLASSIFICATION;
export type ConferenceType = keyof typeof CONFERENCES;
export type DivisionType = keyof typeof DIVISIONS;
export type GameStatusType = keyof typeof GAME_STATUS_VALUES;
export type PermissionType = keyof typeof PERMISSIONS;
export type ResourceType = keyof typeof RESOURCES;
export type SortDirectionType = keyof typeof SORT_DIRECTION;
export type TargetTypeValue = (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES];
export type ConferenceValue = (typeof CONFERENCES)[ConferenceType];
export type DivisionValue = (typeof DIVISIONS)[DivisionType];
export type GameStatusValue = (typeof GAME_STATUS_VALUES)[GameStatusType];
export type SortDirectionValue = (typeof SORT_DIRECTION)[SortDirectionType];
export type ClassificationValue = (typeof CLASSIFICATION)[ClassificationType];
export type FriendshipStatusType = keyof typeof FRIENDSHIP_STATUS;
export type FriendshipStatusValue = (typeof FRIENDSHIP_STATUS)[FriendshipStatusType];
export type PermissionValue = (typeof PERMISSIONS)[PermissionType];
export type ResourceValue = (typeof RESOURCES)[ResourceType];
export type WatchedSettingType = keyof typeof WATCHED_SETTING;
export type WatchedSettingValue = (typeof WATCHED_SETTING)[WatchedSettingType];
export type WatchedScopeType = keyof typeof WATCHED_SCOPE;
export type WatchedScopeValue = (typeof WATCHED_SCOPE)[WatchedScopeType];

// Configuration Types
export type DistributionFunction = () => number;

export interface RangeConfig {
  min: number;
  max: number;
  getRandom: DistributionFunction;
}

export interface BatchSizeConfig {
  GAMES: number;
  GAME_STATS: number;
  PLAYERS: number;
}

export interface RateLimitConfig {
  MAX_RETRIES: number;
  BASE_DELAY: number;
  MAX_DELAY: number;
  RATE_LIMIT_DELAY: number;
}

export interface ClassificationWeights {
  private: number;
  protected: number;
  public: number;
}

export interface DistributionFunctions {
  natural: (rand: number) => number;
  bellCurve: (u1: number, u2: number) => number;
  pareto: (rand: number, alpha?: number) => number;
  exponential: (rand: number) => number;
  powerLaw: (rand: number, exponent?: number) => number;
}

export interface PaginationConfig {
  DEFAULT_PAGE_SIZE: number;
  MAX_PAGE_SIZE: number;
  DEFAULT_SORT_DIRECTION: SortDirection;
  MAX_CHILD_COMMENT_DEPTH: number;
}

// Utility Functions
export const isValidReactionEmoji = (emoji: string): emoji is ReactionEmojiValue => {
  return Object.values(REACTION_EMOJIS).includes(emoji as ReactionEmojiValue);
};

export const isValidFriendshipStatus = (status: string): status is FriendshipStatusValue => {
  return Object.values(FRIENDSHIP_STATUS).includes(status as FriendshipStatusValue);
};

export const isValidWatchedSetting = (setting: string): setting is WatchedSettingValue => {
  return Object.values(WATCHED_SETTING).includes(setting as WatchedSettingValue);
};
