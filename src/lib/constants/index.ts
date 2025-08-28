/**
 * Application Constants
 * This file contains all constants used throughout the application
 * to avoid circular dependencies with the types system.
 */

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

// Enums as Constant Objects
export const CLASSIFICATION = {
  PRIVATE: 'PRIVATE',
  PROTECTED: 'PROTECTED',
  PUBLIC: 'PUBLIC',
} as const;

export const FRIENDSHIP_STATUS = {
  ACCEPTED: 'ACCEPTED',
  BLOCKED: 'BLOCKED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
} as const;

export const WATCHED_SETTING = {
  TV: 'TV',
  ARENA: 'ARENA',
  PHONE: 'PHONE',
  LAPTOP: 'LAPTOP',
  BAR: 'BAR',
  HOME: 'HOME',
  OTHER: 'OTHER',
} as const;

export const WATCHED_SCOPE = {
  FULL_GAME: 'FULL_GAME',
  HALF_GAME: 'HALF_GAME',
  HIGHLIGHTS: 'HIGHLIGHTS',
  PRE_GAME: 'PRE_GAME',
  POST_GAME: 'POST_GAME',
  SHORTS: 'SHORTS',
  OTHER: 'OTHER',
} as const;

export const CONFERENCES = {
  EAST: 'EAST',
  WEST: 'WEST',
} as const;

export const DIVISIONS = {
  ATLANTIC: 'ATLANTIC',
  CENTRAL: 'CENTRAL',
  SOUTHEAST: 'SOUTHEAST',
  NORTHWEST: 'NORTHWEST',
  PACIFIC: 'PACIFIC',
  SOUTHWEST: 'SOUTHWEST',
} as const;

export const GAME_STATUS_VALUES = {
  FINISHED: 'FINISHED',
  LIVE: 'LIVE',
  SCHEDULED: 'SCHEDULED',
} as const;

export const RESOURCES = {
  USER: 'USER',
  GAME_LOG: 'GAME_LOG',
  COMMENT: 'COMMENT',
  REACTION: 'REACTION',
  FRIENDSHIP: 'FRIENDSHIP',
  GAME_RATING: 'GAME_RATING',
} as const;

export const SORT_DIRECTION = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export const TARGET_TYPES = {
  GAME_LOG: 'GAME_LOG',
  COMMENT: 'COMMENT',
} as const;

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

// Mapping frontend emoji keys to GraphQL enum values
// Generated from REACTION_EMOJIS to ensure they stay in sync
export const EMOJI_TO_GRAPHQL_MAPPING = Object.fromEntries(
  Object.keys(REACTION_EMOJIS).map(key => [key, key])
) as { [K in keyof typeof REACTION_EMOJIS]: K };

export const TABS = {
  STANDINGS: 'standings',
  PLAYERS: 'players',
  TEAMS: 'teams',
  GAMES: 'games',
  LEAGUES: 'leagues',
  SEASONS: 'seasons',
  SEARCH: 'search',
} as const;

// ============= Type Definitions =============

// Status and Settings Types
export type IClassificationType = keyof typeof CLASSIFICATION;
export type IConferenceType = keyof typeof CONFERENCES;
export type IDivisionType = keyof typeof DIVISIONS;
export type IResourceType = keyof typeof RESOURCES;
export type ISortDirectionType = keyof typeof SORT_DIRECTION;
export type ITargetTypeValue = (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES];
export type IConferenceValue = (typeof CONFERENCES)[IConferenceType];
export type IDivisionValue = (typeof DIVISIONS)[IDivisionType];
export type IGameStatusType = keyof typeof GAME_STATUS_VALUES;
export type ISortDirectionValue = (typeof SORT_DIRECTION)[ISortDirectionType];
export type IClassificationValue = (typeof CLASSIFICATION)[IClassificationType];
export type IFriendshipStatusType = keyof typeof FRIENDSHIP_STATUS;
export type IResourceValue = (typeof RESOURCES)[IResourceType];
export type IWatchedSettingType = keyof typeof WATCHED_SETTING;
export type IWatchedScopeType = keyof typeof WATCHED_SCOPE;

// Type for the keys of REACTION_EMOJIS
export type IReactionEmojiKey = keyof typeof REACTION_EMOJIS;

// Type for the values of REACTION_EMOJIS
export type IReactionEmojiValue = (typeof REACTION_EMOJIS)[IReactionEmojiKey];

export type TabKey = keyof typeof TABS;
export type TabValue = (typeof TABS)[TabKey];

// ============= Helper Functions =============

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

export const isValidReactionEmoji = (emoji: string): emoji is IReactionEmojiValue => {
  return isReactionEmojiValue(emoji);
};

export const isValidFriendshipStatus = (
  status: string
): status is (typeof FRIENDSHIP_STATUS)[IFriendshipStatusType] => {
  return status in FRIENDSHIP_STATUS;
};

export const isValidWatchedSetting = (
  setting: string
): setting is (typeof WATCHED_SETTING)[IWatchedSettingType] => {
  return setting in WATCHED_SETTING;
};

// Helper functions to generate enum arrays from constants for database schema usage
export const getEnumValues = {
  gameStatus: () => Object.values(GAME_STATUS_VALUES) as [string, ...string[]],
  friendshipStatus: () => Object.values(FRIENDSHIP_STATUS) as [string, ...string[]],
  watchedSetting: () => Object.values(WATCHED_SETTING) as [string, ...string[]],
  watchedScope: () => Object.values(WATCHED_SCOPE) as [string, ...string[]],
  classification: () => Object.values(CLASSIFICATION) as [string, ...string[]],
  targetTypes: () => Object.values(TARGET_TYPES) as [string, ...string[]],
  reactionEmojis: () => Object.values(REACTION_EMOJIS) as [string, ...string[]],
  resources: () => Object.values(RESOURCES) as [string, ...string[]],
  sortDirection: () => Object.values(SORT_DIRECTION) as [string, ...string[]],
} as const;
