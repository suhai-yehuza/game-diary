import { useQuery, DocumentNode } from '@apollo/client';
import { useEffect, useRef, useState, useCallback } from 'react';

import { API_CONFIG } from '@/lib/config/api.config';

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface PaginatedData<T> {
  edges: { node: T }[];
  pageInfo: PageInfo;
  totalCount: number;
}

interface UsePaginatedDataOptions<T> {
  query: DocumentNode;
  variables: Record<string, unknown>;
  dataKey: string;
  onDataUpdate?: (data: T[]) => void;
  getNextVariables?: (data: PaginatedData<T>) => Record<string, unknown>;
}

export function usePaginatedData<T extends { id: string }>({
  query,
  variables,
  dataKey,
  onDataUpdate,
  getNextVariables,
}: UsePaginatedDataOptions<T>) {
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { loading, error, data, fetchMore, refetch } = useQuery(query, {
    variables: {
      ...variables,
      first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
      after: undefined,
    },
    onCompleted: (response: Record<string, PaginatedData<T>>) => {
      const paginatedData = response[dataKey];
      const newData = paginatedData.edges.map(edge => edge.node);
      onDataUpdate?.(newData);
    },
  });

  const handleLoadMore = useCallback(async () => {
    if (isFetchingMore || !data?.[dataKey]?.pageInfo?.hasNextPage) return;

    setIsFetchingMore(true);
    try {
      const nextVariables = getNextVariables?.(data[dataKey] as PaginatedData<T>) || {
        ...variables,
        first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
        after: data[dataKey].pageInfo.endCursor,
      };

      const result = await fetchMore({
        variables: nextVariables,
        updateQuery: (
          prev: Record<string, PaginatedData<T>>,
          { fetchMoreResult }: { fetchMoreResult: Record<string, PaginatedData<T>> }
        ) => {
          if (!fetchMoreResult) return prev;

          const prevData = prev[dataKey];
          const newData = fetchMoreResult[dataKey];

          // Create a Set of existing IDs for efficient lookup
          const existingIds = new Set(
            prevData.edges.map((edge: any) => edge.node.id)
          );

          // Filter out any duplicate items from the new results
          const newEdges = newData.edges.filter(
            (edge: any) => !existingIds.has(edge.node.id)
          );

          // Notify about new data
          if (onDataUpdate) {
            const newNodes = newEdges.map(edge => edge.node);
            onDataUpdate(newNodes);
          }

          return {
            ...prev,
            [dataKey]: {
              ...newData,
              edges: [...prevData.edges, ...newEdges],
            },
          };
        },
      });

      if (!result.data?.[dataKey]?.edges?.length) {
        console.log('No more data to load');
      }
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [data, dataKey, fetchMore, getNextVariables, isFetchingMore, onDataUpdate, variables]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        const [target] = entries;
        if (target.isIntersecting && !loading && data?.[dataKey]?.pageInfo?.hasNextPage) {
          handleLoadMore();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Start loading 100px before the element is visible
      }
    );

    observer.observe(element);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [data, loading, dataKey, handleLoadMore]);

  return {
    data,
    loading,
    error,
    isFetchingMore,
    loadMoreRef,
    handleLoadMore,
    refetch,
  };
}
