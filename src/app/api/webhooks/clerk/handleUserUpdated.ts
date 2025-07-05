import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { webhookLogger } from '@lib/core/logger';
import type { IClerkUserData } from '@src/lib/types/clerk-types';

// Helper function
const createResponse = (message: string, status: number) => new Response(message, { status });

export const handleUserUpdated = async (data: IClerkUserData) => {
  const {
    id,
    username,
    email_addresses,
    first_name,
    last_name,
    image_url,
    has_image,
    profile_image_url,
    primary_email_address_id,
    primary_phone_number_id,
    external_id,
    last_active_at,
    last_sign_in_at,
  } = data;

  if (!id) throw new Error('Missing user ID');

  const userData = {
    username: username ?? `${first_name}-${last_name}`.toLowerCase(),
    first_name: first_name ?? '',
    last_name: last_name ?? '',
    image_url,
    has_image: !!has_image,
    profile_image_url,
    primary_email_address_id: primary_email_address_id ?? '',
    primary_phone_number_id: primary_phone_number_id ?? '',
    email_address: email_addresses[0].email_address,
    external_id: external_id ?? '',
    last_active_at: last_active_at ? new Date(last_active_at) : null,
    last_sign_in_at: last_sign_in_at ? new Date(last_sign_in_at) : null,
    updated_at: new Date(),
  };

  await db?.update(users).set(userData).where(eq(users.id, id));
  webhookLogger.info(`User ${id} updated successfully in database`);
  return createResponse('User updated in database', 200);
};
