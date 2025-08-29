import { useCallback, useState } from 'react';

import type { ICacheOptions } from '@/lib/types';
import { CacheNamespace } from '@/lib/types';
import { errorHandlers, ErrorHandler } from '@/lib/utils/error-handler';

interface ICacheResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  setCache: (key: string, value: T) => Promise<void>;
  getCache: (key: string) => Promise<T | null>;
  deleteCache: (key: string) => Promise<void>;
  clearNamespace: () => Promise<void>;
}

/**
 * React hook for accessing the Redis cache service
 */
export function useCache<T = unknown>(options: ICacheOptions = {}): ICacheResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { namespace = CacheNamespace.SYSTEM, priority = 'medium' } = options;

  const setCache = useCallback(
    async (key: string, value: T): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/cache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'set',
            key,
            value,
            namespace,
            priority,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to set cache: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to set cache');
        }
      } catch (err) {
        const errorContext = errorHandlers.api(
          err instanceof Error ? err : new Error(String(err)),
          {
            component: 'Cache Hook',
            action: 'Set Cache',
          }
        );
        const errorMessage = ErrorHandler.getInstance().createUserMessage(
          err instanceof Error ? err : new Error(String(err)),
          errorContext
        );
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [namespace, priority]
  );

  const getCache = useCallback(
    async (key: string): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/cache?action=get&key=${encodeURIComponent(key)}&namespace=${namespace}`
        );

        if (!response.ok) {
          throw new Error(`Failed to get cache: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to get cache');
        }

        return result.data;
      } catch (err) {
        const errorContext = errorHandlers.api(
          err instanceof Error ? err : new Error(String(err)),
          {
            component: 'Cache Hook',
            action: 'Get Cache',
          }
        );
        const errorMessage = ErrorHandler.getInstance().createUserMessage(
          err instanceof Error ? err : new Error(String(err)),
          errorContext
        );
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [namespace]
  );

  const deleteCache = useCallback(
    async (key: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/cache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete',
            key,
            namespace,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to delete cache: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete cache');
        }
      } catch (err) {
        const errorContext = errorHandlers.api(
          err instanceof Error ? err : new Error(String(err)),
          {
            component: 'Cache Hook',
            action: 'Delete Cache',
          }
        );
        const errorMessage = ErrorHandler.getInstance().createUserMessage(
          err instanceof Error ? err : new Error(String(err)),
          errorContext
        );
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [namespace]
  );

  const clearNamespace = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clearNamespace',
          namespace,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to clear namespace: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to clear namespace');
      }
    } catch (err) {
      const errorContext = errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
        component: 'Cache Hook',
        action: 'Clear Namespace',
      });
      const errorMessage = ErrorHandler.getInstance().createUserMessage(
        err instanceof Error ? err : new Error(String(err)),
        errorContext
      );
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [namespace]);

  return {
    data: null, // This hook doesn't maintain local state, use getCache for data retrieval
    loading,
    error,
    setCache,
    getCache,
    deleteCache,
    clearNamespace,
  };
}

/**
 * Hook for getting cache statistics
 */
export function useCacheStats() {
  const [stats, setStats] = useState<{
    memorySize: number;
    redisAvailable: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cache?action=stats');
      if (!response.ok) {
        throw new Error(`Failed to fetch cache stats: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch cache stats');
      }

      setStats(result.data);
    } catch (err) {
      const errorContext = errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
        component: 'Cache Stats Hook',
        action: 'Fetch Stats',
      });
      const errorMessage = ErrorHandler.getInstance().createUserMessage(
        err instanceof Error ? err : new Error(String(err)),
        errorContext
      );
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cache?action=test');
      if (!response.ok) {
        throw new Error(`Failed to test cache connection: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to test cache connection');
      }

      return result.data.connected;
    } catch (err) {
      const errorContext = errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
        component: 'Cache Stats Hook',
        action: 'Test Connection',
      });
      const errorMessage = ErrorHandler.getInstance().createUserMessage(
        err instanceof Error ? err : new Error(String(err)),
        errorContext
      );
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
    testConnection,
  };
}
