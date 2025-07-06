import { useCallback, useRef } from 'react';

import type { ICacheEntry, IApiCacheOptions } from '@/lib/types/hooks.types';

// In-memory cache for API responses using plain objects instead of Maps
const apiCache: Record<string, ICacheEntry> = {};
const pendingRequests: Record<string, Promise<unknown>> = {};

export function useApiCache(options: IApiCacheOptions = {}) {
  const { ttl = 300000, enableDeduplication = true } = options;
  const cacheRef = useRef(apiCache);
  const pendingRef = useRef(pendingRequests);

  const generateCacheKey = useCallback((url: string, params?: Record<string, string>): string => {
    const urlObj = new URL(url);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.append(key, value);
      });
    }
    return urlObj.toString();
  }, []);

  const isExpired = useCallback((entry: ICacheEntry): boolean => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const getCachedData = useCallback(
    <T>(key: string): T | null => {
      const entry = cacheRef.current[key];
      if (!entry || isExpired(entry)) {
        if (entry) {
          delete cacheRef.current[key];
        }
        return null;
      }
      return entry.data as T;
    },
    [isExpired]
  );

  const setCachedData = useCallback(
    (key: string, data: unknown): void => {
      const entry: ICacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      cacheRef.current[key] = entry;
    },
    [ttl]
  );

  const getPendingRequest = useCallback((key: string): Promise<unknown> | undefined => {
    return pendingRef.current[key];
  }, []);

  const fetchWithCache = useCallback(
    async <T>(
      url: string,
      params?: Record<string, string>,
      fetchOptions?: RequestInit
    ): Promise<T> => {
      const cacheKey = generateCacheKey(url, params);

      // Check cache first
      const cachedData = getCachedData<T>(cacheKey);
      if (cachedData !== null) {
        return cachedData;
      }

      // Check for pending request (deduplication)
      if (enableDeduplication && cacheKey in pendingRef.current) {
        const pendingRequest = getPendingRequest(cacheKey);
        if (pendingRequest) {
          return pendingRequest as Promise<T>;
        }
      }

      // Make the request
      const requestPromise = (async () => {
        try {
          const urlObj = new URL(url);
          if (params) {
            Object.entries(params).forEach(([key, value]) => {
              urlObj.searchParams.append(key, value);
            });
          }

          const response = await fetch(urlObj.toString(), fetchOptions);
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();

          // Cache the response
          setCachedData(cacheKey, data);

          return data as T;
        } finally {
          // Remove from pending requests
          delete pendingRef.current[cacheKey];
        }
      })();

      // Store pending request for deduplication
      if (enableDeduplication) {
        pendingRef.current[cacheKey] = requestPromise;
      }

      return requestPromise;
    },
    [generateCacheKey, getCachedData, setCachedData, enableDeduplication, getPendingRequest]
  );

  const clearCache = useCallback((pattern?: string): void => {
    if (pattern) {
      // Clear cache entries matching pattern
      Object.keys(cacheRef.current).forEach(key => {
        if (key.includes(pattern)) {
          delete cacheRef.current[key];
        }
      });
    } else {
      // Clear all cache
      Object.keys(cacheRef.current).forEach(key => {
        delete cacheRef.current[key];
      });
    }
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      size: Object.keys(cacheRef.current).length,
      pendingRequests: Object.keys(pendingRef.current).length,
    };
  }, []);

  return {
    fetchWithCache,
    getCachedData,
    setCachedData,
    clearCache,
    getCacheStats,
  };
}
