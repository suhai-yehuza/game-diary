import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { eq, sql } from 'drizzle-orm';
import { NextRequest } from 'next/server';

import { users } from '@/lib/db/schema';
import { db } from '@/lib/db/seed';
import { ClerkUserData, ClerkDeletedUserData } from '@/lib/types/user.types';

// Helper functions
const createResponse = (message: string, status: number) => new Response(message, { status });

const handleUserCreated = async (data: ClerkUserData) => {
  const {
    id,
    username,
    email_addresses,
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

  if (!id) throw new Error('Missing user ID');

  // More detailed email validation
  if (!email_addresses) {
    throw new Error('No email_addresses array in webhook payload');
  }
  if (!Array.isArray(email_addresses) || email_addresses.length === 0) {
    throw new Error('email_addresses array is empty or not an array');
  }
  if (!email_addresses[0]?.email_address) {
    throw new Error('First email address object is missing email_address property');
  }

  const defaultUsername = `${first_name || 'user'}-${last_name || 'unknown'}`.toLowerCase();
  const userData = {
    id,
    username: username || defaultUsername,
    firstName: first_name || 'missing-first-name',
    lastName: last_name || 'missing-last-name',
    emailAddress: email_addresses[0].email_address,
    imageUrl: image_url || profile_image_url || '',
    createdAt: new Date(created_at),
    updatedAt: new Date(updated_at),
    inboundFriendshipIds: [],
    outboundFriendshipIds: [],
    banned: false,
    timestamp: new Date(),
    // New Clerk-specific fields
    last_sign_in_at: last_sign_in_at ? new Date(last_sign_in_at) : null,
    password_enabled: password_enabled || false,
    two_factor_enabled: two_factor_enabled || false,
    email_verified: email_addresses[0]?.verification?.status === 'verified',
    email_verification_strategy: email_addresses[0]?.verification?.strategy || null,
    external_id: external_id || null,
    external_accounts: external_accounts || [],
    primary_email_address_id: primary_email_address_id || null,
    deletedAt: null, // Ensure deletedAt is null for new/restored users
  };

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
      return createResponse('User restored in database', 200);
    }
    // If user exists and is not deleted, update them
    await db.update(users).set(userData).where(eq(users.id, id));
    return createResponse('User updated in database', 200);
  }

  // If user doesn't exist, create new record
  await db.insert(users).values(userData);
  return createResponse('User created in database', 201);
};

const handleUserUpdated = async (data: ClerkUserData) => {
  const {
    id,
    username,
    email_addresses,
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

  if (!id) throw new Error('Missing user ID');
  if (!email_addresses?.[0]?.email_address) throw new Error('Missing email address');

  const defaultUsername = `${first_name || 'user'}-${last_name || 'unknown'}`.toLowerCase();
  const userData = {
    username: username || defaultUsername,
    firstName: first_name || '',
    lastName: last_name || '',
    emailAddress: email_addresses[0].email_address,
    imageUrl: image_url || profile_image_url || '',
    createdAt: new Date(created_at),
    updatedAt: new Date(updated_at),
    timestamp: new Date(),
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

  await db.update(users).set(userData).where(eq(users.id, id));
  return createResponse('User updated in database', 200);
};

const handleUserDeleted = async (data: ClerkDeletedUserData) => {
  const { id, deleted } = data;

  if (!id) throw new Error('Missing user ID');
  if (!deleted) return createResponse('User not deleted in Clerk', 200);

  await db.delete(users).where(eq(users.id, id));
  return createResponse('User deleted from database', 200);
};

// Main webhook handler
export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;

    switch (eventType) {
      case 'user.created':
        return await handleUserCreated(evt.data as unknown as ClerkUserData);
      case 'user.updated':
        return await handleUserUpdated(evt.data as unknown as ClerkUserData);
      case 'user.deleted':
        return await handleUserDeleted(evt.data as ClerkDeletedUserData);
      default:
        return createResponse('Unhandled event type', 200);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return createResponse(
      error instanceof Error ? error.message : 'Internal server error',
      error instanceof Error && error.message.includes('Missing user ID') ? 400 : 500
    );
  }
}
