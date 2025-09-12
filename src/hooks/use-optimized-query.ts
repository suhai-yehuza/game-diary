import { useQuery, useLazyQuery, type DocumentNode, type OperationVariables } from '@apollo/client';
import { useCallback, useMemo, useRef, useState } from 'react';

import { logger } from '@/lib/utils/logger';
import type { IOptimizedQueryResult, IOptimizedQueryOptions } from '@/types';

/**
 * Optimized query hook with built-in performance optimizations
 */
export function useOptimizedQuery<T = unknown>(
  query: DocumentNode,
  options: IOptimizedQueryOptions & { variables?: unknown } = {}
): IOptimizedQueryResult<T> {
  const {
    fetchPolicy = 'cache-first',
    errorPolicy = 'all',
    notifyOnNetworkStatusChange = false,
    pollInterval,
    skip = false,
    debounceMs = 300,
    retryCount = 3,
    retryDelay = 1000,
    variables,
    ...apolloOptions
  } = options;

  const [retryAttempts, setRetryAttempts] = useState(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastVariablesRef = useRef(variables);

  // Memoize variables to prevent unnecessary re-renders
  const memoizedVariables = useMemo(() => {
    if (!variables) return undefined;

    // Deep comparison to prevent unnecessary queries
    const variablesChanged = JSON.stringify(variables) !== JSON.stringify(lastVariablesRef.current);
    if (variablesChanged) {
      lastVariablesRef.current = variables;
    }

    return variables;
  }, [variables]);

  // Apollo query hook
  const {
    data,
    loading,
    error,
    refetch: apolloRefetch,
    fetchMore,
    networkStatus,
    called,
  } = useQuery(query, {
    variables: memoizedVariables,
    fetchPolicy,
    errorPolicy,
    notifyOnNetworkStatusChange,
    pollInterval,
    skip,
    ...apolloOptions,
  });

  // Enhanced error handling with retry logic
  const handleError = useCallback(
    (error: Error) => {
      logger.error('Query error', {
        error: error.message,
        retryAttempts,
        variables: memoizedVariables,
      });

      if (retryAttempts < retryCount) {
        setTimeout(
          () => {
            setRetryAttempts(prev => prev + 1);
            void apolloRefetch();
          },
          retryDelay * Math.pow(2, retryAttempts)
        ); // Exponential backoff
      }
    },
    [retryAttempts, retryCount, retryDelay, memoizedVariables, apolloRefetch]
  );

  // Enhanced refetch with retry logic
  const refetch = useCallback(
    async (newVariables?: unknown) => {
      try {
        const result = await apolloRefetch(newVariables as Partial<OperationVariables> | undefined);
        setRetryAttempts(0);
        return result;
      } catch (error) {
        handleError(error as Error);
        throw error;
      }
    },
    [apolloRefetch, handleError]
  );

  // Debounced refetch function
  const debouncedRefetch = useCallback(
    (newVariables?: unknown) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      return new Promise((resolve, reject) => {
        debounceTimeoutRef.current = setTimeout(() => {
          void (async () => {
            try {
              const result = await refetch(newVariables);
              setRetryAttempts(0); // Reset retry count on success
              resolve(result);
            } catch (error) {
              reject(error);
            }
          })();
        }, debounceMs);
      });
    },
    [debounceMs, refetch]
  );

  // Cleanup debounce timeout on unmount
  useCallback(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading: loading || retryAttempts > 0,
    error,
    refetch: debouncedRefetch,
    fetchMore,
    networkStatus,
    called,
  };
}

/**
 * Optimized lazy query hook for on-demand queries
 */
export function useOptimizedLazyQuery<_T = unknown>(
  query: unknown,
  options: IOptimizedQueryOptions = {}
) {
  const {
    fetchPolicy = 'cache-first',
    errorPolicy = 'all',
    debounceMs = 300,
    retryCount = 3,
    retryDelay = 1000,
    ...apolloOptions
  } = options;

  const [retryAttempts, setRetryAttempts] = useState(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [executeQuery, { data, loading, error, called, networkStatus }] = useLazyQuery(
    query as DocumentNode,
    {
      fetchPolicy,
      errorPolicy,
      onError: (error: Error) => {
        logger.error('Lazy query error', {
          error: error.message,
          retryAttempts,
        });

        if (retryAttempts < retryCount) {
          setTimeout(
            () => {
              setRetryAttempts(prev => prev + 1);
              void executeQuery();
            },
            retryDelay * Math.pow(2, retryAttempts)
          );
        }
      },
      ...apolloOptions,
    }
  );

  // Debounced execute function
  const debouncedExecute = useCallback(
    (variables?: unknown) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      return new Promise((resolve, reject) => {
        debounceTimeoutRef.current = setTimeout(() => {
          void (async () => {
            try {
              const result = await executeQuery({
                variables: variables as Record<string, unknown>,
              });
              setRetryAttempts(0);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          })();
        }, debounceMs);
      });
    },
    [executeQuery, debounceMs]
  );

  return {
    executeQuery: debouncedExecute,
    data,
    loading: loading || retryAttempts > 0,
    error,
    called,
    networkStatus,
  };
}
