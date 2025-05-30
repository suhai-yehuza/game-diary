import { relations } from 'drizzle-orm';

import { game_logs, game_ratings, games } from './game-schemas';
import { teams, team_h2h, nba_games, nba_players, nba_player_stats } from './nba-schemas';
import { users, friendships, comments, reactions } from './user-schemas';

// User-related relations
export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
  reactions: many(reactions),
  gameLogs: many(game_logs),
  friendships: many(friendships),
}));

// Comment-related relations
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  reactions: many(reactions),
}));

// Reaction-related relations
export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
}));

// Game-related relations
export const gameLogsRelations = relations(game_logs, ({ one, many }) => ({
  user: one(users, {
    fields: [game_logs.userId],
    references: [users.id],
  }),
  comments: many(comments),
  reactions: many(reactions),
}));

export const game_ratings_relations = relations(game_ratings, ({ many }) => ({
  game_logs: many(game_logs),
}));

// NBA-related relations
export const team_h2h_relations = relations(team_h2h, ({ many }) => ({
  games: many(nba_games),
}));

export const teams_relations = relations(teams, ({ many }) => ({
  players: many(nba_players),
  homeGames: many(games, { relationName: 'homeTeam' }),
  awayGames: many(games, { relationName: 'awayTeam' }),
}));

export const players_relations = relations(nba_players, ({ many }) => ({
  teams: many(teams),
  playerStats: many(nba_player_stats),
}));
