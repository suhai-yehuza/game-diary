import { useQuery, DocumentNode } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';

type Edge<_T extends { id: string }> = { node: _T };

interface UseInfiniteScrollOptions<_T extends { id: string }> {
  query: DocumentNode;
  variables?: Record<string, unknown>;
  dataPath: string;
  pageSize?: number;
}

export function useInfiniteScroll<_T extends { id: string }>({
  query,
  variables = {},
  dataPath,
  pageSize = 10,
}: UseInfiniteScrollOptions<_T>) {
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
          const existingIds = new Set(prevData.edges.map((edge: Edge<_T>) => edge.node.id));

          // Filter out duplicates
          const newEdges = newData.edges.filter((edge: Edge<_T>) => !existingIds.has(edge.node.id));

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
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetchingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, isFetchingMore]);

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
