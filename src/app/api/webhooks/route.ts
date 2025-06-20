import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

import { apiLogger } from '@lib/core/logger';
import { users } from '@src/lib/db/schema';
import { db } from '@src/lib/db/seed';
import type { IClerkUserData, IClerkDeletedUserData } from '@src/lib/types';

// Helper functions
const createResponse = (message: string, status: number) => new Response(message, { status });

const validateUserData = (data: IClerkUserData) => {
  if (!data.id) throw new Error('Missing user ID');
  if (!data.email_addresses) throw new Error('No email_addresses array in webhook payload');
  if (!Array.isArray(data.email_addresses) || data.email_addresses.length === 0) {
    throw new Error('email_addresses array is empty or not an array');
  }
  if (!data.email_addresses[0]?.email_address) {
    throw new Error('First email address object is missing email_address property');
  }
};

const handleUserCreated = async (data: IClerkUserData) => {
  apiLogger.info('Processing user.created webhook', { userId: data.id });
  validateUserData(data);

  const {
    id,
    username,
    email_addresses = [],
    first_name,
    last_name,
    image_url,
    updated_at,
    created_at,
    last_sign_in_at,
    password_enabled,
    two_factor_enabled,
    external_id,
    external_accounts,
    profile_image_url,
    primary_email_address_id,
  } = data;

  const defaultUsername = `${first_name || 'user'}-${last_name || 'unknown'}`.toLowerCase();
  const userData = {
    id,
    username: username || defaultUsername,
    firstName: first_name || 'missing-first-name',
    lastName: last_name || 'missing-last-name',
    emailAddress: email_addresses[0]?.email_address || '',
    imageUrl: image_url || profile_image_url || '',
    inboundFriendshipIds: [],
    outboundFriendshipIds: [],
    banned: false,
    // Clerk-specific fields
    last_sign_in_at: last_sign_in_at ? new Date(last_sign_in_at) : null,
    password_enabled: password_enabled || false,
    two_factor_enabled: two_factor_enabled || false,
    email_verified: email_addresses[0]?.verification?.status === 'verified',
    email_verification_strategy: email_addresses[0]?.verification?.strategy || null,
    external_id: external_id || null,
    external_accounts: external_accounts || [],
    primary_email_address_id: primary_email_address_id || null,
    createdAt: new Date(created_at || Date.now()),
    updatedAt: new Date(updated_at || Date.now()),
    deletedAt: null,
  };

  try {
    // Set the custom setting to identify this as a Clerk webhook request
    await db.execute(sql`SELECT set_config('app.current_user', 'clerk_webhook', false)`);

    // Check if user exists (including soft-deleted)
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (existingUser) {
      // If user exists but was soft-deleted, restore them
      if (existingUser.deletedAt) {
        await db
          .update(users)
          .set({
            ...userData,
            deletedAt: null, // Clear the deletedAt timestamp
          })
          .where(eq(users.id, id));
        apiLogger.info('User restored in database', { userId: id });
        return createResponse('User restored in database', 200);
      }
      // If user exists and is not deleted, update them
      await db.update(users).set(userData).where(eq(users.id, id));
      apiLogger.info('User updated in database', { userId: id });
      return createResponse('User updated in database', 200);
    }

    // If user doesn't exist, create new record
    await db.insert(users).values(userData);
    apiLogger.info('User created in database', { userId: id });
    return createResponse('User created in database', 201);
  } catch (error) {
    apiLogger.error('Error handling user.created webhook', { userId: id, error });
    throw error;
  }
};

const handleUserUpdated = async (data: IClerkUserData) => {
  apiLogger.info('Processing user.updated webhook', { userId: data.id });
  validateUserData(data);

  const {
    id,
    username,
    email_addresses = [],
    first_name,
    last_name,
    image_url,
    updated_at,
    created_at,
    last_sign_in_at,
    password_enabled,
    two_factor_enabled,
    external_id,
    external_accounts,
    profile_image_url,
    primary_email_address_id,
  } = data;

  const defaultUsername = `${first_name || 'user'}-${last_name || 'unknown'}`.toLowerCase();
  const userData = {
    username: username || defaultUsername,
    firstName: first_name || '',
    lastName: last_name || '',
    emailAddress: email_addresses[0]?.email_address || '',
    imageUrl: image_url || profile_image_url || '',
    createdAt: new Date(created_at || Date.now()),
    updatedAt: new Date(updated_at || Date.now()),
    // New Clerk-specific fields
    last_sign_in_at: last_sign_in_at ? new Date(last_sign_in_at) : null,
    password_enabled: password_enabled || false,
    two_factor_enabled: two_factor_enabled || false,
    email_verified: email_addresses[0]?.verification?.status === 'verified',
    email_verification_strategy: email_addresses[0]?.verification?.strategy || null,
    external_id: external_id || null,
    external_accounts: external_accounts || [],
    primary_email_address_id: primary_email_address_id || null,
  };

  try {
    await db.update(users).set(userData).where(eq(users.id, id));
    apiLogger.info('User updated in database', { userId: id });
    return createResponse('User updated in database', 200);
  } catch (error) {
    apiLogger.error('Error handling user.updated webhook', { userId: id, error });
    throw error;
  }
};

const handleUserDeleted = async (data: IClerkDeletedUserData) => {
  apiLogger.info('Processing user.deleted webhook', { userId: data.id });

  const { id, deleted } = data;
  if (!id) throw new Error('Missing user ID');
  if (!deleted) {
    apiLogger.info('User not deleted in Clerk', { userId: id });
    return createResponse('User not deleted in Clerk', 200);
  }

  try {
    // Soft delete the user by setting deletedAt
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    apiLogger.info('User soft-deleted in database', { userId: id });
    return createResponse('User soft-deleted in database', 200);
  } catch (error) {
    apiLogger.error('Error handling user.deleted webhook', { userId: id, error });
    throw error;
  }
};

// Main webhook handler
export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;
    apiLogger.info('Received webhook event', { type: eventType });

    switch (eventType) {
      case 'user.created':
        return await handleUserCreated(evt.data as unknown as IClerkUserData);
      case 'user.updated':
        return await handleUserUpdated(evt.data as unknown as IClerkUserData);
      case 'user.deleted':
        return await handleUserDeleted({
          ...evt.data,
          deletedAt: new Date().toISOString(),
        } as IClerkDeletedUserData);
      default:
        apiLogger.warn('Unhandled webhook event type', { type: eventType });
        return createResponse('Unhandled event type', 200);
    }
  } catch (error) {
    apiLogger.error('Webhook error:', error);
    return createResponse(
      error instanceof Error ? error.message : 'Internal server error',
      error instanceof Error && error.message.includes('Missing user ID') ? 400 : 500
    );
  }
}

// Force Node.js runtime for database operations
export const runtime = 'nodejs';
