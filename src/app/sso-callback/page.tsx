'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SSOCallbackPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleSSOCallback = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        // Add a small delay to ensure Clerk is fully loaded
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isLoaded) {
          if (isSignedIn) {
            // User is signed in, redirect to home page
            router.push('/');
          } else {
            // User is not signed in, redirect to sign-in page
            router.push('/sign-in');
          }
        }
      } catch (err) {
        console.error('SSO callback error:', err);
        setError('Authentication failed. Please try again.');
        // Redirect to sign-in page after error
        void setTimeout(() => {
          router.push('/sign-in');
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    void handleSSOCallback();
  }, [isSignedIn, isLoaded, router]);

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to sign-in page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">
          {isProcessing ? 'Completing authentication...' : 'Processing...'}
        </p>
        {!isLoaded && (
          <p className="mt-2 text-sm text-gray-500">Loading authentication status...</p>
        )}
      </div>
    </div>
  );
}
