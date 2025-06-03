import 'dotenv/config';

import { readFileSync } from 'fs';
import { join } from 'path';

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { NextRequest, NextResponse } from 'next/server';

import { getCache } from '@/lib/cache';
import { db } from '@/lib/db/seed';
import { createLoaders } from '@/lib/graphql/loaders';
import { resolvers } from '@/lib/graphql/resolvers';
import type { RedisClient } from '@/lib/types/cache.types';
import type { Context } from '@/lib/types/component.types';
import { import { apiLogger } from '@/lib/logger'; } from '@/lib/logger';
const typeDefs = readFileSync(join(process.cwd(), 'src/lib/graphql/schema.graphql'), 'utf-8');

// Create the base schema
let graphqlSchema = makeExecutableSchema({
  typeDefs: [constraintDirectiveTypeDefs, typeDefs],
  resolvers,
});

// Apply the constraint directive to the schema
graphqlSchema = constraintDirective()(graphqlSchema);

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10000; // 10000 requests per minute (166 requests per second)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Helper function to check rate limit
function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const userRequests = requestCounts.get(userId);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  if (userRequests.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetTime: userRequests.resetTime };
  }

  userRequests.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - userRequests.count,
    resetTime: userRequests.resetTime,
  };
}

const CACHE_TTL = 300; // 5 minutes in seconds
const CLERK_RETRY_DELAY = 1000; // 1 second delay between retries
const MAX_CLERK_RETRIES = 3;

// Helper function to get user with retries and caching
async function getUserWithRetry(
  userId: string,
  redisClient: RedisClient | null
): Promise<Context['user'] | undefined> {
  if (!redisClient) return undefined;

  // Try to get from cache first
  const cacheKey = `user:${userId}`;
  const cachedUser = await redisClient?.get(cacheKey);

  if (cachedUser) {
    try {
      // Handle both string and object formats
      const parsedUser = typeof cachedUser === 'string' ? JSON.parse(cachedUser) : cachedUser;
      return parsedUser as Context['user'];
    } catch (e) {
      apiLogger.error('Error parsing cached user:', e);
      // If parsing fails, clear the invalid cache entry
      await redisClient?.del(cacheKey);
    }
  }

  // If not in cache, try to get from Clerk with retries
  let retries = 0;
  while (retries < MAX_CLERK_RETRIES) {
    try {
      const clerkClientInstance = await clerkClient();
      const user = await clerkClientInstance.users.getUser(userId);
      if (user) {
        const dbUser = {
          id: user.id,
          username: user.username ?? '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          emailAddress: user.emailAddresses[0]?.emailAddress || '',
          imageUrl: user.imageUrl,
        };

        // Cache the user data
        if (redisClient) {
          try {
            // Ensure we're storing a string
            const userString = JSON.stringify(dbUser);
            await redisClient.setex(cacheKey, CACHE_TTL, userString);
          } catch (cacheError) {
            apiLogger.error('Error caching user:', cacheError);
          }
        }

        return dbUser;
      }
      return undefined;
    } catch (error) {
      retries++;
      if (error instanceof Error && error.message.includes('Too Many Requests')) {
        if (retries < MAX_CLERK_RETRIES) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, CLERK_RETRY_DELAY * retries));
          continue;
        }
      }
      throw error;
    }
  }
  return undefined;
}

const server = new ApolloServer<Context>({
  schema: graphqlSchema,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (_req: NextRequest): Promise<Context> => {
    const cache = getCache();
    await cache.initializeRedis();
    const redisClient = cache.getRedisClient();

    try {
      // Get the current user from Clerk
      const { userId } = await auth();
      if (!userId) {
        return {
          db: db,
          redis: redisClient,
          user: undefined,
          loaders: createLoaders(db),
        } as Context;
      }

      // Check rate limit
      const rateLimit = checkRateLimit(userId);
      if (!rateLimit.allowed) {
        throw new Error(
          `Rate limit exceeded. Please try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`
        );
      }

      // Get user with retries and caching
      const dbUser = await getUserWithRetry(userId, redisClient);

      return {
        db: db,
        redis: redisClient,
        user: dbUser,
        loaders: createLoaders(db),
      } as Context;
    } catch (error) {
      apiLogger.error('Context creation error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Rate limit exceeded')) {
          const resetTime = error.message.match(/\d+/)?.[0] || '60';
          throw new Error(`Rate limit exceeded. Please try again in ${resetTime} seconds.`);
        }
        if (error.message.includes('Too Many Requests')) {
          throw new Error('Service temporarily unavailable. Please try again in a few seconds.');
        }
      }
      throw error;
    }
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
    apiLogger.error('GraphQL Error:', error);
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      const resetTime = error.message.match(/\d+/)?.[0] || '60';
      return NextResponse.json(
        {
          error: error.message,
          retryAfter: resetTime,
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetTime,
          },
        }
      );
    }
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
    apiLogger.error('GraphQL Error:', error);
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      const resetTime = error.message.match(/\d+/)?.[0] || '60';
      return NextResponse.json(
        {
          error: error.message,
          retryAfter: resetTime,
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetTime,
          },
        }
      );
    }
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
