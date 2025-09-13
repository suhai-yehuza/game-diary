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

    // Don't convert GraphQL errors to HTTP status codes
    // Let Apollo handle them as GraphQL errors
    return {
      message: error.message,
      code: error.extensions?.code ?? 'INTERNAL_SERVER_ERROR',
      extensions: error.extensions,
    };
  },
  // Ensure GraphQL errors are returned as GraphQL responses, not HTTP errors
  includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development',
});

// Create the handler with enhanced authentication context
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    const authContext = await buildAuthContext(req);

    // Only log authentication errors for debugging
    if (!authContext.isAuthenticated && authContext.error) {
      console.warn('[GRAPHQL AUTH] Authentication failed:', {
        error: authContext.error,
        authSource: authContext.authSource,
      });
    }

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
