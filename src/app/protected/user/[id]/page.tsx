import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

import UserProfile from '@/app/protected/user/user-profile';
import UserProfileLayout from '@/app/protected/user/user-profile-layout';
import type { IUserPageProps } from '@src/lib/types/user.types';

export default async function UserProfilePage({ params }: IUserPageProps) {
  const { userId } = await auth();
  const { id } = params;

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <UserProfileLayout title="User Profile">
      <UserProfile targetUserId={id} />
    </UserProfileLayout>
  );
}
