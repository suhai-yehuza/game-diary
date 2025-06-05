import { Resolvers } from '@/lib/types/generated/graphql';

// Import all resolver modules
import * as commentResolvers from './comments.index';
import * as gameLogResolvers from './game-logs.index';
import * as gameResolvers from './games.index';
import * as playerResolvers from './players.index';
import * as reactionResolvers from './reactions.index';
import * as teamResolvers from './teams.index';
import * as userResolvers from './users.index';

// Export type resolvers for direct use in index.ts
export const { GameLog } = gameLogResolvers;
export const { Comment } = commentResolvers;
export const { Reaction } = reactionResolvers;

// Export DBUser field resolvers
export const DBUser = {
  friendships: userResolvers.friendships,
  initiatedFriendships: userResolvers.initiatedFriendships,
};

// Export the combined Query resolver
export const Query = {
  // Game queries
  games: gameResolvers.games,
  game: gameResolvers.game,
  liveGames: gameResolvers.liveGames,
  gameLog: gameLogResolvers.gameLog,
  gameLogById: gameLogResolvers.gameLogById,
  gameLogs: gameLogResolvers.gameLogs,

  // Player queries
  players: playerResolvers.players,
  player: playerResolvers.player,
  playerStats: playerResolvers.playerStats,

  // Team queries
  teams: teamResolvers.teams,
  team: teamResolvers.team,
  teamH2H: teamResolvers.teamH2H,

  // User queries
  users: userResolvers.users,
  user: userResolvers.user,
  me: userResolvers.me,
  searchUsers: userResolvers.searchUsers,

  // Comment queries
  comments: commentResolvers.comments,

  // Reaction queries
  reactions: reactionResolvers.reactions,
} as unknown as Resolvers['Query'];
