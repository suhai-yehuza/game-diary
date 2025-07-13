import { auth, currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withEncryption } from '@/lib/middleware/encryption';

// Helper function to extract user ID from request
function getUserIdFromRequest(_request: Request): string | undefined {
  // This would typically extract from auth headers or session
  // For now, we'll rely on Clerk's auth context
  return undefined; // Will be handled by Clerk auth
}

// Original handler function
async function userHandler(_request: Request) {
  const authData = await (auth as () => Promise<{ userId: string | null }>)();

  if (!authData.userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Use `currentUser()` to get the Backend API User object
  const user = await (currentUser as () => Promise<unknown>)();

  // Add your Route Handler's logic with the returned `user` object
  return NextResponse.json({ user }, { status: 200 });
}

// POST handler for user creation with validation
async function createUserHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone } = body as { email?: string; phone?: string };

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Simple phone validation (basic format)
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (phone && !phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
    }

    // Mock successful user creation
    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: { email, phone },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// Export the GET handler wrapped with encryption middleware
export const GET = withEncryption(userHandler as (...args: unknown[]) => unknown, {
  decryptResponse: true,
  encryptRequest: false, // No sensitive data in GET requests
  getUserId: getUserIdFromRequest,
});

// Export the POST handler for user creation
export const POST = createUserHandler;

// Force Node.js runtime for Clerk operations
export const runtime = 'nodejs';
