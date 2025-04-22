import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../../../lib/graphql/schema';
import { resolvers } from '../../../lib/graphql/resolvers';
import { gql } from 'graphql-tag';
import { db } from '../../../db';
import { cache } from '../../../lib/redis';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

type Context = {
  db: typeof db;
  redis: Redis;
};

const server = new ApolloServer({
  typeDefs: gql`
    ${typeDefs}
  `,
  resolvers,
  introspection: true,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (): Promise<Context> => ({
    db,
    redis: cache as unknown as Redis,
  }),
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
