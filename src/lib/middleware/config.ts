import { NextApiHandler } from 'next';

import { ExtendedNextApiRequest } from '@/lib/types/consolidated.types';

import { middleware } from './optimization';

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Apply middleware in the correct order
export const withMiddleware = (handler: NextApiHandler): NextApiHandler => {
  return async (req, res) => {
    try {
      // Apply middleware in sequence
      await new Promise<void>(resolve =>
        middleware.fieldSelection(req as unknown as ExtendedNextApiRequest, res, resolve)
      );
      await new Promise<void>(resolve =>
        middleware.cursorPagination(req as unknown as ExtendedNextApiRequest, res, resolve)
      );
      await new Promise<void>(resolve => middleware.apiMonitoring(req, res, resolve));
      await new Promise<void>(resolve => middleware.optimizeResponse(req, res, resolve));

      // Apply rate limiting
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      if (ip) {
        const now = Date.now();
        const windowMs = 15 * 60 * 1000; // 15 minutes
        const maxRequests = 100;

        const ipStr = ip.toString();
        const current = rateLimit.get(ipStr);

        if (current) {
          if (now > current.resetTime) {
            // Reset if window has passed
            rateLimit.set(ipStr, { count: 1, resetTime: now + windowMs });
          } else if (current.count >= maxRequests) {
            // Rate limit exceeded
            return res.status(429).json({
              error: 'Too many requests',
              resetTime: new Date(current.resetTime).toISOString(),
            });
          } else {
            // Increment count
            current.count++;
          }
        } else {
          // First request from this IP
          rateLimit.set(ipStr, { count: 1, resetTime: now + windowMs });
        }
      }

      // Call the original handler
      return handler(req, res);
    } catch (error) {
      // Handle errors using our error handler
      return middleware.errorHandler(
        error as Error,
        req as unknown as ExtendedNextApiRequest,
        res,
        () => {}
      );
    }
  };
};

// Export middleware configuration
export const middlewareConfig = {
  withMiddleware,
};
