import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  ApolloLink,
  type FetchPolicy,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

import { apiLogger } from 'lib/core/logger';
const httpLink = new HttpLink({
  uri: '/api/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'same-origin',
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      apiLogger.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    apiLogger.error(`[Network error]: ${networkError}`);
    // If the error is due to request cancellation, don't retry
    if (networkError.name === 'AbortError') {
      return;
    }
  }
  return forward(operation);
});

// Retry link for failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 3000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Don't retry if the error is due to request cancellation
      return error.name !== 'AbortError';
    },
  },
});

// Deduplication link
const dedupLink = new ApolloLink((operation, forward) => {
  if (operation.getContext().skipDeduplication) {
    return forward(operation);
  }
  return forward(operation);
});

// Create cache with type policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        game: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        games: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// Create the Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, retryLink, dedupLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first' as FetchPolicy,
      nextFetchPolicy: 'cache-first' as FetchPolicy,
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      fetchPolicy: 'cache-first' as FetchPolicy,
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: process.env.NODE_ENV === 'development',
  ssrMode: typeof window === 'undefined',
});
