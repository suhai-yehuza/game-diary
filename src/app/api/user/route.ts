import { auth, currentUser } from '@clerk/nextjs/server';
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

// Export the handler wrapped with encryption middleware
export const GET = withEncryption(userHandler as (...args: unknown[]) => unknown, {
  decryptResponse: true,
  encryptRequest: false, // No sensitive data in GET requests
  getUserId: getUserIdFromRequest,
});

// Force Node.js runtime for Clerk operations
export const runtime = 'nodejs';
