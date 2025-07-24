/**
 * Utility functions for SSO (Single Sign-On) callback handling
 */

/**
 * Checks if the current page is in an SSO callback state
 * @returns true if the current page is an SSO callback
 */
export function isSSOCallback(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.location.pathname.includes('sso-callback') ||
    window.location.pathname.includes('oauth_callback') ||
    window.location.search.includes('__clerk_status')
  );
}

/**
 * Server-side version of isSSOCallback for use in middleware
 * @param pathname - The pathname to check
 * @param search - The search string to check
 * @returns true if the path is an SSO callback
 */
export function isSSOCallbackServer(pathname: string, search: string): boolean {
  return (
    pathname.includes('sso-callback') ||
    pathname.includes('oauth_callback') ||
    search.includes('__clerk_status')
  );
}

/**
 * Checks if the current page is a Clerk catchall route
 * @returns true if the current page is a Clerk catchall route
 */
export function isClerkCatchallRoute(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.location.pathname.includes('clerk_catchall') ||
    window.location.pathname.includes('SignUp_clerk_catchall') ||
    window.location.pathname.includes('SignIn_clerk_catchall')
  );
}

/**
 * Server-side version of isClerkCatchallRoute for use in middleware
 * @param pathname - The pathname to check
 * @returns true if the path is a Clerk catchall route
 */
export function isClerkCatchallRouteServer(pathname: string): boolean {
  return (
    pathname.includes('clerk_catchall') ||
    pathname.includes('SignUp_clerk_catchall') ||
    pathname.includes('SignIn_clerk_catchall')
  );
}

/**
 * Checks if the current page is any type of authentication callback
 * @returns true if the current page is an auth callback
 */
export function isAuthCallback(): boolean {
  return isSSOCallback() || isClerkCatchallRoute();
}

/**
 * Server-side version of isAuthCallback for use in middleware
 * @param pathname - The pathname to check
 * @param search - The search string to check
 * @returns true if the path is an auth callback
 */
export function isAuthCallbackServer(pathname: string, search: string): boolean {
  return isSSOCallbackServer(pathname, search) || isClerkCatchallRouteServer(pathname);
}
