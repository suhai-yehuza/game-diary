import {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
  friendshipsRelations,
} from '@/lib/db/schema/relations';
import {
  nba_games,
  game_logs,
  game_ratings,
  teams,
  nba_players,
  leagues,
  seasons,
} from '@src/lib/db/schema/game-schemas';
import { notifications } from '@src/lib/db/schema/notification-schemas';
import { users, friendships, reactions, comments } from '@src/lib/db/schema/user-schemas';

export {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
  friendshipsRelations,
} from '@/lib/db/schema/relations';

// Schema types are exported from @/lib/types instead
export { comments } from '@src/lib/db/schema/user-schemas';
export {
  nba_games,
  game_logs,
  game_ratings,
  teams,
  nba_players,
  leagues,
  seasons,
} from '@src/lib/db/schema/game-schemas';
export { notifications } from '@src/lib/db/schema/notification-schemas';
export { users, friendships, reactions } from '@src/lib/db/schema/user-schemas';

// Export the schema object
export const schema = {
  users: {
    ...users,
    relations: usersRelations,
  },
  comments: {
    ...comments,
    relations: commentsRelations,
  },
  reactions: {
    ...reactions,
    relations: reactionsRelations,
  },
  notifications,
  friendships: {
    ...friendships,
    relations: friendshipsRelations,
  },
  nba_games,
  teams,
  nba_players,
  leagues,
  seasons,
  game_logs: {
    ...game_logs,
    relations: gameLogsRelations,
  },
  game_ratings,
};
