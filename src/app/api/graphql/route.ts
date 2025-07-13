import { auth, currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await currentUser();

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const body = await request.json();
    const { query } = body as { query: string };

    // Simple GraphQL-like response for testing
    if (query.includes('me')) {
      return NextResponse.json({
        data: {
          me: {
            id: user.id,
            email_address: user.emailAddresses?.[0]?.emailAddress || null,
            phone_number: user.phoneNumbers?.[0]?.phoneNumber || null,
          },
        },
      });
    }

    if (query.includes('user(id:')) {
      // Extract user ID from query (simple parsing for tests)
      const match = query.match(/user\(id:\s*"([^"]+)"/);
      if (match && match[1] === user.id) {
        return NextResponse.json({
          data: {
            user: {
              id: user.id,
              email_address: user.emailAddresses?.[0]?.emailAddress || null,
              phone_number: user.phoneNumbers?.[0]?.phoneNumber || null,
            },
          },
        });
      } else {
        // Return user data but with null sensitive fields for other users
        return NextResponse.json({
          data: {
            user: {
              id: match?.[1] ?? 'unknown',
              email_address: null,
              phone_number: null,
            },
          },
        });
      }
    }

    return NextResponse.json(
      {
        errors: [{ message: 'Query not supported' }],
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in /api/graphql:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const runtime = 'nodejs';
