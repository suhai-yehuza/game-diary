import DataLoader from 'dataloader';

import { db } from '@/lib/db';
import {
  getCommentCountsQuery,
  getReactionCountsQuery,
  getPublicCommentCountsQuery,
  getPublicReactionCountsQuery,
  getUsersByIdsQuery,
  getGamesByIdsQuery,
  getTeamsByIdsQuery,
  getPlayersByIdsQuery,
} from '@/lib/db/queries';
import type { GraphQLContext, DataLoaderContext } from '@/types';

// User DataLoader
export const createUserLoader = () => {
  return new DataLoader(async (userIds: readonly string[]) => {
    const database = db();
    if (!database) return userIds.map(() => null);

    // Use centralized SQL query instead of inline Drizzle query
    const usersData = await getUsersByIdsQuery([...userIds]);

    const userMap = new Map(usersData.map(user => [user.id, user]));
    return userIds.map(id => userMap.get(id) || null);
  });
};

// Comment Count DataLoader
export const createCommentCountLoader = () => {
  return new DataLoader(async (parentIds: readonly string[]) => {
    const database = db();
    if (!database) return parentIds.map(() => 0);

    // Use centralized SQL query instead of inline Drizzle query
    const countMap = await getCommentCountsQuery([...parentIds]);
    return parentIds.map(id => countMap.get(id) || 0);
  });
};

// Reaction Count DataLoader
export const createReactionCountLoader = () => {
  return new DataLoader(async (targetIds: readonly string[]) => {
    const database = db();
    if (!database) return targetIds.map(() => 0);

    // Use centralized SQL query instead of inline Drizzle query
    const countMap = await getReactionCountsQuery([...targetIds]);
    return targetIds.map(id => countMap.get(id) || 0);
  });
};

// Public Comment Count DataLoader
export const createPublicCommentCountLoader = () => {
  return new DataLoader(async (parentIds: readonly string[]) => {
    const database = db();
    if (!database) return parentIds.map(() => 0);

    // Use centralized SQL query instead of inline Drizzle query
    const countMap = await getPublicCommentCountsQuery([...parentIds]);
    return parentIds.map(id => countMap.get(id) || 0);
  });
};

// Public Reaction Count DataLoader
export const createPublicReactionCountLoader = () => {
  return new DataLoader(async (targetIds: readonly string[]) => {
    const database = db();
    if (!database) return targetIds.map(() => 0);

    // Use centralized SQL query instead of inline Drizzle query
    const countMap = await getPublicReactionCountsQuery([...targetIds]);
    return targetIds.map(id => countMap.get(id) || 0);
  });
};

// Game DataLoader
export const createGameLoader = () => {
  return new DataLoader(async (gameIds: readonly string[]) => {
    const database = db();
    if (!database) return gameIds.map(() => null);

    // Use centralized SQL query instead of inline Drizzle query
    const gamesData = await getGamesByIdsQuery([...gameIds]);

    const gameMap = new Map(gamesData.map(game => [game.id, game]));
    return gameIds.map(id => gameMap.get(id) || null);
  });
};

// Team DataLoader
export const createTeamLoader = () => {
  return new DataLoader(async (teamIds: readonly string[]) => {
    const database = db();
    if (!database) return teamIds.map(() => null);

    // Use centralized SQL query instead of inline Drizzle query
    const teamsData = await getTeamsByIdsQuery([...teamIds]);

    const teamMap = new Map(teamsData.map(team => [team.id, team]));
    return teamIds.map(id => teamMap.get(id) || null);
  });
};

// Player DataLoader
export const createPlayerLoader = () => {
  return new DataLoader(async (playerIds: readonly string[]) => {
    const database = db();
    if (!database) return playerIds.map(() => null);

    // Use centralized SQL query instead of inline Drizzle query
    const playersData = await getPlayersByIdsQuery([...playerIds]);

    const playerMap = new Map(playersData.map(player => [player.id, player]));
    return playerIds.map(id => playerMap.get(id) || null);
  });
};

// DataLoader context type is now imported from @/types

// Create DataLoader context
export const createDataLoaderContext = (): DataLoaderContext => ({
  userLoader: createUserLoader(),
  commentCountLoader: createCommentCountLoader(),
  reactionCountLoader: createReactionCountLoader(),
  publicCommentCountLoader: createPublicCommentCountLoader(),
  publicReactionCountLoader: createPublicReactionCountLoader(),
  gameLoader: createGameLoader(),
  teamLoader: createTeamLoader(),
  playerLoader: createPlayerLoader(),
});

// Extend GraphQL context with DataLoaders
export interface IEnhancedGraphQLContext extends GraphQLContext {
  dataLoaders: DataLoaderContext;
}
