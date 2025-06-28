import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const isProtectedRoute = createRouteMatcher(['/protected(.*)']);
// const isAdminRoute = createRouteMatcher(['/protected/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const { userId } = await auth();

  // If user is authenticated and trying to access sign-in/sign-up, redirect to profile
  if (userId && isAuthRoute(req)) {
    return Response.redirect(new URL('/protected/user', req.url));
  }

  // If user is not authenticated and trying to access protected route, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    return Response.redirect(new URL('/sign-in', req.url));
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
