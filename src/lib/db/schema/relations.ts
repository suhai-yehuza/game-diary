import { relations } from 'drizzle-orm';

import {
  game_logs,
  game_ratings,
  basketball_games,
  publicComments,
  publicReactions,
  basketball_players,
  basketball_teams,
  leagues,
  seasons,
} from '@/lib/db/schema/game-schemas';
import { notifications } from '@/lib/db/schema/notification-schemas';
import { auditLogs, keyRotationLogs, rlsAccessLogs } from '@/lib/db/schema/system-schemas';
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
  publicComments: many(publicComments),
  publicReactions: many(publicReactions),
  notifications: many(notifications),
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
  // Parent relations based on parent_type
  // Note: These are conditional relations - only one will be populated based on parent_type
  gameLog: one(game_logs, {
    fields: [comments.parent_id],
    references: [game_logs.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parent_id],
    references: [comments.id],
  }),
  parentReaction: one(reactions, {
    fields: [comments.parent_id],
    references: [reactions.id],
  }),
}));

// Reaction Emojis relations
export const reactionEmojisRelations = relations(reactionEmojis, ({ many }) => ({
  reactions: many(reactions),
}));

// Reaction-related relations
export const reactionsRelations = relations(reactions, ({ one, many }) => ({
  user: one(users, {
    fields: [reactions.user_id],
    references: [users.id],
  }),
  emoji: one(reactionEmojis, {
    fields: [reactions.emoji],
    references: [reactionEmojis.emoji],
  }),
  comments: many(comments),
  // Target relations based on target_type
  // Note: These are conditional relations - only one will be populated based on target_type
  gameLog: one(game_logs, {
    fields: [reactions.target_id],
    references: [game_logs.id],
  }),
  targetComment: one(comments, {
    fields: [reactions.target_id],
    references: [comments.id],
  }),
  targetReaction: one(reactions, {
    fields: [reactions.target_id],
    references: [reactions.id],
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
  // Count relations for performance optimization
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
  // Parent relations based on parent_type
  // Note: These are conditional relations - only one will be populated based on parent_type
  basketballGame: one(basketball_games, {
    fields: [publicComments.parent_id],
    references: [basketball_games.id],
  }),
  basketballPlayer: one(basketball_players, {
    fields: [publicComments.parent_id],
    references: [basketball_players.id],
  }),
  basketballTeam: one(basketball_teams, {
    fields: [publicComments.parent_id],
    references: [basketball_teams.id],
  }),
}));

// Public Reactions relations
export const publicReactionsRelations = relations(publicReactions, ({ one }) => ({
  user: one(users, {
    fields: [publicReactions.user_id],
    references: [users.id],
  }),
  // Target relations based on target_type
  // Note: These are conditional relations - only one will be populated based on target_type
  basketballGame: one(basketball_games, {
    fields: [publicReactions.target_id],
    references: [basketball_games.id],
  }),
  basketballPlayer: one(basketball_players, {
    fields: [publicReactions.target_id],
    references: [basketball_players.id],
  }),
  basketballTeam: one(basketball_teams, {
    fields: [publicReactions.target_id],
    references: [basketball_teams.id],
  }),
}));

// Basketball Games relations (extended)
export const basketballGamesRelations = relations(basketball_games, ({ many }) => ({
  gameLogs: many(game_logs),
  publicComments: many(publicComments),
  publicReactions: many(publicReactions),
}));

// Basketball Players relations
export const basketballPlayersRelations = relations(basketball_players, ({ many }) => ({
  publicComments: many(publicComments),
  publicReactions: many(publicReactions),
}));

// Basketball Teams relations
export const basketballTeamsRelations = relations(basketball_teams, ({ many }) => ({
  publicComments: many(publicComments),
  publicReactions: many(publicReactions),
}));

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id],
  }),
}));

// Leagues relations
export const leaguesRelations = relations(leagues, ({ many: _many }) => ({
  // Note: Relations to teams and players are via JSONB fields, so direct relations aren't possible
  // These would need to be handled at the application level
}));

// Seasons relations
export const seasonsRelations = relations(seasons, ({ many }) => ({
  basketballGames: many(basketball_games),
}));

// System audit tables relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.user_id],
    references: [users.id],
  }),
}));

export const keyRotationLogsRelations = relations(keyRotationLogs, ({ one }) => ({
  rotatedByUser: one(users, {
    fields: [keyRotationLogs.rotated_by],
    references: [users.id],
  }),
}));

export const rlsAccessLogsRelations = relations(rlsAccessLogs, ({ one }) => ({
  requestingUser: one(users, {
    fields: [rlsAccessLogs.requesting_user_id],
    references: [users.id],
  }),
  targetUser: one(users, {
    fields: [rlsAccessLogs.target_user_id],
    references: [users.id],
  }),
}));
