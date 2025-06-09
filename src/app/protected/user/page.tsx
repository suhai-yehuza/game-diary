import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

import UserProfile from '@/app/protected/user/user-profile';
import UserProfileLayout from '@/app/protected/user/user-profile-layout';

export default async function UserProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <UserProfileLayout title="Your Profile">
      <UserProfile targetUserId={userId} />
    </UserProfileLayout>
  );
}
