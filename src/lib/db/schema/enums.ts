import { pgEnum } from 'drizzle-orm/pg-core';

import {
  REACTION_EMOJIS,
  FRIENDSHIP_STATUS,
  WATCHED_SETTINGS,
  GAME_STATUS,
  GAME_TYPE,
  USER_ROLE,
  NOTIFICATION_TYPE,
  REACTION_TYPE,
  ReactionEmojiValue,
  FriendshipStatusValue,
  WatchedSettingValue,
  GameStatusValue,
  GameTypeValue,
  UserRoleValue,
  NotificationTypeValue,
  ReactionTypeValue,
} from './enum-values';

// Convert enum values to tuples for pgEnum
const reactionEmojiValues = Object.values(REACTION_EMOJIS) as [
  ReactionEmojiValue,
  ...ReactionEmojiValue[],
];

const friendshipStatusValues = Object.values(FRIENDSHIP_STATUS) as [
  FriendshipStatusValue,
  ...FriendshipStatusValue[],
];

const watchedSettingValues = Object.values(WATCHED_SETTINGS) as [
  WatchedSettingValue,
  ...WatchedSettingValue[],
];

const gameStatusValues = Object.values(GAME_STATUS) as [GameStatusValue, ...GameStatusValue[]];

const gameTypeValues = Object.values(GAME_TYPE) as [GameTypeValue, ...GameTypeValue[]];

const userRoleValues = Object.values(USER_ROLE) as [UserRoleValue, ...UserRoleValue[]];

const notificationTypeValues = Object.values(NOTIFICATION_TYPE) as [
  NotificationTypeValue,
  ...NotificationTypeValue[],
];

const reactionTypeValues = Object.values(REACTION_TYPE) as [
  ReactionTypeValue,
  ...ReactionTypeValue[],
];

// Define enums
export const reaction_emoji_enum = pgEnum('reaction_emoji', reactionEmojiValues);
export const friendship_status_enum = pgEnum('friendship_status', friendshipStatusValues);
export const watched_setting_enum = pgEnum('watched_setting', watchedSettingValues);
export const reaction_target_enum = pgEnum('reaction_target', ['game_log', 'comment']);
export const game_status_enum = pgEnum('game_status', gameStatusValues);
export const game_type_enum = pgEnum('game_type', gameTypeValues);
export const user_role_enum = pgEnum('user_role', userRoleValues);
export const notification_type_enum = pgEnum('notification_type', notificationTypeValues);
export const reaction_type_enum = pgEnum('reaction_type', reactionTypeValues);

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

// Re-export enum values and types
export {
  REACTION_EMOJIS,
  FRIENDSHIP_STATUS,
  WATCHED_SETTINGS,
  GAME_STATUS,
  GAME_TYPE,
  USER_ROLE,
  NOTIFICATION_TYPE,
  REACTION_TYPE,
  type ReactionEmojiValue,
  type FriendshipStatusValue,
  type WatchedSettingValue,
  type GameStatusValue,
  type GameTypeValue,
  type UserRoleValue,
  type NotificationTypeValue,
  type ReactionTypeValue,
};
