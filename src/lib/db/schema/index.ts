import {
  basketball_games,
  game_logs,
  game_ratings,
  basketball_teams,
  basketball_players,
  leagues,
  seasons,
  publicComments,
  publicReactions,
} from '@/lib/db/schema/game-schemas';
import { notifications } from '@/lib/db/schema/notification-schemas';
import {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
  friendshipsRelations,
  reactionEmojisRelations,
  publicCommentsRelations,
  publicReactionsRelations,
  basketballGamesRelations,
  basketballPlayersRelations,
  basketballTeamsRelations,
} from '@/lib/db/schema/relations';
import {
  users,
  friendships,
  reactions,
  comments,
  reactionEmojis,
} from '@/lib/db/schema/user-schemas';

export {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
  friendshipsRelations,
  reactionEmojisRelations,
  publicCommentsRelations,
  publicReactionsRelations,
  basketballGamesRelations,
  basketballPlayersRelations,
  basketballTeamsRelations,
} from '@/lib/db/schema/relations';

// Schema types are exported from @/lib/types instead
export { comments } from '@/lib/db/schema/user-schemas';
export {
  basketball_games,
  game_logs,
  game_ratings,
  basketball_teams,
  basketball_players,
  leagues,
  seasons,
  publicComments,
  publicReactions,
} from '@/lib/db/schema/game-schemas';
export { notifications } from '@/lib/db/schema/notification-schemas';
export { users, friendships, reactions, reactionEmojis } from '@/lib/db/schema/user-schemas';

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
  reactionEmojis: {
    ...reactionEmojis,
    relations: reactionEmojisRelations,
  },
  notifications,
  friendships: {
    ...friendships,
    relations: friendshipsRelations,
  },
  basketball_games: {
    ...basketball_games,
    relations: basketballGamesRelations,
  },
  basketball_teams: {
    ...basketball_teams,
    relations: basketballTeamsRelations,
  },
  basketball_players: {
    ...basketball_players,
    relations: basketballPlayersRelations,
  },
  leagues,
  seasons,
  game_logs: {
    ...game_logs,
    relations: gameLogsRelations,
  },
  game_ratings,
  publicComments: {
    ...publicComments,
    relations: publicCommentsRelations,
  },
  publicReactions: {
    ...publicReactions,
    relations: publicReactionsRelations,
  },
};
