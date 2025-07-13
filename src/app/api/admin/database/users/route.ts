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

    // Mock encrypted user data for testing
    const mockUsers = [
      {
        id: user.id,
        email_address: JSON.stringify({
          iv: 'mock-iv-123',
          content: 'mock-encrypted-content',
          tag: 'mock-tag-456',
        }),
        phone_number: JSON.stringify({
          iv: 'mock-iv-789',
          content: 'mock-encrypted-content',
          tag: 'mock-tag-012',
        }),
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
      },
    ];

    return NextResponse.json(mockUsers);
  } catch (error) {
    console.error('Error in /api/admin/database/users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const runtime = 'nodejs';
