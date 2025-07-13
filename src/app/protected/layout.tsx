import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

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
    redirect('/'); // Redirect to home, where Clerk modal can be triggered
  }

  return <>{children}</>;
}
