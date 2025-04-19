import { makeExecutableSchema } from '@graphql-tools/schema';

import { resolvers } from '@/lib/graphql/resolvers';
import { typeDefs } from '@/lib/graphql/schema';

// Create an executable schema from the resolvers and typeDefs
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Export the schema for use in codegen
export default schema;
