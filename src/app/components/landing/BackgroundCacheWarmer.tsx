'use client';

import { useEffect } from 'react';

import { logger } from '@/lib/utils/logger';

/**
 * Component that warms caches in the background after the page loads
 * This ensures optimal performance without blocking the initial page render
 */
export function BackgroundCacheWarmer() {
  useEffect(() => {
    // Wait for the page to be fully loaded before starting cache warming
    const warmCachesInBackground = async () => {
      try {
        logger.info('🔥 Starting background cache warming for landing page...');

        // Warm all landing page caches in parallel
        const cachePromises = [
          fetch('/api/landing-page/data/trendingContent').catch(err =>
            logger.warn('Failed to warm trending content cache:', err)
          ),
          fetch('/api/landing-page/data/recentGames').catch(err =>
            logger.warn('Failed to warm recent games cache:', err)
          ),
          fetch('/api/landing-page/data/popularGames').catch(err =>
            logger.warn('Failed to warm popular games cache:', err)
          ),
        ];

        // Wait for all cache warming to complete (or fail gracefully)
        await Promise.allSettled(cachePromises);

        logger.info('✅ Background cache warming completed');
      } catch (error) {
        logger.error('❌ Background cache warming failed:', { error: String(error) });
      }
    };

    // Start cache warming after a short delay to ensure page is fully loaded
    const timeoutId = setTimeout(() => {
      void warmCachesInBackground();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
