import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

import { schema } from '@/lib/graphql/resolvers';

// Create Apollo Server instance
const server = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV !== 'production',
  formatError: error => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      code: error.extensions?.code ?? 'INTERNAL_SERVER_ERROR',
    };
  },
});

// Create the handler with authentication context
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    try {
      // Check for authentication bypass in development/test environments
      const isAuthBypassEnabled =
        process.env.API_MOCK_MODE === 'true' ||
        process.env.E2E_AUTH_BYPASS === 'true' ||
        process.env.PLAYWRIGHT_TEST === 'true' ||
        process.env.NODE_ENV === 'test';

      if (isAuthBypassEnabled) {
        console.log('[AUTH BYPASS] Using mock authentication for GraphQL');
        return {
          req,
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
          },
          userId: 'test-user-id',
        };
      }

      const { userId } = await auth();

      // Add retry logic for currentUser to handle rate limiting
      let user = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          user = await currentUser();
          break; // Success, exit retry loop
        } catch (error: unknown) {
          retryCount++;
          console.error(`Clerk currentUser attempt ${retryCount} failed:`, error);

          // Type guard to check if error has status property
          if (
            error &&
            typeof error === 'object' &&
            'status' in error &&
            error.status === 429 &&
            retryCount < maxRetries
          ) {
            const retryAfter =
              'retryAfter' in error && typeof error.retryAfter === 'number' ? error.retryAfter : 1;
            console.log(`Rate limited, waiting ${retryAfter} seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            continue;
          }
          break;
        }
      }

      return {
        req,
        user: user
          ? {
              id: user.id,
              email: user.emailAddresses?.[0]?.emailAddress,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
            }
          : null,
        userId,
      };
    } catch (error) {
      console.error('Error in GraphQL context:', error);
      return {
        req,
        user: null,
        userId: null,
      };
    }
  },
});

export { handler as GET, handler as POST };
