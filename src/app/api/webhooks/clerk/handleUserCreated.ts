import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { encryptField, serializeEncryptedField } from '@/lib/utils/encryption';
import { extractEmail, extractPhoneNumber, validateUserContact } from '@/lib/utils/validation';
import { webhookLogger } from '@lib/core/logger';
import type { IClerkUserData } from '@/lib/types/clerk.types';

// Helper function
const createResponse = (message: string, status: number) => new Response(message, { status });

export const handleUserCreated = async (data: IClerkUserData) => {
  const {
    id,
    username,
    first_name,
    last_name,
    image_url,
    object,
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
  const finalUsername =
    username ?? `${first_name ?? 'noFirstName'}-${last_name ?? 'noLastName'}`.toLowerCase();

  // Validate user contact requirements
  const validation = validateUserContact({
    username: finalUsername,
    email_address: email ?? undefined,
    phone_number: phone ?? undefined,
  });

  if (!validation.success) {
    webhookLogger.error(`User creation failed validation: ${validation.errors?.join(', ')}`);
    return createResponse(`User creation failed: ${validation.errors?.join(', ')}`, 400);
  }

  // Encrypt sensitive fields
  const encryptedEmail = email ? serializeEncryptedField(encryptField(email)) : null;
  const encryptedPhone = phone ? serializeEncryptedField(encryptField(phone)) : null;

  const userData = {
    id,
    object,
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
    bio: null,
    timezone: null,
    preferred_language: 'en',
    inbound_friendship_ids: [],
    outbound_friendship_ids: [],
  };

  await db()?.insert(users).values(userData);
  webhookLogger.info(`User ${id} created successfully in database`);
  return createResponse('User created in database', 201);
};
