import type { DocumentNode, MutationHookOptions, MutationFunctionOptions } from '@apollo/client';
import { useMutation as apolloUseMutation } from '@apollo/client';
import { useCallback, useRef, useMemo } from 'react';

import { errorHandlers } from '@/lib/utils/error-handler';
import type { IMutationOptions } from '@/types';

/**
 * Optimized GraphQL mutation hook with performance monitoring and caching strategies
 */
export function useOptimizedMutation<TData = unknown, TVariables = Record<string, unknown>>(
  mutation: DocumentNode,
  options: IMutationOptions<TData, TVariables> = {}
): [
  (options?: MutationFunctionOptions<TData, TVariables>) => Promise<TData | undefined>,
  {
    loading: boolean;
    error?: Error;
    data: TData | undefined;
    called: boolean;
    client: unknown;
    mutate: (options?: MutationFunctionOptions<TData, TVariables>) => Promise<TData | undefined>;
    mutateAsync: (options?: MutationFunctionOptions<TData, TVariables>) => Promise<TData>;
    reset: () => void;
  },
] {
  const {
    enableOptimisticUpdates = false,
    refetchQueries = 'active',
    awaitRefetchQueries = false,
    context = {},
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  // Type assertion for mutationOptions to access variables
  const _mutationOpts = mutationOptions as MutationHookOptions<TData, TVariables>;

  // Performance monitoring
  const mutationStartTime = useRef<number>(0);
  const mutationTime = useRef<number>(0);
  const isSlowMutation = useRef<boolean>(false);
  const lastMutationVariables = useRef<TVariables | undefined>(undefined);

  // Determine optimal error policy
  const errorPolicy = useMemo(() => {
    if (enableOptimisticUpdates) return 'all';
    return 'none';
  }, [enableOptimisticUpdates]);

  // Optimized mutation options
  const optimizedOptions: MutationHookOptions<TData, TVariables> = {
    ...mutationOptions,
    errorPolicy,
    // Optimize refetch behavior
    refetchQueries,
    awaitRefetchQueries,
    // Performance monitoring callbacks
    onCompleted: data => {
      mutationTime.current = Date.now() - mutationStartTime.current;
      isSlowMutation.current = mutationTime.current > 1000;

      // Log slow mutations
      if (isSlowMutation.current) {
        console.warn(`Slow mutation detected: ${mutationTime.current}ms`, {
          mutation: mutation?.loc?.source?.body || 'Unknown mutation',
          variables: lastMutationVariables.current,
          context,
        });

        // Dispatch performance event
        window.dispatchEvent(
          new CustomEvent('slow-mutation', {
            detail: {
              duration: mutationTime.current,
              mutation: mutation?.loc?.source?.body || 'Unknown mutation',
              variables: lastMutationVariables.current,
              context,
            },
          })
        );
      }

      // Call original onCompleted if provided (this handles the component's toast logic)
      if (mutationOptions.onCompleted) {
        mutationOptions.onCompleted(data);
      }
      // Only call onSuccess if no onCompleted was provided to avoid duplicate callbacks
      else if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: error => {
      // Use centralized error handling
      errorHandlers.api(error, {
        component: 'useMutation',
        action: 'Execute GraphQL mutation',
        ...context,
      });

      // Call original onError if provided (this handles the component's toast logic)
      if (options.onError) {
        options.onError(error);
      }
      // Only call onError if no original onError was provided to avoid duplicate callbacks
      else if (onError) {
        onError(error);
      }
    },
  };

  // Execute the mutation
  const [mutate, mutationResult] = apolloUseMutation<TData, TVariables>(mutation, optimizedOptions);

  // Create optimized mutation function
  const optimizedMutate = useCallback(
    async (options?: MutationFunctionOptions<TData, TVariables>): Promise<TData | undefined> => {
      mutationStartTime.current = Date.now();
      lastMutationVariables.current = options?.variables;

      const result = await mutate(options);
      return result.data || undefined;
    },
    [mutate]
  );

  // Create async mutation function
  const _mutateAsync = useCallback(
    async (options?: MutationFunctionOptions<TData, TVariables>): Promise<TData> => {
      const result = await optimizedMutate(options);
      if (!result) {
        throw new Error('Mutation failed - no data returned');
      }
      return result;
    },
    [optimizedMutate]
  );

  // Create reset function
  const _reset = useCallback(() => {
    mutationTime.current = 0;
    isSlowMutation.current = false;
  }, []);

  // Optimized execution with optimistic updates
  const _executeWithOptimisticUpdate = useCallback(
    async (options: { variables: TVariables; [key: string]: unknown }, optimisticData: unknown) => {
      try {
        mutationStartTime.current = Date.now();

        const result = await mutate({
          ...options,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          optimisticResponse: optimisticData as any,
          update: (cache, { data }) => {
            // Custom cache update logic can be added here
            if (data) {
              // Handle optimistic updates
              console.log('Optimistic update applied:', data);
            }
          },
        });

        return result;
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useMutation',
          action: 'Execute mutation with optimistic update',
          ...context,
        });
        return null;
      }
    },
    [mutate, context]
  );

  // Batch execution for multiple mutations
  const _executeBatch = useCallback(
    async (optionsList: { variables: TVariables; [key: string]: unknown }[]) => {
      try {
        mutationStartTime.current = Date.now();

        const results = await Promise.all(optionsList.map(options => mutate(options)));

        return results;
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useMutation',
          action: 'Execute batch mutations',
          ...context,
        });
        return [];
      }
    },
    [mutate, context]
  );

  // Return array format like Apollo's useMutation
  return [
    optimizedMutate,
    {
      ...mutationResult,
      data: mutationResult.data || undefined,
      mutate: optimizedMutate,
      mutateAsync: _mutateAsync,
      reset: _reset,
      client: mutationResult?.client || null,
    },
  ];
}

/**
 * Hook for mutations that need optimistic updates
 */
export function useOptimisticMutation<TData = unknown, TVariables = Record<string, unknown>>(
  mutation: DocumentNode,
  options: IMutationOptions<TData, TVariables> = {}
) {
  const {
    enableOptimisticUpdates: _enableOptimisticUpdates,
    context: _context,
    onSuccess: _onSuccess,
    onError: _onError,
    ...apolloOptions
  } = options;
  return apolloUseMutation(mutation, {
    ...apolloOptions,
    refetchQueries: undefined, // Don't refetch for optimistic updates
  });
}

/**
 * Hook for mutations that should refetch queries
 */
export function useRefetchMutation<TData = unknown, TVariables = Record<string, unknown>>(
  mutation: DocumentNode,
  options: IMutationOptions<TData, TVariables> = {}
) {
  const {
    enableOptimisticUpdates: _enableOptimisticUpdates,
    context: _context,
    onSuccess: _onSuccess,
    onError: _onError,
    ...apolloOptions
  } = options;
  return apolloUseMutation(mutation, {
    ...apolloOptions,
    refetchQueries: 'active',
    awaitRefetchQueries: true,
  });
}

/**
 * Hook for mutations that should be executed in background
 */
export function useBackgroundMutation<TData = unknown, TVariables = Record<string, unknown>>(
  mutation: DocumentNode,
  options: IMutationOptions<TData, TVariables> = {}
) {
  const {
    enableOptimisticUpdates: _enableOptimisticUpdates,
    context: _context,
    onSuccess: _onSuccess,
    onError: _onError,
    ...apolloOptions
  } = options;
  return apolloUseMutation(mutation, {
    ...apolloOptions,
    refetchQueries: undefined,
    awaitRefetchQueries: false,
  });
}
