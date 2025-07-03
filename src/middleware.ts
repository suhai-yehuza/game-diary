import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAuthRoute = (createRouteMatcher as (routes: string[]) => (req: Request) => boolean)([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);
const isProtectedRoute = (createRouteMatcher as (routes: string[]) => (req: Request) => boolean)([
  '/protected(.*)',
]);
// const isAdminRoute = createRouteMatcher(['/protected/admin(.*)']);

export const middleware = (
  clerkMiddleware as unknown as (
    handler: (
      auth: { protect: () => Promise<unknown>; (): Promise<{ userId: string | null }> },
      req: Request
    ) => Promise<Response>
  ) => (req: Request) => Promise<Response>
)(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await (auth.protect as () => Promise<unknown>)();
  }

  const authData = await (auth as () => Promise<{ userId: string | null }>)();

  // If user is authenticated and trying to access sign-in/sign-up, redirect to profile
  if (authData.userId && isAuthRoute(req)) {
    return Response.redirect(new URL('/protected/user', (req as { url: string }).url));
  }

  // If user is not authenticated and trying to access protected route, redirect to sign-in
  if (!authData.userId && isProtectedRoute(req)) {
    return Response.redirect(new URL('/sign-in', (req as { url: string }).url));
  }

  // Always return a Response (default: continue the request)
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/((?!.*\\..*|_next).*)',
    // Always run for the home page
    '/',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
