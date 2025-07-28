import { useCallback, useState } from 'react';

import { API_CONFIG } from '@/lib/config/app.config';
import type { IPaginationOptions } from '@/lib/types/ui.types';
import type { IPageInfo } from '@src/lib/types';

export function usePagination({ query, variables, onDataReceived, onError }: IPaginationOptions) {
  const [pageInfo, setPageInfo] = useState<IPageInfo>({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = useCallback(
    async (opts: { after?: string | null; page?: number } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            variables: {
              ...variables,
              first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
              after: opts.after ?? null,
            },
          }),
        });
        const json = (await res.json()) as unknown as {
          errors?: { message: string }[];
          data?: unknown;
        };
        if (json.errors && json.errors.length > 0) throw new Error(json.errors[0].message);

        onDataReceived(json.data);
        onError('');
      } catch (err: unknown) {
        let message = 'Failed to fetch data';
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }
        setError(message);
        onError(message);
      } finally {
        setLoading(false);
      }
    },
    [query, variables, onDataReceived, onError]
  );

  const handleNext = () => {
    setAfter(pageInfo.endCursor);
    setCurrentPage(prev => prev + 1);
    void fetchData({ after: pageInfo.endCursor });
  };

  const handlePrev = () => {
    setAfter(null);
    setCurrentPage(1);
    void fetchData({ after: null });
  };

  const handleFirst = () => {
    setAfter(null);
    setCurrentPage(1);
    void fetchData({ after: null });
  };

  const handleLast = () => {
    const totalPages = Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE);
    setCurrentPage(totalPages);
    setLoading(true);
    setError(null);

    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: {
          ...variables,
          first: totalCount,
          after: null,
        },
      }),
    })
      .then(res => res.json())
      .then((json: { errors?: { message: string }[]; data?: unknown }) => {
        if (json.errors && json.errors.length > 0) throw new Error(json.errors[0].message);
        onDataReceived(json.data);
        onError('');
      })
      .catch((err: unknown) => {
        let message = 'Failed to fetch last page';
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }
        setError(message);
        onError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    pageInfo,
    setPageInfo,
    loading,
    error,
    after,
    setAfter,
    currentPage,
    setCurrentPage,
    totalCount,
    setTotalCount,
    fetchData,
    handleNext,
    handlePrev,
    handleFirst,
    handleLast,
  };
}
