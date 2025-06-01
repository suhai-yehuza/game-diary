import { Resolvers } from '@/lib/types/generated/graphql';

// Import all resolver modules
import * as gameLogResolvers from './game-logs';
import * as gameResolvers from './games';
import * as playerResolvers from './players';
import * as teamResolvers from './teams';
import * as userResolvers from './users';

// Export the GameLog type resolver for direct use in index.ts
export const { GameLog } = gameLogResolvers;

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
} as unknown as Resolvers['Query'];
