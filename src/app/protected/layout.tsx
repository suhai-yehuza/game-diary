import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import React from 'react';

import SignInModalTrigger from '@/app/components/auth/SignInModalTrigger';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Check for Vercel automation bypass
  const headersList = await headers();
  const bypassSecret = headersList.get('x-vercel-protection-bypass');

  if (
    bypassSecret &&
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET &&
    bypassSecret === process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  ) {
    console.log('🔐 Vercel automation bypass active in layout - skipping auth check');
    return <>{children}</>;
  }

  const authData = await (auth as () => Promise<{ userId: string | null }>)();

  if (!authData.userId) {
    // Automatically open Clerk's built-in modal sign-in
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <SignInModalTrigger />
        <div className="text-center mt-8">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6 text-muted-foreground">You must be signed in to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
