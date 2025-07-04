import {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
} from '@/lib/db/schema/relations';
import { games, game_logs, game_ratings } from '@src/lib/db/schema/game-schemas';
import { notifications } from '@src/lib/db/schema/notification-schemas';
import { users, friendships, reactions, comments } from '@src/lib/db/schema/user-schemas';

export {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
} from '@/lib/db/schema/relations';

// Export all schema types
export * from '@src/lib/types/schema-types';
export { comments } from '@src/lib/db/schema/user-schemas';
export { games, game_logs, game_ratings } from '@src/lib/db/schema/game-schemas';
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
  friendships,
  games,
  game_logs: {
    ...game_logs,
    relations: gameLogsRelations,
  },
  game_ratings,
};
