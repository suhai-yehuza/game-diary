import { NextResponse } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';

/**
 * Wrapper for API route handlers to ensure consistent error handling
 */
export function withApiErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'API',
        action: 'API Route Handler',
      });

      // Always return JSON response
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status = 400,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString(),
      ...details,
    },
    { status }
  );
}

/**
 * Create a standardized validation error response
 */
export function createValidationErrorResponse(errors: string[], field?: string) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      validationErrors: errors,
      field,
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
}
