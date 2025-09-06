import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

import type { IAuthState, IUser } from '@/types';

/**
 * Enhanced authentication hook that provides more reliable auth state
 * with retry mechanism and stability detection
 */
export function useAuthState(): IAuthState {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isAuthStable, setIsAuthStable] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Track auth state stability (no changes for 1 second)
  useEffect(() => {
    setIsAuthStable(false);
    setAuthError(null);

    const stabilityTimer = setTimeout(() => {
      if (isLoaded) {
        setIsAuthStable(true);

        // If we have a user but isSignedIn is false, that's likely a sync issue
        if (user && !isSignedIn) {
          setAuthError('Authentication state mismatch detected');
        }
      }
    }, 1000);

    return () => clearTimeout(stabilityTimer);
  }, [isLoaded, isSignedIn, user]);

  const retryAuth = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setAuthError(null);
    setIsAuthStable(false);

    // Force a re-evaluation by refreshing the page in extreme cases
    if (retryCount >= 3) {
      window.location.reload();
    }
  }, [retryCount]);

  return {
    isLoaded,
    isSignedIn: isSignedIn || (isLoaded && !!user), // More permissive check
    user: user as IUser | null,
    session: null,
    organization: null,
    organizationMembership: null,
    isAuthStable,
    authError,
    retryAuth,
  };
}
