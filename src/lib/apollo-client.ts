import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  type FieldFunctionOptions,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import type { IConnection } from '@/types';

// Create an http link to the GraphQL API
const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'include', // Include cookies for authentication
  // Add aggressive timeout to prevent hanging requests
  fetch: (uri, options) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('GraphQL query timeout - aborting request');
      controller.abort();
    }, 15000); // 15 second timeout for complex queries

    return fetch(uri, {
      ...options,
      signal: controller.signal,
    })
      .catch((error: Error) => {
        if (error.name === 'AbortError') {
          console.warn('GraphQL query was aborted due to timeout');
          throw new Error('Query timeout - please try again');
        }
        throw error;
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  },
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
    // Don't log 403 errors as they are expected for unauthenticated users
    const isAuthError =
      networkError.message?.includes('403') ||
      networkError.message?.includes('Forbidden') ||
      networkError.message?.includes('Authentication required');

    if (!isAuthError) {
      console.error(`[Network error]: ${networkError}`);
    }
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
          // Optimize gameLogs with better keyArgs and merge strategy
          gameLogs: {
            keyArgs: ['filters', 'pagination.first'],
            merge(
              existing: IConnection<unknown> | undefined,
              incoming: IConnection<unknown>,
              options: FieldFunctionOptions
            ) {
              const args = options?.args as { pagination?: { after?: string } } | undefined;
              // If no existing data, return incoming
              if (!existing) return incoming;

              // If this is a fresh query (no cursor), replace existing
              if (!args?.pagination?.after) return incoming;

              // Merge paginated results
              return {
                ...incoming,
                edges: [...(existing.edges || []), ...(incoming.edges || [])],
                pageInfo: incoming.pageInfo,
                totalCount: incoming.totalCount,
              };
            },
          },
          // Optimize comments with better pagination handling
          comments: {
            keyArgs: ['filters', 'pagination.first'],
            merge(
              existing: IConnection<unknown> | undefined,
              incoming: IConnection<unknown>,
              options: FieldFunctionOptions
            ) {
              const args = options?.args as { pagination?: { after?: string } } | undefined;
              if (!existing) return incoming;
              if (!args?.pagination?.after) return incoming;

              return {
                ...incoming,
                edges: [...(existing.edges || []), ...(incoming.edges || [])],
                pageInfo: incoming.pageInfo,
                totalCount: incoming.totalCount,
              };
            },
          },
          // Optimize reactions with stable caching
          reactions: {
            keyArgs: ['targetId', 'targetType'],
            merge(_existing: unknown, incoming: unknown) {
              // Always return incoming for reactions to ensure real-time updates
              return incoming;
            },
          },
          // Add caching for user searches
          searchUsers: {
            keyArgs: ['searchTerm', 'searchField', 'filters', 'pagination.first'],
            merge(
              existing: IConnection<unknown> | undefined,
              incoming: IConnection<unknown>,
              options: FieldFunctionOptions
            ) {
              const args = options?.args as { pagination?: { after?: string } } | undefined;
              if (!existing) return incoming;
              if (!args?.pagination?.after) return incoming;

              return {
                ...incoming,
                edges: [...(existing.edges || []), ...(incoming.edges || [])],
                pageInfo: incoming.pageInfo,
                totalCount: incoming.totalCount,
              };
            },
          },
          // Add caching for friendships
          userFriendships: {
            keyArgs: ['filters', 'pagination.first'],
            merge(
              existing: IConnection<unknown> | undefined,
              incoming: IConnection<unknown>,
              options: FieldFunctionOptions
            ) {
              const args = options?.args as { pagination?: { after?: string } } | undefined;
              if (!existing) return incoming;
              if (!args?.pagination?.after) return incoming;

              return {
                ...incoming,
                edges: [...(existing.edges || []), ...(incoming.edges || [])],
                pageInfo: incoming.pageInfo,
                totalCount: incoming.totalCount,
              };
            },
          },
        },
      },
      // Optimize individual entity caching
      Game: {
        keyFields: ['id'],
        fields: {
          // Cache computed fields
          average_rating: {
            read(rating: number) {
              return rating || 0;
            },
          },
        },
      },
      GameLog: {
        keyFields: ['id'],
        fields: {
          // Enable optimistic updates for game log fields
          rating_for_game: {
            read(rating: number) {
              return rating || 0;
            },
          },
          notes: {
            read(notes: string) {
              return notes || '';
            },
          },
        },
      },
      Comment: {
        keyFields: ['id'],
        fields: {
          // Enable optimistic updates for comment fields
          content: {
            read(content: string) {
              return content || '';
            },
          },
          updated_at: {
            read(updatedAt: string) {
              return updatedAt || new Date().toISOString();
            },
          },
        },
      },
      Reaction: {
        keyFields: ['id'],
        fields: {
          // Ensure reactions are always fresh
          created_at: {
            read(timestamp: string) {
              return timestamp || new Date().toISOString();
            },
          },
        },
      },
      UserSummary: {
        keyFields: ['id'],
        fields: {
          // Cache user data efficiently
          image_url: {
            read(url: string) {
              return url || '/avatars/default-user-avatar.svg';
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
      // Add polling for real-time data
      pollInterval: 0, // Disable polling by default, enable where needed
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
      // Add timeout for queries
    },
    mutate: {
      errorPolicy: 'all',
      // Optimize mutation performance
      awaitRefetchQueries: false,
    },
  },
  // Add performance monitoring
  name: 'game-diary-client',
  version: '1.0.0',
});
