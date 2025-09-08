/**
 * Core Type Definitions
 * This file contains core type definitions that are derived from constants
 * and used throughout the application.
 */

// Re-export types from constants to maintain the same interface
// These types are defined in src/lib/constants/index.ts to avoid circular dependencies
export type {
  IReactionEmojiKey,
  IReactionEmojiValue,
  IGraphQLReactionEmojiType,
  IFriendshipStatusType,
  IWatchedSettingType,
} from '@/lib/constants';
