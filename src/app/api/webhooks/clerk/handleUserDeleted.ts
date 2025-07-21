import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import type { IClerkDeletedUserData } from '@/lib/types/clerk.types';
import { webhookLogger } from '@lib/core/logger';

// Helper function
const createResponse = (message: string, status: number) => new Response(message, { status });

export const handleUserDeleted = async (data: IClerkDeletedUserData) => {
  const { id } = data;

  if (!id) throw new Error('Missing user ID');
  if (!data.deleted) return createResponse('User not deleted in Clerk', 200);

  // Soft delete by setting deleted_at
  await db()
    ?.update(users)
    .set({
      deleted_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(users.id, id));

  webhookLogger.info(`User ${id} soft deleted successfully in database`);
  return createResponse('User deleted from database', 200);
};
