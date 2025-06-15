'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import React, { createContext, useContext, useEffect, useState } from 'react';

import type { IAuthContextType } from '@src/lib/types/user.types';

const IAuthContext = createContext<IAuthContextType>({
  user: null,
  loading: false,
  userId: '',
  isAuthenticated: false,
});

// Re-export useAuth from Clerk
export { useAuth };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { userId, isSignedIn } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const [authState, setAuthState] = useState<IAuthContextType>({
    user: null,
    loading: !isLoaded,
    userId: userId || '',
    isAuthenticated: isSignedIn || false,
  });

  useEffect(() => {
    setAuthState({
      user: clerkUser
        ? {
            id: clerkUser.id,
            username: clerkUser.username ?? undefined,
            email: clerkUser.emailAddresses[0]?.emailAddress,
          }
        : null,
      loading: !isLoaded,
      userId: userId || '',
      isAuthenticated: isSignedIn || false,
    });
  }, [userId, isSignedIn, clerkUser, isLoaded]);

  return <IAuthContext.Provider value={authState}>{children}</IAuthContext.Provider>;
}

export const useAuthContext = () => useContext(IAuthContext);
