import { readFileSync } from 'fs';
import { join } from 'path';

import { makeExecutableSchema } from '@graphql-tools/schema';

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
    // Add other query resolvers here
  },
  UserSummary: userSummaryResolver,
  DBUser: dbUserResolver,
  ErrorResult,
  // Add other type resolvers here
};

// Create the executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Export individual resolvers for testing
export { userQueryResolvers, userSummaryResolver, dbUserResolver };
