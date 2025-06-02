'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import React, { createContext, useContext, useEffect, useState } from 'react';

import type { AuthContextType } from '@/lib/types/auth.types';

const AuthContext = createContext<AuthContextType>({
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
  const [authState, setAuthState] = useState<AuthContextType>({
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

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
