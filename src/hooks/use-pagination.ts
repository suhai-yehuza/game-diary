import { useState, useCallback, useMemo } from 'react';

import type { IPaginationHookOptions, IPaginationFetchResult } from '@src/lib/types';

export function usePagination<T>({
  pageSize,
  fetchMore,
  data,
  hasNextPage = false,
  filters,
}: IPaginationHookOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pageData, setPageData] = useState<{ [key: number]: T[] }>({});
  const [cursors, setCursors] = useState<{ [key: number]: string | null }>({ 1: null });

  // Current page items - use cached data if available, otherwise fall back to query data
  const items = useMemo(
    () =>
      pageData[currentPage] || (currentPage === 1 ? data?.edges?.map(edge => edge.node) : []) || [],
    [pageData, currentPage, data]
  );

  const hasPreviousPage = currentPage > 1;

  // Pre-fetch next page data
  const prefetchNextPage = useCallback(async () => {
    const nextPage = currentPage + 1;
    const nextCursor = cursors[nextPage];

    if (!pageData[nextPage] && nextCursor && hasNextPage) {
      try {
        await fetchMore({
          variables: {
            first: pageSize,
            after: nextCursor,
            filters,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            const result = fetchMoreResult as IPaginationFetchResult;
            if (result?.games?.edges || result?.gameLogs?.edges) {
              const edges = result.games?.edges || result.gameLogs?.edges;
              const items = edges?.map((edge: { node: unknown }) => edge.node as T) || [];
              setPageData(prevData => ({ ...prevData, [nextPage]: items }));

              const pageInfo = result.games?.pageInfo || result.gameLogs?.pageInfo;
              if (pageInfo?.endCursor) {
                setCursors(prevCursors => ({
                  ...prevCursors,
                  [nextPage + 1]: pageInfo.endCursor || null,
                }));
              }
            }
            return prev; // Don't update the main query
          },
        });
      } catch (error) {
        console.error('Error prefetching next page:', error);
      }
    }
  }, [currentPage, cursors, pageData, hasNextPage, fetchMore, pageSize, filters]);

  const handlePageChange = useCallback(
    async (page: number) => {
      if (isNavigating) return;

      const isNextPage = page > currentPage;

      // If we already have the data cached, switch immediately
      if (pageData[page]) {
        setCurrentPage(page);
        return;
      }

      setIsNavigating(true);

      try {
        if (isNextPage && hasNextPage) {
          const cursor = cursors[page];
          if (cursor) {
            await fetchMore({
              variables: {
                first: pageSize,
                after: cursor,
                filters,
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                const result = fetchMoreResult as IPaginationFetchResult;
                if (result?.games?.edges || result?.gameLogs?.edges) {
                  const edges = result.games?.edges || result.gameLogs?.edges;
                  const items = edges?.map((edge: { node: unknown }) => edge.node as T) || [];
                  setPageData(prevData => ({ ...prevData, [page]: items }));

                  const pageInfo = result.games?.pageInfo || result.gameLogs?.pageInfo;
                  if (pageInfo?.endCursor) {
                    setCursors(prevCursors => ({
                      ...prevCursors,
                      [page + 1]: pageInfo.endCursor || null,
                    }));
                  }
                }
                return prev;
              },
            });
          }
        } else if (!isNextPage && page === currentPage - 1) {
          // For previous page, calculate cursor and fetch
          const targetOffset = (page - 1) * pageSize;
          const targetCursor = targetOffset > 0 ? btoa(targetOffset.toString()) : null;

          await fetchMore({
            variables: {
              first: pageSize,
              after: targetCursor,
              filters,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              const result = fetchMoreResult as IPaginationFetchResult;
              if (result?.games?.edges || result?.gameLogs?.edges) {
                const edges = result.games?.edges || result.gameLogs?.edges;
                const items = edges?.map((edge: { node: unknown }) => edge.node as T) || [];
                setPageData(prevData => ({ ...prevData, [page]: items }));
              }
              return prev;
            },
          });
        }

        setCurrentPage(page);
      } catch (error) {
        console.error('Error navigating pages:', error);
      } finally {
        setIsNavigating(false);
      }
    },
    [currentPage, pageData, cursors, hasNextPage, fetchMore, pageSize, filters, isNavigating]
  );

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setPageData({});
    setCursors({ 1: null });
  }, []);

  // Initialize page data when query data is available
  const initializePageData = useCallback((queryData: IPaginationFetchResult) => {
    if (queryData?.games?.edges || queryData?.gameLogs?.edges) {
      const edges = queryData.games?.edges || queryData.gameLogs?.edges;
      const items = edges?.map((edge: { node: unknown }) => edge.node as T) || [];
      setPageData(prev => ({ ...prev, 1: items }));

      const pageInfo = queryData.games?.pageInfo || queryData.gameLogs?.pageInfo;
      if (pageInfo?.endCursor) {
        setCursors(prev => ({ ...prev, 2: pageInfo.endCursor || null }));
      }
    }
  }, []);

  return {
    currentPage,
    items,
    hasNextPage,
    hasPreviousPage,
    isNavigating,
    prefetchNextPage,
    handlePageChange,
    resetPagination,
    initializePageData,
  };
}
