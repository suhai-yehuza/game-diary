import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, and, or } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { users, friendships } from '@/lib/db/schema';
import { decryptField, deserializeEncryptedField, isEncrypted } from '@/lib/utils/encryption';
import { errorHandlers } from '@/lib/utils/error-handler';
import { FRIENDSHIP_STATUS } from '@/types';

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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUserId = params.id;

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
        // Show full user details, but mask sensitive info for non-friends
        email_address: showSensitiveInfo
          ? decryptedEmail
          : decryptedEmail && decryptedEmail !== 'null'
            ? '***@***.***'
            : null,
        phone_number: showSensitiveInfo
          ? decryptedPhone
          : decryptedPhone && decryptedPhone !== 'null'
            ? '***-***-****'
            : null,
        image_url: targetUser.image_url,
        created_at: targetUser.created_at,
        // Additional metadata for the frontend
        is_own_profile: isOwnUser,
        is_friend: areFriends,
        can_view_details: showSensitiveInfo,
      });
    }

    // If not found in database and it's the current user, try Clerk
    if (targetUserId === userId) {
      const currentUserData = await currentUser();

      if (!currentUserData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Return Clerk user data for current user
      return NextResponse.json({
        id: currentUserData.id,
        email_address: currentUserData.emailAddresses?.[0]?.emailAddress || null,
        phone_number: currentUserData.phoneNumbers?.[0]?.phoneNumber || null,
        username: currentUserData.username,
        first_name: currentUserData.firstName,
        last_name: currentUserData.lastName,
        image_url: currentUserData.imageUrl,
        created_at: currentUserData.createdAt
          ? new Date(currentUserData.createdAt).toISOString()
          : null,
        // Metadata for own profile from Clerk
        is_own_profile: true,
        is_friend: true, // User is always "friends" with themselves
        can_view_details: true,
      });
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
