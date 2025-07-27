'use client';
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the client-side auth guard to avoid SSR issues
const ClientAuthGuard = dynamic(() => import('@/app/protected/ClientAuthGuard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading authentication...</p>
      </div>
    </div>
  ),
});

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return <ClientAuthGuard>{children}</ClientAuthGuard>;
}
