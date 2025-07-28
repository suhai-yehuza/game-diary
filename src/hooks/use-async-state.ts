import { useCallback, useState } from 'react';

import type {
  IAsyncState,
  IUseAsyncStateReturn,
  IPaginatedState,
  IUsePaginatedStateReturn,
} from '@/lib/types';
import { logError, logInfo } from '@/lib/utils/logger';

/**
 * Reusable hook for managing async operations with loading, error, and data states
 */
export function useAsyncState<T>(initialData: T | null = null): IUseAsyncStateReturn<T> {
  const [state, setState] = useState<IAsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, loading: false, error: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const execute = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        setData(result);
        logInfo('Async operation completed successfully', { data: result });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        logError('Async operation failed', err instanceof Error ? err : new Error(errorMessage));
        return undefined;
      }
    },
    [setData, setError, setLoading]
  );

  return {
    state,
    setData,
    setLoading,
    setError,
    reset,
    execute,
  };
}

/**
 * Hook for managing paginated data with async state
 */

export function usePaginatedState<T>(): IUsePaginatedStateReturn<T> {
  const [state, setState] = useState<IPaginatedState<T>>({
    data: [],
    loading: false,
    error: null,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: 0,
  });

  const setData = useCallback(
    (data: T[], pageInfo?: IPaginatedState<T>['pageInfo'], totalCount?: number) => {
      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        pageInfo: pageInfo ?? prev.pageInfo,
        totalCount: totalCount ?? prev.totalCount,
      }));
    },
    []
  );

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    });
  }, []);

  const appendData = useCallback((newData: T[], pageInfo?: IPaginatedState<T>['pageInfo']) => {
    setState(prev => ({
      ...prev,
      data: [...(prev.data ?? []), ...newData],
      pageInfo: pageInfo ?? prev.pageInfo,
      loading: false,
      error: null,
    }));
  }, []);

  const execute = useCallback(
    async (
      asyncFn: () => Promise<{
        data: T[];
        pageInfo: IPaginatedState<T>['pageInfo'];
        totalCount: number;
      }>
    ): Promise<T[] | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        setData(result.data, result.pageInfo, result.totalCount);
        logInfo('Paginated async operation completed successfully', {
          dataCount: result.data.length,
          totalCount: result.totalCount,
        });
        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        logError(
          'Paginated async operation failed',
          err instanceof Error ? err : new Error(errorMessage)
        );
        return undefined;
      }
    },
    [setData, setError, setLoading]
  );

  return {
    state,
    setData,
    setLoading,
    setError,
    reset,
    appendData,
    execute,
  };
}
