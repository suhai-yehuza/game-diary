import { readFileSync } from 'fs';
import { join } from 'path';

import { gql } from '@apollo/client';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { resolvers } from '@src/lib/graphql/resolvers';

// Read the schema from schema.graphql
const schemaPath = join(process.cwd(), 'src/lib/graphql/schema.graphql');
const schemaContent = readFileSync(schemaPath, 'utf-8');
const typeDefs = gql`
  ${schemaContent}
`;

// Create an executable schema from the resolvers and typeDefs
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Export the schema for use in codegen
export default schema;
