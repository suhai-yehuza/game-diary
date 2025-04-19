/**
 * Consolidated types for configuration, UI, and constants
 * This file combines types from:
 * - constants.types.ts
 * - ui.types.ts
 * - api-config.types.ts
 */

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

// Status and Settings
export const FRIENDSHIP_STATUS = {
  ACCEPTED: 'ACCEPTED',
  BLOCKED: 'BLOCKED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
} as const;

export const WATCHED_SETTINGS = {
  TV: 'tv',
  ARENA: 'arena',
  PHONE: 'phone',
  LAPTOP: 'laptop',
  BAR: 'bar',
  HOME: 'home',
  OTHER: 'other',
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

export const CACHE_KEYS = {
  USER: 'user',
  GAME_LOG: 'game_log',
  GAME: 'game',
  COMMENT: 'comment',
  FRIENDSHIP: 'friendship',
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
export const CLASSIFICATIONS = {
  PRIVATE: 'PRIVATE',
  PROTECTED: 'PROTECTED',
  PUBLIC: 'PUBLIC',
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
  LIVE: 'Live',
  SCHEDULED: 'Scheduled',
} as const;

export const PARENT_TYPES = {
  GAME_LOG: 'game_log',
  COMMENT: 'comment',
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
  GAME_LOG: 'game_log',
  COMMENT: 'comment',
} as const;

export const LEAGUES = {
  NBA: 'NBA',
  NHL: 'NHL',
  MLB: 'MLB',
  NFL: 'NFL',
  MLS: 'MLS',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
} as const;

// ============= Type Definitions =============

// Status and Settings Types
export type UserRoleType = keyof typeof USER_ROLES;
export type UserRoleValue = (typeof USER_ROLES)[UserRoleType];
export type ClassificationType = keyof typeof CLASSIFICATIONS;
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
export type ClassificationValue = (typeof CLASSIFICATIONS)[ClassificationType];
export type FriendshipStatusType = keyof typeof FRIENDSHIP_STATUS;
export type FriendshipStatusValue = (typeof FRIENDSHIP_STATUS)[FriendshipStatusType];
export type PermissionValue = (typeof PERMISSIONS)[PermissionType];
export type ResourceValue = (typeof RESOURCES)[ResourceType];
export type WatchedSettingType = keyof typeof WATCHED_SETTINGS;
export type WatchedSettingValue = (typeof WATCHED_SETTINGS)[WatchedSettingType];

// ============= UI Types =============

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{
    label: string;
    value: string | number;
  }>;
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    message?: string;
  };
}

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Component Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
}

export interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export interface SelectProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  options: Array<{
    label: string;
    value: string | number;
  }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Card Types
export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// Loading Types
export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

// Error Types
export interface ErrorProps {
  message: string;
  retry?: () => void;
  className?: string;
}

// ============= API Configuration Types =============

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

export interface DatabaseSeedingConfig {
  CONCURRENT_OPERATIONS: number;
  BATCH_SIZE: number;
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  USER_COUNT: number;
  DEFAULT_SAMPLE_COUNT: number;
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

// ============= Utility Functions =============

export const isValidReactionEmoji = (emoji: string): emoji is ReactionEmojiValue => {
  return Object.values(REACTION_EMOJIS).includes(emoji as ReactionEmojiValue);
};

export const isValidFriendshipStatus = (status: string): status is FriendshipStatusValue => {
  return Object.values(FRIENDSHIP_STATUS).includes(status as FriendshipStatusValue);
};

export const isValidWatchedSetting = (setting: string): setting is WatchedSettingValue => {
  return Object.values(WATCHED_SETTINGS).includes(setting as WatchedSettingValue);
};
