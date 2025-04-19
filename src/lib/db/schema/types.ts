import {
  game_status_enum,
  game_type_enum,
  user_role_enum,
  notification_type_enum,
  reaction_type_enum,
  watched_setting_enum,
} from '@/lib/db/schema/enums';

import { baseTableConfig } from './base-types';
import { comments } from './comment-schemas';
import { game_logs, game_ratings, team_h2h } from './game-schemas';
import { nba_players, nba_player_stats, game_stats, seasons, nba_games } from './nba-schemas';
import { notifications } from './notification-schemas';
import { reactions } from './reaction-schemas';
import { teams } from './team-schemas';
import { users, friendships } from './user-schemas';

// Define base types for schema tables
export type BaseTable = typeof baseTableConfig;

// Define types for each table
export type UsersTable = typeof users;
export type TeamsTable = typeof teams;
export type CommentsTable = typeof comments;
export type ReactionsTable = typeof reactions;
export type NotificationsTable = typeof notifications;
export type FriendshipsTable = typeof friendships;
export type GameLogsTable = typeof game_logs;
export type GameRatingsTable = typeof game_ratings;
export type NBAGamesTable = typeof nba_games;
export type TeamH2HTable = typeof team_h2h;
export type NBAPlayersTable = typeof nba_players;
export type NBAPlayerStatsTable = typeof nba_player_stats;
export type GameStatsTable = typeof game_stats;
export type SeasonsTable = typeof seasons;

// Define schema type
export type Schema = {
  users: UsersTable;
  teams: TeamsTable;
  comments: CommentsTable;
  reactions: ReactionsTable;
  notifications: NotificationsTable;
  friendships: FriendshipsTable;
  game_logs: GameLogsTable;
  game_ratings: GameRatingsTable;
  nba_games: NBAGamesTable;
  team_h2h: TeamH2HTable;
  nba_players: NBAPlayersTable;
  nba_player_stats: NBAPlayerStatsTable;
  game_stats: GameStatsTable;
  seasons: SeasonsTable;
  enums: {
    game_status: typeof game_status_enum;
    game_type: typeof game_type_enum;
    user_role: typeof user_role_enum;
    notification_type: typeof notification_type_enum;
    reaction_type: typeof reaction_type_enum;
    watched_setting: typeof watched_setting_enum;
  };
  base: typeof baseTableConfig;
};
