'use client';

import { useEffect } from 'react';

import { CacheValidationUtils } from '@/lib/cache/cache-validation.utils';
import { logger } from '@/lib/utils/logger';

/**
 * Component that validates cache consistency on app startup
 * Ensures cached data matches database state to prevent stale cache issues
 */
export function CacheValidationInitializer() {
  useEffect(() => {
    // Only run cache validation in production or when explicitly enabled
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_CACHE_VALIDATION === 'true'
    ) {
      console.log('🔍 Starting cache validation on app startup...');

      const validateCaches = async () => {
        try {
          const results = await CacheValidationUtils.validateAndRefreshAllCaches();

          if (results.refreshedCaches.length > 0) {
            console.log(
              `✅ Cache validation completed - refreshed ${results.refreshedCaches.length} caches:`,
              results.refreshedCaches
            );
            logger.info('Cache validation completed with refreshes', {
              refreshedCaches: results.refreshedCaches,
              results,
            });
          } else {
            console.log('✅ Cache validation completed - all caches are consistent');
            logger.info('Cache validation completed - all caches consistent', { results });
          }
        } catch (error) {
          console.error('❌ Cache validation failed:', error);
          logger.error('Cache validation failed on startup', { error: String(error) });
        }
      };

      // Run validation after a short delay to allow app to initialize
      const timeoutId = setTimeout(() => {
        void validateCaches();
      }, 2000);

      return () => clearTimeout(timeoutId);
    } else {
      console.log('⏭️ Cache validation disabled in development mode');
    }
  }, []);

  // This component doesn't render anything
  return null;
}
