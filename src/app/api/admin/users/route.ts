import { auth, currentUser } from '@clerk/nextjs/server';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { users } from '@/lib/db/schema';
import { db } from '@/lib/db/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    // Fetch all users
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
