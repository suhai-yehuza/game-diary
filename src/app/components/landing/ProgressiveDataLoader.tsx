'use client';

import { useEffect, useState } from 'react';

import { logger } from '@/lib/utils/logger';

interface IProgressiveDataLoaderProps<T> {
  dataKey: keyof {
    trendingContent: unknown;
    recentGames: unknown;
    popularGames: unknown;
    contentPreview: unknown;
    popularTeams: unknown;
    popularPlayers: unknown;
    activeFans: unknown;
  };
  endpoint?: string;
  fallback: React.ReactNode;
  children?: (data: T) => React.ReactNode;
  render?: (data: T) => React.ReactNode;
}

// Cache for storing loaded data to avoid re-fetching
const dataCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function ProgressiveDataLoader<T>({
  dataKey,
  endpoint,
  fallback,
  children,
  render,
}: IProgressiveDataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check cache first
        const cached = dataCache.get(dataKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          logger.info(`Using cached data for ${dataKey}`);
          setData(cached.data as T);
          setLoading(false);
          return;
        }

        logger.info(`Loading ${dataKey} data progressively...`);

        // Fetch data from API
        const apiEndpoint = endpoint || `/api/landing-page/data/${dataKey}`;
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${dataKey}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          // Cache the data
          dataCache.set(dataKey, { data: result.data, timestamp: Date.now() });
          setData(result.data);
          logger.info(`Successfully loaded ${dataKey} data`);
        } else {
          throw new Error(result.error || `No data returned for ${dataKey}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error(`Failed to load ${dataKey} data:`, { error: errorMessage });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [dataKey, endpoint]);

  if (loading) {
    return <>{fallback}</>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-500 dark:text-red-400 mb-2">Failed to load {dataKey}</div>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            // Clear cache and retry
            dataCache.delete(dataKey);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-4 text-gray-500">No {dataKey} data available</div>;
  }

  const renderFunction = render || children;
  if (!renderFunction) {
    throw new Error('ProgressiveDataLoader requires either children or render prop');
  }

  return <>{renderFunction(data)}</>;
}
