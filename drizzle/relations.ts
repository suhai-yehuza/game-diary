import { relations } from 'drizzle-orm/relations';

import {
  users,
  friendships,
  comments,
  gameLogs,
  nbaGames,
  notifications,
  gameRatings,
  reactions,
  reactionEmojis,
} from './schema';

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user_friendId: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
    relationName: 'friendships_friendId_users_id',
  }),
  user_userId: one(users, {
    fields: [friendships.userId],
    references: [users.id],
    relationName: 'friendships_userId_users_id',
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  friendships_friendId: many(friendships, {
    relationName: 'friendships_friendId_users_id',
  }),
  friendships_userId: many(friendships, {
    relationName: 'friendships_userId_users_id',
  }),
  comments: many(comments),
  gameLogs: many(gameLogs),
  notifications: many(notifications),
  reactions: many(reactions),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const gameLogsRelations = relations(gameLogs, ({ one }) => ({
  user: one(users, {
    fields: [gameLogs.userId],
    references: [users.id],
  }),
  nbaGame: one(nbaGames, {
    fields: [gameLogs.gameId],
    references: [nbaGames.id],
  }),
}));

export const nbaGamesRelations = relations(nbaGames, ({ many }) => ({
  gameLogs: many(gameLogs),
  gameRatings: many(gameRatings),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const gameRatingsRelations = relations(gameRatings, ({ one }) => ({
  nbaGame: one(nbaGames, {
    fields: [gameRatings.gameId],
    references: [nbaGames.id],
  }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
  reactionEmoji: one(reactionEmojis, {
    fields: [reactions.emoji],
    references: [reactionEmojis.emoji],
  }),
}));

export const reactionEmojisRelations = relations(reactionEmojis, ({ many }) => ({
  reactions: many(reactions),
}));
