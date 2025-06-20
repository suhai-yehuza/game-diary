import 'dotenv/config';

import { readFileSync } from 'fs';
import { join } from 'path';

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import type { NextRequest } from 'next/server';

import { apiLogger } from '@lib/core/logger';
import { getCorsHeaders, handleApiError, createOptionsResponse } from '@src/lib/api/utils';
import { createContext } from '@src/lib/graphql/context';
import { resolvers } from '@src/lib/graphql/resolvers';
import type { IContext } from '@src/lib/types';

const typeDefs = readFileSync(join(process.cwd(), 'src/lib/graphql/schema.graphql'), 'utf-8');

// Create the base schema
const graphqlSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Apollo Server instance
const server = new ApolloServer<IContext>({
  schema: graphqlSchema,
});

// Create the handler
const handler = startServerAndCreateNextHandler(server, {
  context: createContext,
});

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 50000; // 50,000 requests per minute

async function graphqlHandler(req: NextRequest) {
  try {
    // Get client IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    const now = Date.now();
    const userRequests = requestCounts.get(ip);

    if (userRequests && now < userRequests.resetTime) {
      if (userRequests.count >= MAX_REQUESTS) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      userRequests.count++;
    } else {
      requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    const response = await handler(req);
    const headers = getCorsHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    apiLogger.error('GraphQL Error:', error);
    return handleApiError(error);
  }
}

export { graphqlHandler as GET, graphqlHandler as POST };

export async function OPTIONS() {
  return createOptionsResponse();
}

// Force Node.js runtime for this API route since we're using fs operations
export const runtime = 'nodejs';
