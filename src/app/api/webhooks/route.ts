import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { ClerkUserData, ClerkDeletedUserData } from '../../../lib/types/types';

// Helper functions
const createResponse = (message: string, status: number) => new Response(message, { status });

const handleUserCreated = async (data: ClerkUserData) => {
  const { id, username, email_addresses, first_name, last_name, image_url, updated_at } = data;

  if (!id) throw new Error('Missing user ID');

  const defaultUsername = `${first_name}-${last_name}`.toLowerCase();
  const userData = {
    id,
    username: username || defaultUsername,
    first_name: first_name || '',
    last_name: last_name || '',
    email_address: email_addresses[0].email_address,
    image_url: image_url || '',
    created_at: new Date(updated_at),
    updated_at: new Date(updated_at),
    inbound_friendship_ids: [],
    outbound_friendship_ids: [],
    banned: false,
    timestamp: new Date(),
  };

  await db.insert(users).values(userData);
  return createResponse('User created in database', 201);
};

const handleUserUpdated = async (data: ClerkUserData) => {
  const { id, username, email_addresses, first_name, last_name, image_url, updated_at } = data;

  if (!id) throw new Error('Missing user ID');

  const userData = {
    username: username || `${first_name}-${last_name}`.toLowerCase(),
    first_name: first_name || '',
    last_name: last_name || '',
    email_address: email_addresses[0].email_address,
    image_url: image_url || '',
    updated_at: new Date(updated_at),
    timestamp: new Date(),
  };

  await db.update(users).set(userData).where(eq(users.id, id));
  return createResponse('User updated in database', 200);
};

const handleUserDeleted = async (data: ClerkDeletedUserData) => {
  const { id } = data;

  if (!id) throw new Error('Missing user ID');
  if (!data.deleted) return createResponse('User not deleted in Clerk', 200);

  await db.delete(users).where(eq(users.id, id));
  return createResponse('User deleted from database', 200);
};

// Main webhook handler
export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req);
    console.log('Webhook received: ', evt);
    const eventType = evt.type;

    switch (eventType) {
      case 'user.created':
        return await handleUserCreated(evt.data as ClerkUserData);
      case 'user.updated':
        return await handleUserUpdated(evt.data as ClerkUserData);
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
