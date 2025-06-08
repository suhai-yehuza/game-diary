import type { Request, Response, NextFunction } from 'express';
import type { NextApiRequest, NextApiResponse } from 'next';

import { apiLogger } from 'lib/core/logger';
import { monitoring } from '@src/lib/monitoring';
import type { ExtendedNextApiRequest } from '@src/lib/types/consolidated.types';
import { responseUtils } from '@src/lib/utils/response';
import { rateLimiters } from '@src/lib/config/rate-limit.config';

// Field selection middleware
export const fieldSelectionMiddleware = (
  req: ExtendedNextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const selectedFields = req.query.selectedFields as string[] | undefined;
  if (selectedFields) {
    req.selectedFields = selectedFields;
  }
  next();
};

// Cursor-based pagination middleware
export const cursorPaginationMiddleware = (
  req: ExtendedNextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const { first, after, last, before } = req.query;
  if (first || after || last || before) {
    req.pagination = {
      first: first ? parseInt(first as string, 10) : undefined,
      after: after as string,
      last: last ? parseInt(last as string, 10) : undefined,
      before: before as string,
    };
  }
  next();
};

// API monitoring middleware
export const apiMonitoringMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    monitoring.trackApiCall(req.url as string, req.method as string, res.statusCode, duration);
  });
  next();
};

// Response optimization middleware
export const optimizeResponseMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const originalJson = res.json;
  res.json = function (body: unknown) {
    const optimizedBody = responseUtils.optimizeResponse(res, body);
    return originalJson.call(this, optimizedBody);
  };
  next();
};

// Response compression middleware
export const compressionMiddleware = (_req: Request, res: Response, _next: NextFunction) => {
  const originalJson = res.json;
  res.json = function (data: unknown) {
    const optimizedData = responseUtils.optimizeResponse(res as unknown as NextApiResponse, data);
    return originalJson.call(this, optimizedData);
  };
};

// Error handling middleware
export const errorHandlerMiddleware = (
  error: Error,
  req: ExtendedNextApiRequest,
  res: NextApiResponse,
  _next: () => void
) => {
  monitoring.trackError(error);
  apiLogger.error('API Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
};

// Export all middleware
export const middleware = {
  fieldSelection: fieldSelectionMiddleware,
  cursorPagination: cursorPaginationMiddleware,
  apiMonitoring: apiMonitoringMiddleware,
  optimizeResponse: optimizeResponseMiddleware,
  compression: compressionMiddleware,
  rateLimit: rateLimiters.api,
  errorHandler: errorHandlerMiddleware,
};
