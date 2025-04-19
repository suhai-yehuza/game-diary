// Import enums that are already defined in config.types.ts
import {
  REACTION_EMOJIS,
  FRIENDSHIP_STATUS,
  WATCHED_SETTINGS,
  type ReactionEmojiValue,
  type FriendshipStatusValue,
  type WatchedSettingValue,
} from '@/lib/types/config.types';

// Game status enum
export const GAME_STATUS = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'LIVE',
  FINISHED: 'FINISHED',
} as const;

export type GameStatusValue = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

// Game type enum
export const GAME_TYPE = {
  REGULAR: 'REGULAR',
  PLAYOFF: 'PLAYOFF',
  FINALS: 'FINALS',
} as const;

export type GameTypeValue = (typeof GAME_TYPE)[keyof typeof GAME_TYPE];

// User role enum
export const USER_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRoleValue = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// Notification type enum
export const NOTIFICATION_TYPE = {
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_ACCEPTED: 'FRIEND_ACCEPTED',
  GAME_UPDATE: 'GAME_UPDATE',
  COMMENT: 'COMMENT',
  REACTION: 'REACTION',
} as const;

export type NotificationTypeValue = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

// Reaction type enum
export const REACTION_TYPE = {
  LIKE: 'LIKE',
  LOVE: 'LOVE',
  LAUGH: 'LAUGH',
  WOW: 'WOW',
  SAD: 'SAD',
  ANGRY: 'ANGRY',
  FIRE: 'FIRE',
  CLAP: 'CLAP',
  EYES: 'EYES',
  ROCKET: 'ROCKET',
  MUSCLE: 'MUSCLE',
  GOAT: 'GOAT',
  BULLSEYE: 'BULLSEYE',
  THUMBS_DOWN: 'THUMBS_DOWN',
  BASKETBALL: 'BASKETBALL',
  SOCCER: 'SOCCER',
  FOOTBALL: 'FOOTBALL',
  BASEBALL: 'BASEBALL',
  TENNIS: 'TENNIS',
  GOLF: 'GOLF',
} as const;

export type ReactionTypeValue = (typeof REACTION_TYPE)[keyof typeof REACTION_TYPE];

// Re-export imported enums and types
export {
  REACTION_EMOJIS,
  FRIENDSHIP_STATUS,
  WATCHED_SETTINGS,
  type ReactionEmojiValue,
  type FriendshipStatusValue,
  type WatchedSettingValue,
};
