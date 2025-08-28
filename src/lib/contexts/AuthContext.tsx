'use client';
import { useUser } from '@clerk/nextjs';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface IAuthContextValue {
  isAuthenticated: boolean;
  user: unknown;
  isLoading: boolean;
  authError: string | null;
  hasPermission: (permission: string) => boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);

      // Check for auth state inconsistencies
      if (user && !isSignedIn) {
        setAuthError('Authentication state mismatch - user exists but not signed in');
      } else if (!user && isSignedIn) {
        setAuthError('Authentication state mismatch - signed in but no user data');
      } else {
        setAuthError(null);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Extract user roles from session claims
    const userRoles = (user.publicMetadata?.roles as string[]) || [];

    switch (permission) {
      case 'admin':
        return userRoles.includes('admin') || userRoles.includes('Admin');
      case 'moderator':
        return userRoles.includes('moderator') || userRoles.includes('admin');
      default:
        return isSignedIn;
    }
  };

  const refreshAuth = (): Promise<void> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // Force a refresh by reloading the page
      // In a real implementation, you might call Clerk's refresh methods
      window.location.reload();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to refresh authentication');
    } finally {
      setIsLoading(false);
    }
    return Promise.resolve();
  };

  const logout = (): Promise<void> => {
    try {
      // Clerk handles logout automatically when you call their signOut method
      // This would be called from a sign-out button component
      window.location.href = '/sign-in';
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to sign out');
    }
    return Promise.resolve();
  };

  const contextValue: IAuthContextValue = {
    isAuthenticated: Boolean(isSignedIn && user),
    user,
    isLoading,
    authError,
    hasPermission,
    refreshAuth,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): IAuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
