// This file provides minimal schema type exports for internal schema use
// Main type definitions have been moved to src/lib/types/database.types.ts

// Re-export types that are needed for schema internal use only
export type { baseTableConfig } from './base-types';
export type { game_logs, game_ratings, games } from './game-schemas';
export type {
  nba_players,
  nba_player_stats,
  game_stats,
  seasons,
  nba_games,
  team_h2h,
} from './nba-schemas';
export type { notifications } from './notification-schemas';
export type {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
} from './relations';
export type { teams } from './team-schemas';
export type { reactions, users, friendships, comments } from './user-schemas';
