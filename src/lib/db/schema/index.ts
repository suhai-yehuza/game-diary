import { baseTableConfig } from '@/lib/db/schema/base-types';
import {
  game_status_enum,
  game_type_enum,
  user_role_enum,
  notification_type_enum,
  reaction_type_enum,
  watched_setting_enum,
} from '@/lib/db/schema/enums';
import { game_logs, game_ratings, team_h2h, games } from '@/lib/db/schema/game-schemas';
import {
  nba_players,
  nba_player_stats,
  game_stats,
  seasons,
  nba_games,
} from '@/lib/db/schema/nba-schemas';
import { notifications } from '@/lib/db/schema/notification-schemas';
import { teams } from '@/lib/db/schema/team-schemas';
import type { Schema } from '@/lib/db/schema/types';
import { users, friendships, reactions, comments } from '@/lib/db/schema/user-schemas';

import {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
} from './relations';

// Export all schema types
export { baseTableConfig } from '@/lib/db/schema/base-types';
export { comments } from '@/lib/db/schema/user-schemas';
export { game_logs, game_ratings, team_h2h, games } from '@/lib/db/schema/game-schemas';
export {
  nba_players,
  nba_player_stats,
  game_stats,
  seasons,
  nba_games,
} from '@/lib/db/schema/nba-schemas';
export { notifications } from '@/lib/db/schema/notification-schemas';
export { teams } from '@/lib/db/schema/team-schemas';
export { users, friendships, reactions } from '@/lib/db/schema/user-schemas';
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
  team_h2h,
  nba_players,
  nba_player_stats,
  game_stats,
  seasons,
  nba_games,
  enums: {
    game_status: game_status_enum,
    gameType: game_type_enum,
    user_role: user_role_enum,
    notification_type: notification_type_enum,
    reaction_type: reaction_type_enum,
    watchedSetting: watched_setting_enum,
  },
  base: baseTableConfig,
} as Schema;
