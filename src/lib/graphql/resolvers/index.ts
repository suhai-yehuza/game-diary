import { readFileSync } from 'fs';
import { join } from 'path';

import { makeExecutableSchema } from '@graphql-tools/schema';

import { commentQueryResolvers, commentResolver } from '@/lib/graphql/resolvers/comment';
import { gameQueryResolvers, gameResolver, gameLogResolver } from '@/lib/graphql/resolvers/game';
import {
  gameMutationResolvers,
  commentMutationResolvers,
  reactionMutationResolvers,
  friendshipMutationResolvers,
} from '@/lib/graphql/resolvers/mutations';
import { reactionQueryResolvers, reactionResolver } from '@/lib/graphql/resolvers/reaction';
import { ErrorResult } from '@/lib/graphql/resolvers/scalars';
import {
  userQueryResolvers,
  userSummaryResolver,
  dbUserResolver,
} from '@/lib/graphql/resolvers/user';

// Read the GraphQL schema
const typeDefs = readFileSync(join(process.cwd(), 'src/lib/graphql/schema.graphql'), 'utf8');

// Combine all resolvers
const resolvers = {
  Query: {
    ...userQueryResolvers,
    ...gameQueryResolvers,
    ...commentQueryResolvers,
    ...reactionQueryResolvers,
  },
  Mutation: {
    ...gameMutationResolvers,
    ...commentMutationResolvers,
    ...reactionMutationResolvers,
    ...friendshipMutationResolvers,
  },
  UserSummary: userSummaryResolver,
  DBUser: dbUserResolver,
  Game: gameResolver,
  GameLog: gameLogResolver,
  Comment: commentResolver,
  Reaction: reactionResolver,
  ErrorResult,
};

// Create the executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Export individual resolvers for testing
export {
  userQueryResolvers,
  userSummaryResolver,
  dbUserResolver,
  gameQueryResolvers,
  gameResolver,
  gameLogResolver,
  commentQueryResolvers,
  commentResolver,
  reactionQueryResolvers,
  reactionResolver,
  gameMutationResolvers,
  commentMutationResolvers,
  reactionMutationResolvers,
  friendshipMutationResolvers,
};
