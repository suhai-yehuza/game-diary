import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // E2E Auth Bypass: If running in E2E or Playwright test mode, return a mock user
    if (
      process.env.PLAYWRIGHT_TEST ||
      process.env.E2E_AUTH_BYPASS ||
      process.env.NODE_ENV === 'test'
    ) {
      console.log('[E2E AUTH BYPASS] Returning mock user for /api/user/me');
      return NextResponse.json({
        id: 'test-user-id',
        email_address: 'e2e-test@example.com',
        phone_number: '+1-555-000-0000',
        username: 'e2euser',
        first_name: 'E2E',
        last_name: 'Test',
      });
    }

    console.log('[CLERK AUTH] Using real Clerk auth for /api/user/me');
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
