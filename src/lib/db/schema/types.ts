import type {
  gameStatusEnum,
  notificationTypeEnum,
  reactionTypeEnum,
  watchedSettingEnum,
} from '@src/lib/db/schema/enums';

import type { baseTableConfig } from './base-types';
import type { game_logs, game_ratings, games } from './game-schemas';
import type {
  nba_players,
  nba_player_stats,
  game_stats,
  seasons,
  nba_games,
  team_h2h,
} from './nba-schemas';
import type { notifications } from './notification-schemas';
import type {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
} from './relations';
import type { teams } from './team-schemas';
import type { reactions, users, friendships, comments } from './user-schemas';

// Define base types for schema tables
export type BaseTable = typeof baseTableConfig;

// Define table types
export type UsersTable = typeof users;
export type TeamsTable = typeof teams;
export type CommentsTable = typeof comments;
export type ReactionsTable = typeof reactions;
export type NotificationsTable = typeof notifications;
export type FriendshipsTable = typeof friendships;
export type GameLogsTable = typeof game_logs;
export type GameRatingsTable = typeof game_ratings;
export type GamesTable = typeof games;
export type NBAGamesTable = typeof nba_games;
export type TeamH2HTable = typeof team_h2h;
export type NBAPlayersTable = typeof nba_players;
export type NBAPlayerStatsTable = typeof nba_player_stats;
export type GameStatsTable = typeof game_stats;
export type SeasonsTable = typeof seasons;

// Define schema type
export type Schema = {
  users: UsersTable & { relations: typeof usersRelations };
  teams: TeamsTable;
  comments: CommentsTable & { relations: typeof commentsRelations };
  reactions: ReactionsTable & { relations: typeof reactionsRelations };
  notifications: NotificationsTable;
  friendships: FriendshipsTable;
  game_logs: GameLogsTable & { relations: typeof gameLogsRelations };
  game_ratings: GameRatingsTable;
  games: GamesTable;
  nba_games: NBAGamesTable;
  team_h2h: TeamH2HTable;
  nba_players: NBAPlayersTable;
  nba_player_stats: NBAPlayerStatsTable;
  game_stats: GameStatsTable;
  seasons: SeasonsTable;
  enums: {
    game_status: typeof gameStatusEnum;
    notification_type: typeof notificationTypeEnum;
    reaction_type: typeof reactionTypeEnum;
    watchedSetting: typeof watchedSettingEnum;
  };
  base: typeof baseTableConfig;
};

// Define relations type
export type Relations = {
  users: typeof usersRelations;
  comments: typeof commentsRelations;
  reactions: typeof reactionsRelations;
  game_logs: typeof gameLogsRelations;
};
