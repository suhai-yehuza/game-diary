'use client';

import { useEffect } from 'react';

import { cacheWarmingService } from '@/lib/services/cache-warming.service';

/**
 * Component that initializes the background cache warming service
 * This ensures caches stay warm throughout the application lifecycle
 */
export function CacheWarmingInitializer() {
  useEffect(() => {
    // Only start cache warming in production or when explicitly enabled
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_CACHE_WARMING === 'true'
    ) {
      console.log('🔥 Starting background cache warming service...');

      try {
        cacheWarmingService.start();

        // Log service status
        const status = cacheWarmingService.getStatus();
        console.log('✅ Cache warming service started:', status);

        // Cleanup on unmount
        return () => {
          console.log('🛑 Stopping background cache warming service...');
          cacheWarmingService.stop();
        };
      } catch (error) {
        console.error('❌ Failed to start cache warming service:', error);
      }
    } else {
      console.log('⏭️ Cache warming service disabled in development mode');
    }
  }, []);

  // This component doesn't render anything
  return null;
}
