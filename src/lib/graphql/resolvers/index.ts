import { readFileSync } from 'fs';
import { join } from 'path';

import { makeExecutableSchema } from '@graphql-tools/schema';

import { createDataLoaderContext } from '@/lib/graphql/dataloaders';
import {
  gameQueryResolvers,
  gameResolver as _gameResolver,
  gameMutationResolvers,
} from '@/lib/graphql/resolvers/basketball-game';
import {
  nbaPlayerQueryResolvers,
  nbaPlayerResolver,
} from '@/lib/graphql/resolvers/basketball-player';
import { teamQueryResolvers, teamResolver } from '@/lib/graphql/resolvers/basketball-team';
import {
  commentQueryResolvers,
  commentResolver,
  commentMutationResolvers,
} from '@/lib/graphql/resolvers/comment';
import {
  friendshipMutationResolvers,
  friendshipQueryResolvers,
} from '@/lib/graphql/resolvers/friendship';
import {
  gameLogQueryResolvers,
  gameLogMutationResolvers,
  gameLogResolver,
} from '@/lib/graphql/resolvers/game-log';
import {
  notificationQueryResolvers,
  notificationMutationResolvers,
} from '@/lib/graphql/resolvers/notification';
import {
  publicCommentQueryResolvers,
  publicCommentResolver,
  publicReactionQueryResolvers,
  publicCommentMutationResolvers,
  publicReactionMutationResolvers,
} from '@/lib/graphql/resolvers/public-resolvers';
import {
  reactionQueryResolvers,
  reactionResolver,
  reactionMutationResolvers,
} from '@/lib/graphql/resolvers/reaction';
import { ErrorResult } from '@/lib/graphql/resolvers/scalars';
import {
  userQueryResolvers,
  userSummaryResolver,
  dbUserResolver,
} from '@/lib/graphql/resolvers/user';
import type { GraphQLContext } from '@/types';

// Read the GraphQL schema
const typeDefs = readFileSync(join(process.cwd(), 'src/lib/graphql/schema.graphql'), 'utf8');

// Combine all resolvers
const resolvers = {
  Query: {
    ...userQueryResolvers,
    ...gameQueryResolvers,
    ...nbaPlayerQueryResolvers,
    ...teamQueryResolvers,
    ...gameLogQueryResolvers, // Consolidated game log queries
    ...commentQueryResolvers,
    ...reactionQueryResolvers,
    ...publicCommentQueryResolvers,
    ...publicReactionQueryResolvers,
    ...friendshipQueryResolvers,
    ...notificationQueryResolvers,
  },
  Mutation: {
    ...gameMutationResolvers,
    ...gameLogMutationResolvers,
    ...commentMutationResolvers,
    ...reactionMutationResolvers,
    ...publicCommentMutationResolvers,
    ...publicReactionMutationResolvers,
    ...friendshipMutationResolvers,
    ...notificationMutationResolvers,
  },
  UserSummary: userSummaryResolver,
  DBUser: dbUserResolver,
  // Game: gameResolver, // Disabled to prevent overriding GameLog.game resolver data
  NBAPlayer: nbaPlayerResolver,
  Team: teamResolver,
  GameLog: {
    // Ensure id field is properly resolved
    id: (parent: { id: string }) => parent.id || 'default-game-log-id',
    // Use the existing user query resolver instead of custom field resolver
    user: async (parent: { user_id: string }, _args: unknown, context: GraphQLContext) => {
      if (!parent.user_id) return null;
      // Use the existing user query resolver
      return userQueryResolvers.user(null, { id: parent.user_id }, context);
    },
    // Use the gameLogResolver.game instead of gameQueryResolvers.game
    game: gameLogResolver.game,
    comments: gameLogResolver.comments,
    reactions: gameLogResolver.reactions,
    totalCommentCount: gameLogResolver.totalCommentCount,
    totalReactionCount: gameLogResolver.totalReactionCount,
  },
  Comment: commentResolver,
  Reaction: reactionResolver,
  PublicComment: publicCommentResolver,
  ErrorResult,
};

// Create the executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Enhanced schema with DataLoaders
export const createEnhancedSchema = () => {
  return makeExecutableSchema({
    typeDefs,
    resolvers: {
      ...resolvers,
      // Add context creation for DataLoaders
      context: () => ({
        dataLoaders: createDataLoaderContext(),
      }),
    },
  });
};

// This file is kept for potential future use but currently resolvers are imported directly from their specific paths
// All exports have been removed to eliminate dead code
