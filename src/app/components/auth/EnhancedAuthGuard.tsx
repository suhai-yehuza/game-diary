'use client';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { useAuthState } from '@/lib/hooks/useAuthState';
import type { IEnhancedAuthGuardProps } from '@/types';

export default function EnhancedAuthGuard({
  children,
  requireAuth = true,
  fallbackUrl = '/sign-in',
  showRetryButton = true,
}: IEnhancedAuthGuardProps) {
  const { isLoaded, isSignedIn, isAuthStable, authError, retryAuth } = useAuthState();

  // Loading state
  if (!isLoaded || !isAuthStable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-theme-secondary">
            {!isLoaded ? 'Loading authentication...' : 'Stabilizing auth state...'}
          </p>
          {authError && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">Detected: {authError}</p>
          )}
        </div>
      </div>
    );
  }

  // Authentication error state
  if (authError && showRetryButton) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-semantic-warning/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-semantic-warning" />
              </div>
              <div>
                <CardTitle className="text-xl text-amber-900 dark:text-amber-100">
                  Authentication Issue
                </CardTitle>
                <p className="text-amber-700 dark:text-amber-300 mt-1 text-sm">
                  We detected an authentication state mismatch
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-theme-secondary mb-4">{authError}</p>
            <div className="flex gap-2">
              <Button onClick={retryAuth} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              <Link href={fallbackUrl}>
                <Button className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated state
  if (requireAuth && !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-semantic-info/10 rounded-full">
                <Shield className="w-6 h-6 text-semantic-info" />
              </div>
              <div>
                <CardTitle className="text-xl">Sign In Required</CardTitle>
                <p className="text-theme-secondary mt-1 text-sm">
                  You must be signed in to view this page
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href={fallbackUrl}>
              <Button className="w-full">Sign In to Continue</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
