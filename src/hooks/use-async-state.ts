import { useCallback, useState } from 'react';

import { logError, logInfo } from '@/lib/utils/logger';
import type {
  IAsyncState,
  IUseAsyncStateReturn,
  IPaginatedState,
  IUsePaginatedStateReturn,
} from '@/types';

/**
 * Reusable hook for managing async operations with loading, error, and data states
 */
export function useAsyncState<T>(initialData: T | null = null): IUseAsyncStateReturn<T> {
  const [state, setState] = useState<IAsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const setData = useCallback((data: T | null) => {
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
    data: state.data,
    loading: state.loading,
    error: state.error,
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
    hasMore: false,
    totalCount: 0,
  });

  const setData = useCallback((data: T[], totalCount?: number) => {
    setState(prev => ({
      ...prev,
      data,
      loading: false,
      error: null,
      totalCount: totalCount ?? prev.totalCount,
    }));
  }, []);

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
      hasMore: false,
      totalCount: 0,
    });
  }, []);

  const _appendData = useCallback((newData: T[]) => {
    setState(prev => ({
      ...prev,
      data: [...(prev.data ?? []), ...newData],
      loading: false,
      error: null,
    }));
  }, []);

  const execute = useCallback(
    async (
      asyncFn: () => Promise<{
        data: T[];
        totalCount: number;
      }>
    ): Promise<T[] | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        setData(result.data, result.totalCount);
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
    loadMore: () => {
      // Load more functionality not implemented yet
    },
    refresh: () => {
      // Refresh functionality not implemented yet
    },
    setData,
    setLoading,
    setError,
    reset,
    execute,
  };
}
