import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAuthRoute = (createRouteMatcher as (routes: string[]) => (req: Request) => boolean)([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);
// const isProtectedRoute = (createRouteMatcher as (routes: string[]) => (req: Request) => boolean)([
//   '/protected(.*)',
// ]);
// const isAdminRoute = createRouteMatcher(['/protected/admin(.*)']);

export const middleware = (
  clerkMiddleware as unknown as (
    handler: (
      auth: { protect: () => Promise<unknown>; (): Promise<{ userId: string | null }> },
      req: Request
    ) => Promise<Response>
  ) => (req: Request) => Promise<Response>
)(async (auth, req) => {
  const url = new URL((req as { url: string }).url);

  // Handle SSO callback redirects
  if (url.hash.includes('sso-callback') || url.searchParams.has('sign_up_fallback_redirect_url')) {
    // Redirect to the proper sign-in page for SSO completion
    const signInUrl = new URL('/sign-in', url.origin);
    return NextResponse.redirect(signInUrl);
  }

  // Vercel Automation Bypass for E2E
  const bypassSecret = req.headers.get('x-vercel-protection-bypass');
  if (
    bypassSecret &&
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET &&
    bypassSecret === process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  ) {
    console.log('🔐 Vercel automation bypass active - skipping all auth checks');
    return NextResponse.next();
  }

  // Only run authentication checks if bypass is not active
  const authData = await (auth as () => Promise<{ userId: string | null }>)();

  // If user is authenticated and trying to access sign-in/sign-up, redirect to profile
  if (authData.userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/protected/user', url));
  }

  // If user is not authenticated and trying to access protected routes, allow the request to continue
  // The protected layout will handle showing the Clerk sign-in modal.

  // Always return a Response (default: continue the request)
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Specific routes that need middleware
    '/protected/:path*',
    '/sign-in/:path*',
    '/sign-up/:path*',
    '/api/:path*',
    // Home page
    '/',
  ],
};
