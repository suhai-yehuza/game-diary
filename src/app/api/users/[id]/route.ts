import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { users } from '@src/lib/db/schema';
import { db } from '@src/lib/db/seed';
import { apiLogger } from 'lib/core/logger';
export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    if (!id) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch the specific user
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!targetUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    apiLogger.error('Error fetching user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Force Node.js runtime for database operations
export const runtime = 'nodejs';
