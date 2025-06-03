import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { users } from '@/lib/db/schema';
import { db } from '@/lib/db/seed';
import { apiLogger } from '@/lib/logger';
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    if (!id) {
      apiLogger.error('No user ID provided in params');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the current user to access their email
    const user = await currentUser();
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check if user has admin access
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail || !adminEmails.includes(userEmail)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Fetch the specific user
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!targetUser) {
      apiLogger.error(`User not found with ID: ${id}`);
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    apiLogger.error('Error fetching user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
