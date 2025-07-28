import { readFileSync } from 'fs';
import { join } from 'path';

import { makeExecutableSchema } from '@graphql-tools/schema';

import { commentQueryResolvers, commentResolver } from '@/lib/graphql/resolvers/comment';
import {
  friendshipMutationResolvers,
  friendshipQueryResolvers,
} from '@/lib/graphql/resolvers/friendship';
import { gameQueryResolvers, gameResolver } from '@/lib/graphql/resolvers/game';
import {
  gameLogQueryResolvers,
  gameLogMutationResolvers,
  gameLogResolver,
} from '@/lib/graphql/resolvers/game-log';
import {
  gameMutationResolvers,
  commentMutationResolvers,
  reactionMutationResolvers,
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
    ...gameLogQueryResolvers,
    ...commentQueryResolvers,
    ...reactionQueryResolvers,
    ...friendshipQueryResolvers,
  },
  Mutation: {
    ...gameMutationResolvers,
    ...gameLogMutationResolvers,
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

// This file is kept for potential future use but currently resolvers are imported directly from their specific paths
// All exports have been removed to eliminate dead code
