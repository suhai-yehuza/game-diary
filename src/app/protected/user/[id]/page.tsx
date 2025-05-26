import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

import UserProfile from '@/app/protected/user/user-profile';
import { UserPageProps } from '@/lib/types/user.types';

export default async function UserProfilePage({ params }: UserPageProps) {
  const { userId } = await auth();
  const { id } = params;

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-foreground">User Profile</h1>
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
            <UserProfile targetUserId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
