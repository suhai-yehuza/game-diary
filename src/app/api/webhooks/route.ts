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
    firstName,
    lastName,
    imageUrl,
    updatedAt,
    createdAt,
    last_sign_in_at,
    password_enabled,
    two_factor_enabled,
    external_id,
    external_accounts,
  } = data;

  if (!id) throw new Error('Missing user ID');
  if (!email_addresses?.[0]?.emailAddress) throw new Error('Missing email address');

  const defaultUsername = `${firstName || 'user'}-${lastName || 'unknown'}`.toLowerCase();
  const userData = {
    id,
    username: username || defaultUsername,
    firstName: firstName || 'missing-first-name',
    lastName: lastName || 'missing-last-name',
    emailAddress: email_addresses[0].emailAddress,
    imageUrl: imageUrl || '',
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
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
  };

  // Set the custom setting to identify this as a Clerk webhook request
  await db.execute(sql`SELECT set_config('app.current_user', 'clerk_webhook', false)`);
  await db.insert(users).values(userData);
  return createResponse('User created in database', 201);
};

const handleUserUpdated = async (data: ClerkUserData) => {
  const {
    id,
    username,
    email_addresses,
    firstName,
    lastName,
    imageUrl,
    updatedAt,
    createdAt,
    last_sign_in_at,
    password_enabled,
    two_factor_enabled,
    external_id,
    external_accounts,
  } = data;

  if (!id) throw new Error('Missing user ID');
  if (!email_addresses?.[0]?.emailAddress) throw new Error('Missing email address');

  const defaultUsername = `${firstName || 'user'}-${lastName || 'unknown'}`.toLowerCase();
  const userData = {
    username: username || defaultUsername,
    firstName: firstName || '',
    lastName: lastName || '',
    emailAddress: email_addresses[0].emailAddress,
    imageUrl: imageUrl || '',
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    timestamp: new Date(),
    // New Clerk-specific fields
    last_sign_in_at: last_sign_in_at ? new Date(last_sign_in_at) : null,
    password_enabled: password_enabled || false,
    two_factor_enabled: two_factor_enabled || false,
    email_verified: email_addresses[0]?.verification?.status === 'verified',
    email_verification_strategy: email_addresses[0]?.verification?.strategy || null,
    external_id: external_id || null,
    external_accounts: external_accounts || [],
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
        return await handleUserDeleted(evt.data as unknown as ClerkDeletedUserData);
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
