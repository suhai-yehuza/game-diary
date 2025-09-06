import { NextResponse } from 'next/server';

import { CacheValidationUtils } from '@/lib/cache/cache-validation.utils';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/cache/validate
 * Validate cache consistency and refresh if needed
 */
export async function GET() {
  try {
    logger.info('Cache validation API called');

    const results = await CacheValidationUtils.validateAndRefreshAllCaches();

    return NextResponse.json({
      success: true,
      message: 'Cache validation completed',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cache validation API failed', { error: String(error) });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cache/validate
 * Force cache validation and refresh
 */
export async function POST() {
  try {
    logger.info('Force cache validation API called');

    // Force refresh all caches by clearing them first
    const results = await CacheValidationUtils.validateAndRefreshAllCaches();

    return NextResponse.json({
      success: true,
      message: 'Force cache validation completed',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Force cache validation API failed', { error: String(error) });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
