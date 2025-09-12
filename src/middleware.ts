import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { logger } from '@/lib/utils/logger';
import { isAuthCallbackServer } from '@/lib/utils/sso-utils';

// Create route matchers
const isAuthRoute = (createRouteMatcher as (routes: string[]) => (req: Request) => boolean)([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// const isProtectedRoute = (createRouteMatcher as (routes: string[]) => (req: Request) => boolean)([
//   '/protected(.*)',
// ]);

const isAdminRoute = (createRouteMatcher as (routes: string[]) => (req: Request) => boolean)([
  '/protected/admin(.*)',
  '/api/admin(.*)',
]);

export const middleware = (
  clerkMiddleware as unknown as (
    handler: (
      auth: { protect: () => Promise<unknown>; (): Promise<{ userId: string | null }> },
      req: Request
    ) => Promise<Response>
  ) => (req: Request) => Promise<Response>
)(async (auth, req) => {
  const url = new URL((req as { url: string }).url);

  // Skip auth for webhook endpoints to preserve raw body and avoid delays
  if (url.pathname.startsWith('/api/webhooks')) {
    return NextResponse.next();
  }

  // Skip auth for health check endpoint
  if (url.pathname === '/api/health') {
    return NextResponse.next();
  }

  // Skip auth for search endpoint (public API)
  if (url.pathname === '/api/search') {
    return NextResponse.next();
  }

  // Skip auth for proxy endpoint (public API for external data)
  if (url.pathname.startsWith('/api/proxy/')) {
    return NextResponse.next();
  }

  // Skip auth for mock server endpoint (public API for testing)
  if (url.pathname.startsWith('/api/mock-server')) {
    return NextResponse.next();
  }

  // Handle OAuth callbacks - let Clerk handle these properly
  if (url.pathname.includes('oauth_callback') || url.searchParams.has('__clerk_status')) {
    return NextResponse.next();
  }

  // Handle Clerk catchall routes and SSO callbacks using shared utility
  if (isAuthCallbackServer(url.pathname, url.search)) {
    return NextResponse.next();
  }

  // Skip authentication checks in E2E test/mock mode
  if (isTestOrCIEnvironment()) {
    logger.info('🧪 E2E test environment detected - skipping auth checks');
    return NextResponse.next();
  }

  // Vercel Automation Bypass for E2E
  const bypassSecret = req.headers.get('x-vercel-protection-bypass');
  if (
    bypassSecret &&
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET &&
    bypassSecret === process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  ) {
    logger.info('🔐 Vercel automation bypass active - skipping all auth checks');
    return NextResponse.next();
  }

  // Only run authentication checks if bypass is not active
  const authData = await (auth as () => Promise<{ userId: string | null }>)();

  // If user is authenticated and trying to access sign-in/sign-up, redirect to profile
  if (authData.userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/protected/dashboard', url));
  }

  // Check for admin routes - these require special handling
  if (isAdminRoute(req)) {
    // Skip authentication checks in E2E test/mock mode for admin routes
    if (isTestOrCIEnvironment() || process.env.MOCK_MODE === 'true') {
      logger.info('🧪 Mock mode detected - skipping auth checks for admin route');
      return NextResponse.next();
    }

    // For admin routes, we'll let the individual API endpoints handle authentication
    // This allows for more granular control and proper error responses
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access protected routes, allow the request to continue
  // The protected layout will handle showing the Clerk sign-in modal.

  // Always return a Response (default: continue the request)
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
