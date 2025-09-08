import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import type { NextRequest } from 'next/server';

import { buildAuthContext } from '@/lib/auth/authContextBuilder';
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

// Create the handler with enhanced authentication context
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    const authContext = await buildAuthContext(req);

    console.log('[GRAPHQL AUTH] Context:', {
      isAuthenticated: authContext.isAuthenticated,
      authSource: authContext.authSource,
      hasUser: !!authContext.user,
      userId: authContext.userId,
      error: authContext.error,
    });

    return {
      req,
      user: authContext.user,
      userId: authContext.userId,
      isAuthenticated: authContext.isAuthenticated,
      authSource: authContext.authSource,
      authError: authContext.error,
    };
  },
});

// Handle CORS preflight requests
export function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export { handler as GET, handler as POST };
