import { NextResponse } from 'next/server';

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
  const response = NextResponse.json(
    { error: message },
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
  if (error instanceof Error) {
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
  }
  return createErrorResponse('Internal Server Error');
}
