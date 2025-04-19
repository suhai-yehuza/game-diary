import { readFileSync } from 'fs';
import { join } from 'path';

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import type { IResolvers } from '@graphql-tools/utils';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getCache } from '@/lib/cache/index';
import { db } from '@/lib/db/seed';
import { createLoaders } from '@/lib/graphql/loaders';
import { resolvers } from '@/lib/graphql/resolvers';
import type { Context } from '@/lib/types';

const typeDefs = readFileSync(join(process.cwd(), 'src/lib/graphql/schema.graphql'), 'utf-8');

// Create the base schema
let graphqlSchema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, typeDefs],
  resolvers: resolvers as IResolvers<unknown, Context>,
});

// Apply the constraint directive to the schema
graphqlSchema = constraintDirective()(graphqlSchema);

const server = new ApolloServer<Context>({
  schema: graphqlSchema,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (_req: NextRequest) => {
    const cache = getCache();
    await cache.initializeRedis();
    const redisClient = cache.getRedisClient();
    return {
      db,
      redis: redisClient,
      user: null,
      loaders: createLoaders(db),
    };
  },
});

export async function GET(request: Request) {
  try {
    const response = await handler(request);
    response.headers.set(
      'Access-Control-Allow-Origin',
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    );
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('GraphQL Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const response = await handler(request);
    response.headers.set(
      'Access-Control-Allow-Origin',
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    );
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('GraphQL Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
