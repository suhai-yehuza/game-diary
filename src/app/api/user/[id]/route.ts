import { auth, currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const currentUserData = await currentUser();

    if (!currentUserData) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Simple RLS-like behavior: users can only access their own data
    if (params.id !== userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Return user data in the format expected by tests
    return NextResponse.json({
      id: currentUserData.id,
      email_address: currentUserData.emailAddresses?.[0]?.emailAddress || null,
      phone_number: currentUserData.phoneNumbers?.[0]?.phoneNumber || null,
      username: currentUserData.username,
      first_name: currentUserData.firstName,
      last_name: currentUserData.lastName,
    });
  } catch (error) {
    console.error('Error in /api/user/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const runtime = 'nodejs';
