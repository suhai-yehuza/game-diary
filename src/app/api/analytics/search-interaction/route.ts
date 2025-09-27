import type { NextRequest } from 'next/server';

import { createCorsResponse, handleCorsOptions } from '@/lib/utils/cors';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { ISearchInteractionEvent } from '@/types';

/**
 * Handle CORS preflight requests
 */
export function OPTIONS() {
  return handleCorsOptions();
}

/**
 * POST /api/analytics/search-interaction
 * Track search interaction events for analytics
 */
export async function POST(request: NextRequest) {
  try {
    const interactionEvent = (await request.json()) as ISearchInteractionEvent;

    // Validate required fields
    if (!interactionEvent.query || typeof interactionEvent.query !== 'string') {
      return createCorsResponse({ success: false, error: 'Invalid interaction event data' }, 400);
    }

    // Log interaction event (in production, this would be sent to analytics service)
    console.log('[Analytics] Search interaction event:', {
      query: interactionEvent.query,
      resultsCount: interactionEvent.resultsCount,
      category: interactionEvent.category,
      filters: interactionEvent.filters,
      timestamp: new Date(interactionEvent.timestamp).toISOString(),
    });

    // In a real application, you would:
    // 1. Send to analytics service (Google Analytics, Mixpanel, etc.)
    // 2. Store in database for user behavior analysis
    // 3. Update UI recommendations based on interaction patterns

    return createCorsResponse({
      success: true,
      message: 'Search interaction event tracked successfully',
    });
  } catch (error) {
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Search Interaction Analytics API',
      action: 'Track search interaction event',
    });

    return createCorsResponse(
      {
        success: false,
        error: 'Failed to track search interaction event',
      },
      500
    );
  }
}
