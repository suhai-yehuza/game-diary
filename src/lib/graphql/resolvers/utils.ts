import { eq } from 'drizzle-orm';

import { db } from '@src/lib/db';
import * as schema from '@src/lib/db/schema';
import type { IContext } from '@src/lib/types';

// Helper to ensure user exists in database (create if not)
export async function ensureUserExists(user: IContext['user']) {
  if (!user) return null;

  // Check if user already exists
  const existingUsers = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .limit(1);

  if (existingUsers.length > 0) return existingUsers[0];

  // Create user if not exists
  const [newUser] = await db
    .insert(schema.users)
    .values({
      id: user.id,
      username: user.username || `user_${user.id.slice(-8)}`,
      firstName: user.firstName || 'Unknown',
      lastName: user.lastName || 'DBUser',
      emailAddress: user.emailAddresses?.[0]?.emailAddress || `${user.id}@placeholder.com`,
      imageUrl: user.imageUrl || '',
      inboundFriendshipIds: [],
      outboundFriendshipIds: [],
      banned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      last_sign_in_at: null,
      password_enabled: false,
      two_factor_enabled: false,
      email_verified: false,
      email_verification_strategy: null,
      external_id: null,
      external_accounts: [],
      deletedAt: null,
    })
    .returning();

  return newUser;
}

// Helper function to convert string to ParentType enum
export function toParentTypeEnum(val: string): 'game_log' | 'comment' {
  if (val === 'game_log') return 'game_log';
  if (val === 'comment') return 'comment';
  throw new Error('Invalid ParentType from DB');
}

// Helper function to handle null values in database queries
export function isNull<T>(value: T | null): boolean {
  return value === null;
}
