import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import type { IClerkUserData } from '@/lib/types/clerk.types';
import { encryptField, serializeEncryptedField } from '@/lib/utils/encryption';
import { extractEmail, extractPhoneNumber, validateUserContact } from '@/lib/utils/validation';
import { webhookLogger } from '@lib/core/logger';

// Helper function
const createResponse = (message: string, status: number) => new Response(message, { status });

export const handleUserUpdated = async (data: IClerkUserData) => {
  const {
    id,
    username,
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

  // Extract contact information
  const email = extractEmail(data);
  const phone = extractPhoneNumber(data);
  const finalUsername = username ?? `${first_name}-${last_name}`.toLowerCase();

  // Validate user contact requirements
  const validation = validateUserContact({
    username: finalUsername,
    email_address: email ?? undefined,
    phone_number: phone ?? undefined,
  });

  if (!validation.success) {
    webhookLogger.error(`User update failed validation: ${validation.errors?.join(', ')}`);
    return createResponse(`User update failed: ${validation.errors?.join(', ')}`, 400);
  }

  // Encrypt sensitive fields
  const encryptedEmail = email ? serializeEncryptedField(encryptField(email)) : null;
  const encryptedPhone = phone ? serializeEncryptedField(encryptField(phone)) : null;

  const userData = {
    username: finalUsername,
    first_name: first_name ?? '',
    last_name: last_name ?? '',
    image_url,
    has_image: !!has_image,
    profile_image_url,
    primary_email_address_id: primary_email_address_id ?? '',
    primary_phone_number_id: primary_phone_number_id ?? '',
    email_address: encryptedEmail,
    phone_number: encryptedPhone,
    external_id: external_id ?? '',
    last_active_at: last_active_at ? new Date(last_active_at) : null,
    last_sign_in_at: last_sign_in_at ? new Date(last_sign_in_at) : null,
    updated_at: new Date(),
  };

  await db()?.update(users).set(userData).where(eq(users.id, id));
  webhookLogger.info(`User ${id} updated successfully in database`);
  return createResponse('User updated in database', 200);
};
