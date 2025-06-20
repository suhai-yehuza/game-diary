import { pgEnum } from 'drizzle-orm/pg-core';

import {
  type IGameStatusValue,
  type INotificationTypeValue,
  type IReactionEmojiValue,
  type IFriendshipStatusValue,
  type IWatchedSettingValue,
} from '@src/lib/types';

import {
  GAME_STATUS,
  NOTIFICATION_TYPE,
  REACTION_TYPE,
  REACTION_EMOJIS,
  FRIENDSHIP_STATUS,
  WATCHED_SETTING,
} from './enum-values';

const gameStatusValues = Object.values(GAME_STATUS) as [IGameStatusValue, ...IGameStatusValue[]];
const notificationTypeValues = Object.values(NOTIFICATION_TYPE) as [
  INotificationTypeValue,
  ...INotificationTypeValue[],
];
const reactionTypeValues = Object.values(REACTION_TYPE) as [string, ...string[]];
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
