'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth } from '@clerk/nextjs';

interface AuthContextType {
  userId: string;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  userId: '',
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { userId, isSignedIn } = useClerkAuth();
  const [authState, setAuthState] = useState<AuthContextType>({
    userId: userId || '',
    isAuthenticated: isSignedIn || false,
  });

  useEffect(() => {
    setAuthState({
      userId: userId || '',
      isAuthenticated: isSignedIn || false,
    });
  }, [userId, isSignedIn]);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
