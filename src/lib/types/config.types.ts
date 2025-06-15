/**
 * Configuration and constants types
 * This file contains types for:
 * - Constants and enums
 * - API configuration
 * - Game-related constants
 */

import type { ISortDirection } from '@src/lib/types/shared.types';

// ============= Constants =============

// Reaction emoji source of truth
export const REACTION_EMOJIS = {
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
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
  BASKETBALL: '🏀',
  SOCCER: '⚽',
  FOOTBALL: '🏈',
  BASEBALL: '⚾',
  TENNIS: '🎾',
  GOLF: '⛳',
} as const;

// Type for the keys of REACTION_EMOJIS
export type IReactionEmojiKey = keyof typeof REACTION_EMOJIS;

// Type for the values of REACTION_EMOJIS
export type IReactionEmojiValue = (typeof REACTION_EMOJIS)[IReactionEmojiKey];

// Type guard to check if a string is a valid ReactionEmojiKey
export const isReactionEmojiKey = (key: string): key is IReactionEmojiKey => {
  return key in REACTION_EMOJIS;
};

// Type guard to check if a string is a valid ReactionEmojiValue
export const isReactionEmojiValue = (value: string): value is IReactionEmojiValue => {
  return Object.values(REACTION_EMOJIS).includes(value as IReactionEmojiValue);
};

// Helper to get emoji value from key
export const getEmojiValue = (key: IReactionEmojiKey): IReactionEmojiValue => {
  return REACTION_EMOJIS[key];
};

// Helper to get key from emoji value
export const getEmojiKey = (value: IReactionEmojiValue): IReactionEmojiKey => {
  const entry = Object.entries(REACTION_EMOJIS).find(([_, v]) => v === value);
  if (!entry) {
    throw new Error(`Invalid emoji value: ${value}`);
  }
  return entry[0] as IReactionEmojiKey;
};

// Type for GraphQL enum values
export type IGraphQLReactionEmojiType = IReactionEmojiKey;

// Type guard for GraphQL enum values
export const isGraphQLReactionEmojiType = (value: string): value is IGraphQLReactionEmojiType => {
  return isReactionEmojiKey(value);
};

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

// Mapping frontend emoji keys to GraphQL enum values
// Generated from REACTION_EMOJIS to ensure they stay in sync
export const EMOJI_TO_GRAPHQL_MAPPING = Object.fromEntries(
  Object.keys(REACTION_EMOJIS).map(key => [key, key])
) as { [K in keyof typeof REACTION_EMOJIS]: K };

// ============= Type Definitions =============

// Status and Settings Types
export type IClassificationType = keyof typeof CLASSIFICATION;
export type IConferenceType = keyof typeof CONFERENCES;
export type IDivisionType = keyof typeof DIVISIONS;
export type IPermissionType = keyof typeof PERMISSIONS;
export type IResourceType = keyof typeof RESOURCES;
export type ISortDirectionType = keyof typeof SORT_DIRECTION;
export type ITargetTypeValue = (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES];
export type IConferenceValue = (typeof CONFERENCES)[IConferenceType];
export type IDivisionValue = (typeof DIVISIONS)[IDivisionType];
export type IGameStatusType = keyof typeof GAME_STATUS_VALUES;
export type ISortDirectionValue = (typeof SORT_DIRECTION)[ISortDirectionType];
export type IClassificationValue = (typeof CLASSIFICATION)[IClassificationType];
export type IFriendshipStatusType = keyof typeof FRIENDSHIP_STATUS;
export type IFriendshipStatusValue = (typeof FRIENDSHIP_STATUS)[IFriendshipStatusType];
export type IPermissionValue = (typeof PERMISSIONS)[IPermissionType];
export type IResourceValue = (typeof RESOURCES)[IResourceType];
export type IWatchedSettingType = keyof typeof WATCHED_SETTING;
export type IWatchedSettingValue = (typeof WATCHED_SETTING)[IWatchedSettingType];
export type IWatchedScopeType = keyof typeof WATCHED_SCOPE;
export type IWatchedScopeValue = (typeof WATCHED_SCOPE)[IWatchedScopeType];

export type IDistributionFunction = () => number;

export interface IRangeConfig {
  min: number;
  max: number;
  getRandom: IDistributionFunction;
}

export interface IBatchSizeConfig {
  GAMES: number;
  GAME_STATS: number;
  PLAYERS: number;
}

export interface IRateLimitConfig {
  MAX_RETRIES: number;
  BASE_DELAY: number;
  MAX_DELAY: number;
  RATE_LIMIT_DELAY: number;
}

export interface IClassificationWeights {
  private: number;
  protected: number;
  public: number;
}

export interface IDistributionFunctions {
  natural: (rand: number) => number;
  bellCurve: (u1: number, u2: number) => number;
  pareto: (rand: number, alpha?: number) => number;
  exponential: (rand: number) => number;
  powerLaw: (rand: number, exponent?: number) => number;
}

export interface IPaginationConfig {
  DEFAULT_PAGE_SIZE: number;
  HUGE_SIZE: number;
  DEFAULT_SORT_DIRECTION: ISortDirection;
  MAX_CHILD_COMMENT_DEPTH: number;
}

export const isValidReactionEmoji = (emoji: string): emoji is IReactionEmojiValue => {
  return isReactionEmojiValue(emoji);
};

export const isValidFriendshipStatus = (status: string): status is IFriendshipStatusValue => {
  return status in FRIENDSHIP_STATUS;
};

export const isValidWatchedSetting = (setting: string): setting is IWatchedSettingValue => {
  return setting in WATCHED_SETTING;
};
