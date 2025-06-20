// Import all resolver modules
import * as commentResolvers from './comments';
import * as gameLogResolvers from './game-logs';
import * as gameResolvers from './games';
import * as playerResolvers from './players';
import * as reactionResolvers from './reactions';
import * as teamResolvers from './teams';
import * as userResolvers from './users';

// Export type resolvers for direct use in index.ts
export const { GameLog } = gameLogResolvers;
export const Comment = commentResolvers.commentResolvers.Comment;
export const { Reaction } = reactionResolvers;

// Export DbUser field resolvers
export const DbUser = {
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
  comments: commentResolvers.commentResolvers.Query.comments,

  // Reaction queries
  reactions: reactionResolvers.reactions,
};
