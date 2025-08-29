import { NextResponse } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';

/**
 * Global error handler for API routes
 * Ensures all errors return JSON responses instead of HTML
 */
export function withGlobalErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'API',
        action: 'Global Error Handler',
      });

      // Always return JSON response
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Handle 404 errors for API routes
 */
export function handleApiNotFound() {
  return NextResponse.json(
    {
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
}

/**
 * Handle method not allowed errors for API routes
 */
export function handleMethodNotAllowed() {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'The HTTP method is not supported for this endpoint',
      timestamp: new Date().toISOString(),
    },
    { status: 405 }
  );
}
