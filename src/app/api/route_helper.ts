import { NextResponse } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '../../lib/graphql/schema';
import { resolvers } from '../../lib/graphql/resolvers';

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create Next.js API handler
const handler = startServerAndCreateNextHandler(server);

// Export the handler for POST requests
export async function POST(request: Request) {
  try {
    // Handle CORS
    const response = await handler(request);
    response.headers.set(
      'Access-Control-Allow-Origin',
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    );
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('GraphQL Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
