import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const authData = await (auth as () => Promise<{ userId: string | null }>)();

  if (!authData.userId) {
    redirect('/'); // Redirect to home, where Clerk modal can be triggered
  }

  return <>{children}</>;
}
