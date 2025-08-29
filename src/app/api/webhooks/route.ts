import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';

import { handleUserCreated, handleUserUpdated, handleUserDeleted } from '@/app/api/webhooks/clerk';
import { db } from '@/lib/db';
import type { IClerkDeletedUserData, IClerkUserData } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';
import { webhookLogger } from '@/lib/utils/logger';

// NOTE:
// - This route must receive the raw request body for signature verification to work.
// - The app middleware explicitly bypasses auth/processing for paths under `/api/webhooks*`.
//   See `src/middleware.ts` for the early return that preserves the raw body and prevents timeouts.
// Helper functions
const createResponse = (message: string, status: number) => new Response(message, { status });

// Main webhook handler
export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;

    webhookLogger.info(`Webhook received: ${eventType} for user ${evt.data.id}`);

    // Check if database is available
    if (!db) {
      webhookLogger.error('Database connection not available');
      return createResponse('Database connection not available', 500);
    }

    switch (eventType) {
      case 'user.created':
        return await handleUserCreated(evt.data as unknown as IClerkUserData);
      case 'user.updated':
        return await handleUserUpdated(evt.data as unknown as IClerkUserData);
      case 'user.deleted':
        return await handleUserDeleted(evt.data as IClerkDeletedUserData);
      default:
        webhookLogger.info(`Unhandled webhook event type: ${eventType}`);
        return createResponse('Unhandled event type', 200);
    }
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'POST /api/webhooks',
    });

    const statusCode = 500;
    return createResponse('Internal server error', statusCode);
  }
}
