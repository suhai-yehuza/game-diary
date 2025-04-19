import { NextApiResponse } from 'next';

import { APIError } from '@/lib/errors/api.error';

// Field selection utility
export function selectFields<T extends object>(obj: T, fields: (keyof T)[]): Partial<T> {
  return fields.reduce((acc, field) => {
    if (field in obj) {
      acc[field] = obj[field];
    }
    return acc;
  }, {} as Partial<T>);
}

// Response optimization utility
export const optimizeResponse = (res: NextApiResponse, data: unknown) => {
  // Add cache control headers
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache

  // Add compression headers
  res.setHeader('Content-Encoding', 'gzip');

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Add performance headers
  res.setHeader('Keep-Alive', 'timeout=5, max=1000');
  res.setHeader('Connection', 'keep-alive');

  return res.json(data);
};

// Error response utilities
export function errorResponse(error: APIError) {
  return {
    success: false,
    error: {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
    },
  };
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(new APIError('NOT_FOUND', 404, message));
}

export function validationErrorResponse(details: Record<string, string[]>) {
  return errorResponse(new APIError('Validation failed', 400, JSON.stringify(details)));
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(new APIError('UNAUTHORIZED', 401, message));
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(new APIError('FORBIDDEN', 403, message));
}

export function serverErrorResponse(message = 'Internal server error') {
  return errorResponse(new APIError('SERVER_ERROR', 500, message));
}

// Response helper for Next.js API routes
export function apiResponse<T>(res: NextApiResponse, data: T, status = 200) {
  return res.status(status).json(data);
}

// Success response utility
export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}

// Pagination utility
export const paginateResponse = <T>(
  res: NextApiResponse,
  data: T[],
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return optimizeResponse(res, {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  });
};

// Export utilities
export const responseUtils = {
  selectFields,
  optimizeResponse,
  apiErrorResponse: errorResponse,
  apiSuccessResponse: successResponse,
  paginateResponse,
};
