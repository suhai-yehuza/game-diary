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
      const { userId } = await auth();
      const user = await currentUser();

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
