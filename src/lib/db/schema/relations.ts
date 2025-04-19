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

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.user_id],
    references: [users.id],
  }),
}));

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
  home_games: many(games, { relationName: 'home_team' }),
  away_games: many(games, { relationName: 'away_team' }),
}));

export const players_relations = relations(nba_players, ({ many }) => ({
  teams: many(teams),
  playerStats: many(nba_player_stats),
}));
