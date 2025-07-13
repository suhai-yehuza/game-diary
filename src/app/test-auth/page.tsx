'use client';

import React from 'react';

import { useUser } from '@/app/components/providers/clerk-provider';
import type { IClerkUserData } from '@/lib/types';

export default function TestAuthPage() {
  const userResult = useUser() as {
    isLoaded?: boolean;
    isSignedIn?: boolean;
    user?: IClerkUserData | undefined;
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Authentication State:</h2>
        <p>
          <strong>isLoaded:</strong> {String(userResult.isLoaded)}
        </p>
        <p>
          <strong>isSignedIn:</strong> {String(userResult.isSignedIn)}
        </p>
        <p>
          <strong>Has User Data:</strong> {userResult.user ? 'Yes' : 'No'}
        </p>
      </div>

      {userResult.user && (
        <div className="bg-green-100 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">User Data:</h2>
          <p>
            <strong>ID:</strong> {userResult.user.id}
          </p>
          <p>
            <strong>Username:</strong> {userResult.user.username ?? 'Not set'}
          </p>
          <p>
            <strong>First Name:</strong> {userResult.user.first_name ?? 'Not set'}
          </p>
          <p>
            <strong>Last Name:</strong> {userResult.user.last_name ?? 'Not set'}
          </p>
          <p>
            <strong>Email Addresses:</strong> {userResult.user.email_addresses.length}
          </p>
          {userResult.user.email_addresses.length > 0 && (
            <p>
              <strong>Primary Email:</strong> {userResult.user.email_addresses[0].email_address}
            </p>
          )}
        </div>
      )}

      {!userResult.user && userResult.isLoaded && (
        <div className="bg-yellow-100 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">No User Data:</h2>
          <p>User is not signed in or no user data available.</p>
        </div>
      )}

      {!userResult.isLoaded && (
        <div className="bg-blue-100 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">Loading:</h2>
          <p>Authentication data is still loading...</p>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Raw userResult object:</h2>
        <pre className="text-xs text-left whitespace-pre-wrap">
          {JSON.stringify(userResult, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Environment Info:</h2>
        <p>
          <strong>NODE_ENV:</strong> {process.env.NODE_ENV ?? 'Not set'}
        </p>
        <p>
          <strong>Has Clerk Key:</strong>{' '}
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
}
