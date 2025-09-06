import type { QueryHookOptions, QueryResult, OperationVariables } from '@apollo/client';
import { useQuery } from '@apollo/client';
import type { DocumentNode } from 'graphql';

// Use Apollo Client's native types directly
export function useOptimizedQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode,
  options: QueryHookOptions<TData, TVariables> = {}
): QueryResult<TData, TVariables> {
  // Use Apollo Client's native useQuery directly
  return useQuery<TData, TVariables>(query, options);
}
