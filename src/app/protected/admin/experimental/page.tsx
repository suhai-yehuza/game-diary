'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function AdminExperimentalPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    const emailAddress = user?.emailAddresses[0].emailAddress;
    if (!emailAddress || !adminEmails.includes(emailAddress)) {
      router.push('/');
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
      <div className="p-8 text-center">
        <h2 className="text-xl mb-4">External API Testing</h2>
        <p className="text-gray-600 dark:text-gray-400">
          This page will be used for testing external API integrations.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          API testing functionality will be implemented here.
        </p>
      </div>
    </div>
  );
}
