import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Create an http link to the GraphQL API
const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'include', // Include cookies for authentication
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      // Only log critical errors in development
      if (process.env.NODE_ENV === 'development' && message.includes('INTERNAL_SERVER_ERROR')) {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${JSON.stringify(path)}`
        );
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Add authentication headers
const authLink = setContext((_, { headers }: { headers?: Record<string, string> }) => {
  // Clerk handles authentication through cookies/session automatically
  // The server-side GraphQL resolver will extract the session from cookies
  return {
    headers: {
      ...headers,
    },
  };
});

// Create the Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          gameLogs: {
            keyArgs: ['filters'],
            merge(_existing: unknown, incoming: unknown): unknown {
              return incoming;
            },
          },
          comments: {
            keyArgs: ['filters'],
            merge(_existing: unknown, incoming: unknown): unknown {
              return incoming;
            },
          },
          reactions: {
            keyArgs: ['targetId', 'targetType'],
            merge(_existing: unknown, incoming: unknown): unknown {
              return incoming;
            },
          },
        },
      },
      Comment: {
        fields: {
          // Enable optimistic updates for comment fields
          content: {
            read(content: string) {
              return content;
            },
          },
          updated_at: {
            read(updatedAt: string) {
              return updatedAt;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
});
