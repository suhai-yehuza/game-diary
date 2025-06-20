import { baseTableConfig } from '@src/lib/db/schema/base-types';
import {
  gameStatusEnum,
  notificationTypeEnum,
  reactionTypeEnum,
  watchedSettingEnum,
} from '@src/lib/db/schema/enums';
import { game_logs, game_ratings, games } from '@src/lib/db/schema/game-schemas';
import {
  nba_players,
  nba_player_stats,
  game_stats,
  seasons,
  nba_games,
  team_h2h,
} from '@src/lib/db/schema/nba-schemas';
import { notifications } from '@src/lib/db/schema/notification-schemas';
import { teams } from '@src/lib/db/schema/team-schemas';
import { users, friendships, reactions, comments } from '@src/lib/db/schema/user-schemas';
import type { Schema } from '@src/lib/types';

import {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
} from './relations';

// Export all schema types
export { baseTableConfig } from '@src/lib/db/schema/base-types';
export { comments } from '@src/lib/db/schema/user-schemas';
export { game_logs, game_ratings, games } from '@src/lib/db/schema/game-schemas';
export {
  nba_games,
  nba_players,
  team_h2h,
  game_stats,
  nba_player_stats,
  seasons,
} from '@src/lib/db/schema/nba-schemas';
export { notifications } from '@src/lib/db/schema/notification-schemas';
export { teams } from '@src/lib/db/schema/team-schemas';
export { users, friendships, reactions } from '@src/lib/db/schema/user-schemas';
export {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
} from './relations';

// Export the schema object
export const schema = {
  users: {
    ...users,
    relations: usersRelations,
  },
  teams,
  comments: {
    ...comments,
    relations: commentsRelations,
  },
  reactions: {
    ...reactions,
    relations: reactionsRelations,
  },
  notifications,
  friendships,
  game_logs: {
    ...game_logs,
    relations: gameLogsRelations,
  },
  games,
  game_ratings,
  nba_games,
  team_h2h,
  nba_players,
  nba_player_stats,
  game_stats,
  seasons,
  enums: {
    game_status: gameStatusEnum,
    notification_type: notificationTypeEnum,
    reaction_type: reactionTypeEnum,
    watchedSetting: watchedSettingEnum,
  },
  base: baseTableConfig,
} as Schema;
