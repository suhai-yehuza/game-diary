import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

import UserProfile from '@/app/protected/user/user-profile';

export default async function UserProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Your Profile</h1>
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
            <UserProfile targetUserId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
