import type { NextRequest } from 'next/server';

import { createCorsResponse, handleCorsOptions } from '@/lib/utils/cors';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { ISearchEvent } from '@/types';

/**
 * Handle CORS preflight requests
 */
export function OPTIONS() {
  return handleCorsOptions();
}

/**
 * POST /api/analytics/search
 * Track search events for analytics
 */
export async function POST(request: NextRequest) {
  try {
    const searchEvent = (await request.json()) as ISearchEvent;

    // Validate required fields
    if (!searchEvent.query || typeof searchEvent.query !== 'string') {
      return createCorsResponse({ success: false, error: 'Invalid search event data' }, 400);
    }

    // Log search event (in production, this would be sent to analytics service)
    console.log('[Analytics] Search event:', {
      query: searchEvent.query,
      resultsCount: searchEvent.resultsCount,
      searchTime: searchEvent.searchTime,
      category: searchEvent.category,
      timestamp: new Date(searchEvent.timestamp).toISOString(),
    });

    // In a real application, you would:
    // 1. Send to analytics service (Google Analytics, Mixpanel, etc.)
    // 2. Store in database for analysis
    // 3. Update search suggestions based on popular queries

    return createCorsResponse({
      success: true,
      message: 'Search event tracked successfully',
    });
  } catch (error) {
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Search Analytics API',
      action: 'Track search event',
    });

    return createCorsResponse(
      {
        success: false,
        error: 'Failed to track search event',
      },
      500
    );
  }
}
