import { useState, useEffect, useCallback } from 'react';

import type { ILandingPageData, IUseLandingPageDataReturn } from '@/types';

export function useLandingPageData(): IUseLandingPageDataReturn {
  const [data, setData] = useState<ILandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_lastUpdated, _setLastUpdated] = useState<string | null>(null);
  const [_source, _setSource] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/landing-page/data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      _setLastUpdated(result.timestamp);
      _setSource(result.source);

      // Log performance metrics
      if (result.source === 'cache') {
        console.log('⚡ Landing page data loaded from cache');
      } else {
        console.log('🐌 Landing page data loaded from database');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch landing page data';
      setError(errorMessage);
      console.error('Error fetching landing page data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    console.log('🔄 Manual refresh requested for landing page data');
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: refresh,
  };
}
