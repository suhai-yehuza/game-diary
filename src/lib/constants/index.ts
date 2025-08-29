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

// ========================================
// API CONFIGURATION
// ========================================

// API Limits & Pagination
export const API_LIMITS = {
  // Default pagination limits
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Sports data limits
  GAMES: {
    DEFAULT: 100,
    LARGE: 2500, // For getting total counts
    MAX: 5000,
  },

  PLAYERS: {
    DEFAULT: 50,
    LARGE: 2500, // For getting total counts
    MAX: 5000,
  },

  TEAMS: {
    DEFAULT: 30,
    LARGE: 100,
    MAX: 200,
  },

  GAME_LOGS: {
    DEFAULT: 20,
    LARGE: 1000,
    MAX: 10000,
  },

  USERS: {
    DEFAULT: 20,
    LARGE: 1000,
    MAX: 100000,
  },

  SEARCH: {
    DEFAULT: 10,
    LARGE: 100,
    MAX: 1000,
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // External API endpoints
  EXTERNAL: {
    NBA_GAMES: 'https://v2.nba.api-sports.io/games',
    NBA_PLAYERS: 'https://v2.nba.api-sports.io/players',
    NBA_TEAMS: 'https://v2.nba.api-sports.io/teams',
    NBA_LIVE_GAMES: 'https://v2.nba.api-sports.io/games?live=all',
  },

  // Internal API endpoints
  INTERNAL: {
    GRAPHQL: '/api/graphql',
    PROXY: '/api/proxy',
    MOCK_SERVER: '/api/mock-server',
    PLAYERS: '/api/players',
    GAMES: '/api/games',
    TEAMS: '/api/teams',
    GAME_LOGS: '/api/game-logs',
    USERS: '/api/users',
    SEARCH: '/api/search',
  },

  // NBA API endpoints (from external API types)
  NBA: {
    SEASONS: '/seasons',
    LEAGUES: '/leagues',
    GAMES: '/games',
    GAME_STATISTICS: '/games/statistics',
    TEAMS: '/teams',
    TEAM_STATISTICS: '/teams/statistics',
    PLAYERS: '/players',
    PLAYER_STATISTICS: '/players/statistics',
    STANDINGS: '/standings',
  },
} as const;

// Request Configuration
export const REQUEST_CONFIG = {
  // Timeout values in milliseconds
  TIMEOUTS: {
    SHORT: 5000, // 5 seconds
    MEDIUM: 10000, // 10 seconds
    LONG: 30000, // 30 seconds
    VERY_LONG: 60000, // 1 minute
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
    BACKOFF_MULTIPLIER: 2,
  },

  // Rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
  },
} as const;

// Season Configuration
export const SEASON_CONFIG = {
  // Current season
  CURRENT: 2024,

  // Season types
  TYPES: {
    REGULAR: 'regular',
    PLAYOFF: 'playoff',
    PRESEASON: 'preseason',
    ALL: 'all',
  },

  // League types
  LEAGUES: {
    STANDARD: 'standard',
    SUMMER: 'summer',
    G_LEAGUE: 'g-league',
  },
} as const;

// ========================================
// CACHE CONFIGURATION
// ========================================

export const CACHE_TTL = {
  // Legacy cache TTL (kept for backward compatibility)
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

  // New standardized cache TTL
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAILY: 86400, // 24 hours
} as const;

// Cache namespaces
export const CACHE_NAMESPACES = {
  GAMES: 'games',
  PLAYERS: 'players',
  TEAMS: 'teams',
  GAME_LOGS: 'game-logs',
  USERS: 'users',
  SEARCH: 'search',
  SYSTEM: 'system',
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

// ========================================
// API TYPE DEFINITIONS
// ========================================

export type ApiLimitType = keyof typeof API_LIMITS;
export type CacheTTLType = keyof typeof CACHE_TTL;
export type RequestTimeoutType = keyof typeof REQUEST_CONFIG.TIMEOUTS;
export type SeasonType = keyof typeof SEASON_CONFIG.TYPES;
export type LeagueType = keyof typeof SEASON_CONFIG.LEAGUES;
export type CacheNamespaceType = keyof typeof CACHE_NAMESPACES;

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

// ========================================
// API UTILITY FUNCTIONS
// ========================================

/**
 * Get the appropriate limit for a given data type and use case
 */
export function getApiLimit(
  dataType: keyof typeof API_LIMITS,
  useCase: 'DEFAULT' | 'LARGE' | 'MAX' = 'DEFAULT'
): number {
  const limits = API_LIMITS[dataType];
  if (typeof limits === 'object' && limits !== null) {
    return limits[useCase];
  }
  return limits as number;
}

/**
 * Get cache TTL for a given duration
 */
export function getCacheTTL(duration: keyof typeof CACHE_TTL): number {
  return CACHE_TTL[duration];
}

/**
 * Get request timeout for a given duration
 */
export function getRequestTimeout(duration: keyof typeof REQUEST_CONFIG.TIMEOUTS): number {
  return REQUEST_CONFIG.TIMEOUTS[duration];
}

/**
 * Build API URL with parameters
 */
export function buildApiUrl(
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
): string {
  const url = new URL(
    endpoint,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  );

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  return url.toString();
}
