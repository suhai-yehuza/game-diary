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
  // if (isProtectedRoute(req)) {
  //   await (auth.protect as () => Promise<unknown>)();
  // }

  const authData = await (auth as () => Promise<{ userId: string | null }>)();

  // If user is authenticated and trying to access sign-in/sign-up, redirect to profile
  if (authData.userId && isAuthRoute(req)) {
    return Response.redirect(new URL('/protected/user', (req as { url: string }).url));
  }

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
