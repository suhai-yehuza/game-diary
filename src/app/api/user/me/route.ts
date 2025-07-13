import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await currentUser();

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Return user data in the format expected by tests
    return NextResponse.json({
      id: user.id,
      email_address: user.emailAddresses?.[0]?.emailAddress || null,
      phone_number: user.phoneNumbers?.[0]?.phoneNumber || null,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
    });
  } catch (error) {
    console.error('Error in /api/user/me:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const runtime = 'nodejs';
