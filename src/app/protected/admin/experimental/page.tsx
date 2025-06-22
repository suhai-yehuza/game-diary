'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect, Suspense } from 'react';

function AdminExperimentalContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    const emailAddress = user?.emailAddresses[0].emailAddress;
    if (!emailAddress || !adminEmails.includes(emailAddress)) {
      router.push('/');
      return;
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Experimental</h1>
      </div>

      <div className="rounded-md border p-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Hello World</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This is an experimental admin page for testing and development purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminExperimentalPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        </div>
      }
    >
      <AdminExperimentalContent />
    </Suspense>
  );
}
