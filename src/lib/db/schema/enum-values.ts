// Import enums that are already defined in config.types.ts
import {
  REACTION_EMOJIS,
  FRIENDSHIP_STATUS,
  WATCHED_SETTING,
  type ReactionEmojiValue,
  type FriendshipStatusValue,
  type WatchedSettingValue,
} from '@/lib/types/config.types';

// Game status enum
export const GAME_STATUS = {
  SCHEDULED: 'Scheduled',
  Live: 'Live',
  FINISHED: 'Finished',
} as const;

export type GameStatusValue = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

// Notification type enum
export const NOTIFICATION_TYPE = {
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_ACCEPTED: 'FRIEND_ACCEPTED',
  GAME_UPDATE: 'GAME_UPDATE',
  COMMENT: 'comment',
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
  WATCHED_SETTING,
  type ReactionEmojiValue,
  type FriendshipStatusValue,
  type WatchedSettingValue,
};
