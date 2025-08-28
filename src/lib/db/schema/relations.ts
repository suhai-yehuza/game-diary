import { relations } from 'drizzle-orm';

import { game_logs, game_ratings, nba_games } from '@/lib/db/schema/game-schemas';
import { users, friendships, comments, reactions } from '@/lib/db/schema/user-schemas';

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

// Reaction-related relations
export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.user_id],
    references: [users.id],
  }),
}));

// Game-related relations
export const gameLogsRelations = relations(game_logs, ({ one, many }) => ({
  user: one(users, {
    fields: [game_logs.user_id],
    references: [users.id],
  }),
  game: one(nba_games, {
    fields: [game_logs.game_id],
    references: [nba_games.id],
  }),
  comments: many(comments),
  reactions: many(reactions),
}));

export const game_ratings_relations = relations(game_ratings, ({ many }) => ({
  game_logs: many(game_logs),
}));
