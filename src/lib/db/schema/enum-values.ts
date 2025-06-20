// Import enums that are already defined in config.types.ts
import {
  REACTION_EMOJIS,
  FRIENDSHIP_STATUS,
  WATCHED_SETTING,
  type IReactionEmojiValue,
  type IFriendshipStatusValue,
  type IWatchedSettingValue,
} from '@src/lib/types';

// Game status enum
export const GAME_STATUS = {
  SCHEDULED: 'Scheduled',
  Live: 'Live',
  FINISHED: 'Finished',
} as const;

// Notification type enum
export const NOTIFICATION_TYPE = {
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_ACCEPTED: 'FRIEND_ACCEPTED',
  GAME_UPDATE: 'GAME_UPDATE',
  COMMENT: 'comment',
  REACTION: 'REACTION',
} as const;

// Reaction type enum
export const REACTION_TYPE = Object.fromEntries(
  Object.keys(REACTION_EMOJIS).map(key => [key, key])
) as { [K in keyof typeof REACTION_EMOJIS]: K };

export {
  REACTION_EMOJIS,
  FRIENDSHIP_STATUS,
  WATCHED_SETTING,
  type IReactionEmojiValue,
  type IFriendshipStatusValue,
  type IWatchedSettingValue,
};
