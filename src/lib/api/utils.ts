import { NextResponse } from 'next/server';
import { apiLogger } from 'lib/core/logger';

/**
 * Common CORS headers for API routes
 */
export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  const headers = getCorsHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Create an OPTIONS response with CORS headers
 */
export function createOptionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

/**
 * Create an error response with appropriate status and CORS headers
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  additionalHeaders?: Record<string, string>
): NextResponse {
  apiLogger.error(`API Error (${status}): ${message}`);
  const response = NextResponse.json(
    {
      error: message,
      status,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: additionalHeaders,
    }
  );
  return addCorsHeaders(response);
}

/**
 * Create a rate limit error response
 */
export function createRateLimitResponse(message: string, retryAfter: string): NextResponse {
  return createErrorResponse(message, 429, {
    'Retry-After': retryAfter,
  });
}

/**
 * Handle common API route errors
 */
export function handleApiError(error: unknown): NextResponse {
  apiLogger.error('API Error:', {
    error,
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('Rate limit exceeded')) {
      const resetTime = error.message.match(/\d+/)?.[0] || '60';
      return createRateLimitResponse(error.message, resetTime);
    }
    if (error.message.includes('Too Many Requests')) {
      return createErrorResponse(
        'Service temporarily unavailable. Please try again in a few seconds.',
        429
      );
    }
    if (error.message.includes('Database')) {
      return createErrorResponse('Database operation failed. Please try again later.', 503);
    }
    if (error.message.includes('Authentication')) {
      return createErrorResponse('Authentication failed', 401);
    }
    if (error.message.includes('Authorization')) {
      return createErrorResponse('Not authorized to perform this action', 403);
    }
  }

  // Default error response
  return createErrorResponse('Internal Server Error');
}
