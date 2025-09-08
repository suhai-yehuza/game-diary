import { relations } from 'drizzle-orm';

import {
  game_logs,
  game_ratings,
  basketball_games,
  publicComments,
  publicReactions,
  basketball_players,
  basketball_teams,
} from '@/lib/db/schema/game-schemas';
import {
  users,
  friendships,
  comments,
  reactions,
  reactionEmojis,
} from '@/lib/db/schema/user-schemas';

// User-related relations
export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
  reactions: many(reactions),
  gameLogs: many(game_logs),
  friendships: many(friendships),
}));

// Friendship-related relations
export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    fields: [friendships.user_id],
    references: [users.id],
  }),
  friend: one(users, {
    fields: [friendships.friend_id],
    references: [users.id],
  }),
}));

// Comment-related relations
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.user_id],
    references: [users.id],
  }),
  reactions: many(reactions),
}));

// Reaction Emojis relations
export const reactionEmojisRelations = relations(reactionEmojis, ({ many }) => ({
  reactions: many(reactions),
}));

// Reaction-related relations
export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.user_id],
    references: [users.id],
  }),
  emoji: one(reactionEmojis, {
    fields: [reactions.emoji],
    references: [reactionEmojis.emoji],
  }),
}));

// Game-related relations
export const gameLogsRelations = relations(game_logs, ({ one, many }) => ({
  user: one(users, {
    fields: [game_logs.user_id],
    references: [users.id],
  }),
  game: one(basketball_games, {
    fields: [game_logs.game_id],
    references: [basketball_games.id],
  }),
  comments: many(comments),
  reactions: many(reactions),
}));

export const game_ratings_relations = relations(game_ratings, ({ many }) => ({
  game_logs: many(game_logs),
}));

// Public Comments relations
export const publicCommentsRelations = relations(publicComments, ({ one, many }) => ({
  user: one(users, {
    fields: [publicComments.user_id],
    references: [users.id],
  }),
  reactions: many(publicReactions),
  // Note: parent relations are handled dynamically based on parent_type
  // No direct foreign key constraints to avoid circular dependencies
}));

// Public Reactions relations
export const publicReactionsRelations = relations(publicReactions, ({ one }) => ({
  user: one(users, {
    fields: [publicReactions.user_id],
    references: [users.id],
  }),
}));

// Basketball Games relations (extended)
export const basketballGamesRelations = relations(basketball_games, ({ many }) => ({
  gameLogs: many(game_logs),
  // Note: publicComments and publicReactions are accessed via parent_id/parent_type
  // No direct relations to avoid circular dependencies
}));

// Basketball Players relations
export const basketballPlayersRelations = relations(basketball_players, ({ many }) => ({
  // Note: publicComments and publicReactions are accessed via parent_id/parent_type
  // No direct relations to avoid circular dependencies
}));

// Basketball Teams relations
export const basketballTeamsRelations = relations(basketball_teams, ({ many }) => ({
  // Note: publicComments and publicReactions are accessed via parent_id/parent_type
  // No direct relations to avoid circular dependencies
}));
