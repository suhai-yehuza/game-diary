import { pgEnum } from 'drizzle-orm/pg-core';

import {
  GAME_STATUS,
  NOTIFICATION_TYPE,
  REACTION_TYPE,
  REACTION_EMOJIS,
  FRIENDSHIP_STATUS,
  WATCHED_SETTING,
  type GameStatusValue,
  type NotificationTypeValue,
  type ReactionTypeValue,
  type IReactionEmojiValue,
  type IFriendshipStatusValue,
  type IWatchedSettingValue,
} from './enum-values';

// Convert enum values to tuples for pgEnum
const gameStatusValues = Object.values(GAME_STATUS) as [GameStatusValue, ...GameStatusValue[]];
const notificationTypeValues = Object.values(NOTIFICATION_TYPE) as [
  NotificationTypeValue,
  ...NotificationTypeValue[],
];
const reactionTypeValues = Object.values(REACTION_TYPE) as [
  ReactionTypeValue,
  ...ReactionTypeValue[],
];
const reactionEmojiValues = Object.values(REACTION_EMOJIS) as [
  IReactionEmojiValue,
  ...IReactionEmojiValue[],
];
const friendshipStatusValues = Object.values(FRIENDSHIP_STATUS) as [
  IFriendshipStatusValue,
  ...IFriendshipStatusValue[],
];
const watchedSettingValues = Object.values(WATCHED_SETTING) as [
  IWatchedSettingValue,
  ...IWatchedSettingValue[],
];

// Define enums
export const gameStatusEnum = pgEnum('game_status', gameStatusValues);
export const notificationTypeEnum = pgEnum('notification_type', notificationTypeValues);
export const reactionTypeEnum = pgEnum('reaction_type', reactionTypeValues);
export const reactionEmojiEnum = pgEnum('reaction_emoji', reactionEmojiValues);
export const friendshipStatusEnum = pgEnum('friendship_status', friendshipStatusValues);
export const watchedSettingEnum = pgEnum('watched_setting', watchedSettingValues);
export const reactionTargetEnum = pgEnum('reaction_target', ['game_log', 'comment']);

export enum ISortDirection {
  ASC = 'asc',
  DESC = 'desc',
}
