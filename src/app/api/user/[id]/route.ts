import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, and, or } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { users, friendships } from '@/lib/db/schema';
import {
  decryptField,
  deserializeEncryptedField,
  isEncrypted,
  encryptField,
  serializeEncryptedField,
} from '@/lib/utils/encryption';
import { loadEnvironmentVariables } from '@/lib/utils/env-loader';
import { errorHandlers } from '@/lib/utils/error-handler';
import { FRIENDSHIP_STATUS } from '@/types';

// Ensure environment variables are loaded
loadEnvironmentVariables();

// Helper function to safely decrypt a field
function safeDecrypt(encryptedValue: string | null | undefined): string | null {
  if (!encryptedValue) return null;

  try {
    if (isEncrypted(encryptedValue)) {
      return decryptField(deserializeEncryptedField(encryptedValue));
    }
    return encryptedValue; // Return as-is if not encrypted
  } catch (error) {
    // Use centralized error handling
    errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'Decrypt field',
    });
    return null; // Return null on decryption failure
  }
}

// Helper function to check if two users are friends
async function areUsersFriends(userId1: string, userId2: string): Promise<boolean> {
  if (userId1 === userId2) return true; // User is always "friends" with themselves

  try {
    const friendship = await db()?.query.friendships.findFirst({
      where: and(
        eq(friendships.status, FRIENDSHIP_STATUS.ACCEPTED),
        or(
          and(eq(friendships.user_id, userId1), eq(friendships.friend_id, userId2)),
          and(eq(friendships.user_id, userId2), eq(friendships.friend_id, userId1))
        )
      ),
    });

    return !!friendship;
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'Check friendship status',
    });
    return false;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;

    // Try to fetch the target user from database first
    const targetUser = await db()?.query.users.findFirst({
      where: eq(users.id, targetUserId),
    });

    if (targetUser) {
      // Found user in database - return appropriate data based on privacy and friendship
      const isOwnUser = userId === targetUserId;
      const areFriends = await areUsersFriends(userId, targetUserId);

      // Show sensitive information if viewing own profile or if users are friends
      const showSensitiveInfo = isOwnUser || areFriends;

      const decryptedEmail = safeDecrypt(targetUser.email_address);
      const decryptedPhone = safeDecrypt(targetUser.phone_number);

      return NextResponse.json({
        id: targetUser.id,
        username: targetUser.username,
        first_name: targetUser.first_name,
        last_name: targetUser.last_name,
        // Show full user details for own profile, mask sensitive info for others based on friendship
        email_address: isOwnUser
          ? decryptedEmail &&
            decryptedEmail !== targetUser.email_address &&
            !decryptedEmail.includes('{"iv"')
            ? decryptedEmail
            : '*****'
          : showSensitiveInfo
            ? decryptedEmail &&
              decryptedEmail !== targetUser.email_address &&
              !decryptedEmail.includes('{"iv"')
              ? decryptedEmail
              : '*****'
            : '*****',
        phone_number: isOwnUser
          ? decryptedPhone &&
            decryptedPhone !== targetUser.phone_number &&
            !decryptedPhone.includes('{"iv"')
            ? decryptedPhone
            : targetUser.phone_number
              ? '*****'
              : '000-000-0000'
          : showSensitiveInfo
            ? decryptedPhone &&
              decryptedPhone !== targetUser.phone_number &&
              !decryptedPhone.includes('{"iv"')
              ? decryptedPhone
              : '*****'
            : '*****',
        image_url: targetUser.image_url,
        profile_image_url: targetUser.profile_image_url,
        has_image: targetUser.has_image,
        bio: targetUser.bio,
        timezone: targetUser.timezone,
        preferred_language: targetUser.preferred_language,
        last_active_at: targetUser.last_active_at,
        last_sign_in_at: targetUser.last_sign_in_at,
        created_at: targetUser.created_at,
        // Additional metadata for the frontend
        is_own_profile: isOwnUser,
        is_friend: areFriends,
        can_view_details: isOwnUser || showSensitiveInfo,
      });
    }

    // If not found in database and it's the current user, try Clerk
    if (targetUserId === userId) {
      const currentUserData = await currentUser();

      if (!currentUserData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Try to create or update the user in the database
      try {
        // Extract email and phone from Clerk data
        const email = currentUserData.emailAddresses?.[0]?.emailAddress;
        const phone = currentUserData.phoneNumbers?.[0]?.phoneNumber;

        // Encrypt sensitive fields
        const encryptedEmail = email ? serializeEncryptedField(encryptField(email)) : null;
        const encryptedPhone = phone ? serializeEncryptedField(encryptField(phone)) : null;

        const userData = {
          id: currentUserData.id,
          object: 'user',
          username:
            currentUserData.username ||
            `${currentUserData.firstName || 'User'}-${currentUserData.lastName || 'Name'}`.toLowerCase(),
          first_name: currentUserData.firstName || '',
          last_name: currentUserData.lastName || '',
          image_url: currentUserData.imageUrl,
          has_image: !!currentUserData.imageUrl,
          profile_image_url: currentUserData.imageUrl,
          primary_email_address_id: currentUserData.emailAddresses?.[0]?.id || '',
          primary_phone_number_id: currentUserData.phoneNumbers?.[0]?.id || '',
          email_address: encryptedEmail,
          phone_number: encryptedPhone,
          external_id: currentUserData.externalId || '',
          last_active_at: currentUserData.lastActiveAt
            ? new Date(currentUserData.lastActiveAt)
            : null,
          last_sign_in_at: currentUserData.lastSignInAt
            ? new Date(currentUserData.lastSignInAt)
            : null,
          bio: null,
          timezone: null,
          preferred_language: 'en',
          isAdmin: false,
          inbound_friendship_ids: [],
          outbound_friendship_ids: [],
          created_at: new Date(currentUserData.createdAt),
          updated_at: new Date(),
          deleted_at: null,
        };

        // Check if user already exists in database
        const existingUser = await db()?.query.users.findFirst({
          where: eq(users.id, currentUserData.id),
        });

        if (existingUser) {
          // User exists - update with latest Clerk data
          await db()
            ?.update(users)
            .set({
              username: userData.username,
              first_name: userData.first_name,
              last_name: userData.last_name,
              image_url: userData.image_url,
              has_image: userData.has_image,
              profile_image_url: userData.profile_image_url,
              primary_email_address_id: userData.primary_email_address_id,
              primary_phone_number_id: userData.primary_phone_number_id,
              email_address: encryptedEmail || existingUser.email_address, // Keep existing if no new email
              phone_number: encryptedPhone || existingUser.phone_number, // Keep existing if no new phone
              external_id: userData.external_id,
              last_active_at: userData.last_active_at,
              last_sign_in_at: userData.last_sign_in_at,
              updated_at: new Date(),
            })
            .where(eq(users.id, currentUserData.id));
        } else {
          // User doesn't exist - create new user
          await db()?.insert(users).values(userData);
        }

        // Determine the final email and phone to return
        const finalEmail = existingUser
          ? (encryptedEmail
              ? safeDecrypt(encryptedEmail)
              : safeDecrypt(existingUser.email_address)) || '*****'
          : (encryptedEmail ? safeDecrypt(encryptedEmail) : null) || '*****';
        const finalPhone = existingUser
          ? (encryptedPhone
              ? safeDecrypt(encryptedPhone)
              : safeDecrypt(existingUser.phone_number)) ||
            (existingUser.phone_number ? '*****' : '000-000-0000')
          : (encryptedPhone ? safeDecrypt(encryptedPhone) : null) || '000-000-0000';

        // Now return the user data with proper privacy settings
        return NextResponse.json({
          id: currentUserData.id,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email_address: finalEmail,
          phone_number: finalPhone,
          image_url: currentUserData.imageUrl,
          profile_image_url: currentUserData.imageUrl,
          has_image: !!currentUserData.imageUrl,
          bio: existingUser?.bio || null,
          timezone: existingUser?.timezone || null,
          preferred_language: existingUser?.preferred_language || 'en',
          last_active_at: currentUserData.lastActiveAt
            ? new Date(currentUserData.lastActiveAt).toISOString()
            : null,
          last_sign_in_at: currentUserData.lastSignInAt
            ? new Date(currentUserData.lastSignInAt).toISOString()
            : null,
          created_at: existingUser?.created_at
            ? new Date(existingUser.created_at).toISOString()
            : new Date(currentUserData.createdAt).toISOString(),
          // Additional metadata for the frontend
          is_own_profile: true,
          is_friend: false,
          can_view_details: true, // User can see their own data
        });
      } catch (error) {
        // If database creation fails, return basic Clerk data
        console.error('Failed to create user in database:', error);
        return NextResponse.json({
          id: currentUserData.id,
          username: currentUserData.username,
          first_name: currentUserData.firstName,
          last_name: currentUserData.lastName,
          email_address: currentUserData.emailAddresses?.[0]?.emailAddress || '*****',
          phone_number: currentUserData.phoneNumbers?.[0]?.phoneNumber || '*****',
          image_url: currentUserData.imageUrl,
          created_at: currentUserData.createdAt
            ? new Date(currentUserData.createdAt).toISOString()
            : null,
          // Additional metadata for the frontend
          is_own_profile: true,
          is_friend: false,
          can_view_details: true, // User can see their own data
        });
      }
    }

    // User not found anywhere
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/user/[id]',
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
