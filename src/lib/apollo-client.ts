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
  // For now, we'll handle authentication through cookies/session
  // Clerk will handle the authentication on the server side
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
            keyArgs: ['filters', 'pagination'],
            merge(_existing: unknown, incoming: unknown): unknown {
              return incoming;
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
