import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';

import { handleUserCreated, handleUserUpdated, handleUserDeleted } from '@/app/api/webhooks/clerk';
import { db } from '@/lib/db';
import type { IClerkDeletedUserData, IClerkUserData } from '@/lib/types';
import { webhookLogger } from '@lib/core/logger';

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
    webhookLogger.error('Webhook error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode =
      error instanceof Error && error.message.includes('Missing user ID') ? 400 : 500;

    return createResponse(errorMessage, statusCode);
  }
}
