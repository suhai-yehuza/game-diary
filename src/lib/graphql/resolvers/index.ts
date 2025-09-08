import { readFileSync } from 'fs';
import { join } from 'path';

import { makeExecutableSchema } from '@graphql-tools/schema';

import { gameQueryResolvers, gameResolver } from '@/lib/graphql/resolvers/basketball-game';
import {
  nbaPlayerQueryResolvers,
  nbaPlayerResolver,
} from '@/lib/graphql/resolvers/basketball-player';
import { teamQueryResolvers, teamResolver } from '@/lib/graphql/resolvers/basketball-team';
import { commentQueryResolvers, commentResolver } from '@/lib/graphql/resolvers/comment';
import {
  friendshipMutationResolvers,
  friendshipQueryResolvers,
} from '@/lib/graphql/resolvers/friendship';
import { gameLogMutationResolvers, gameLogResolver } from '@/lib/graphql/resolvers/game-log';
import { adaptiveGameLogQueryResolvers } from '@/lib/graphql/resolvers/game-log-adaptive';
import { optimizedGameLogQueryResolvers } from '@/lib/graphql/resolvers/game-log-optimized';
import {
  gameMutationResolvers,
  commentMutationResolvers,
  reactionMutationResolvers,
} from '@/lib/graphql/resolvers/mutations';
import {
  notificationQueryResolvers,
  notificationMutationResolvers,
} from '@/lib/graphql/resolvers/notification';
import {
  publicCommentQueryResolvers,
  publicCommentResolver,
} from '@/lib/graphql/resolvers/public-comments';
import {
  publicCommentMutationResolvers,
  publicReactionMutationResolvers,
} from '@/lib/graphql/resolvers/public-mutations';
import { publicReactionQueryResolvers } from '@/lib/graphql/resolvers/public-reactions';
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
    ...nbaPlayerQueryResolvers,
    ...teamQueryResolvers,
    ...adaptiveGameLogQueryResolvers, // Use adaptive resolver for gameLogs (fixing user field issue)
    // Add friendsGameLogs from optimized resolver since adaptive doesn't have it
    friendsGameLogs: optimizedGameLogQueryResolvers.friendsGameLogs,
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
  Game: gameResolver,
  NBAPlayer: nbaPlayerResolver,
  Team: teamResolver,
  GameLog: {
    // Only use the game resolver to resolve team names, let optimized query handle user data
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

// This file is kept for potential future use but currently resolvers are imported directly from their specific paths
// All exports have been removed to eliminate dead code
