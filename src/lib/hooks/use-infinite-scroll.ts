import { useEffect, useRef, useState, useCallback } from 'react';
import { DocumentNode, useQuery } from '@apollo/client';

interface UseInfiniteScrollOptions {
  query: DocumentNode;
  variables?: Record<string, any>;
  dataPath: string; // e.g., 'comments' or 'gameLogs'
  pageSize?: number;
}

export function useInfiniteScroll({
  query,
  variables = {},
  dataPath,
  pageSize = 10,
}: UseInfiniteScrollOptions) {
  const { data, loading, error, refetch, fetchMore } = useQuery(query, {
    variables: {
      ...variables,
      first: pageSize,
    },
  });

  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    const connectionData = data?.[dataPath];
    if (!connectionData?.pageInfo?.hasNextPage || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      await fetchMore({
        variables: {
          ...variables,
          first: pageSize,
          after: connectionData.pageInfo.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          const prevData = prev[dataPath];
          const newData = fetchMoreResult[dataPath];

          // Create a Set of existing IDs for efficient lookup
          const existingIds = new Set(
            prevData.edges.map((edge: any) => edge.node.id)
          );

          // Filter out any duplicate items from the new results
          const newEdges = newData.edges.filter(
            (edge: any) => !existingIds.has(edge.node.id)
          );

          return {
            ...prev,
            [dataPath]: {
              ...newData,
              edges: [...prevData.edges, ...newEdges],
            },
          };
        },
      });
    } catch (error) {
      console.error(`Error loading more ${dataPath}:`, error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [data, dataPath, fetchMore, isFetchingMore, pageSize, variables]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [target] = entries;
        if (target.isIntersecting && !loading && !isFetchingMore) {
          loadMore();
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: '100px' // Start loading 100px before the element is visible
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loading, isFetchingMore, loadMore]);

  return {
    data,
    loading,
    error,
    refetch,
    isFetchingMore,
    loadMoreRef,
    hasNextPage: data?.[dataPath]?.pageInfo?.hasNextPage || false,
  };
} 