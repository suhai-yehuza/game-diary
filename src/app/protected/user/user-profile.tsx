'use client';

import { useQuery } from '@apollo/client/react/hooks';
import { useUser } from '@clerk/nextjs';
import React from 'react';

import { Skeleton } from '@src/app/components/ui/skeleton';
import { GET_USER } from '@src/lib/graphql/queries';
import type { IUserProfileProps, GetUserQuery, GetUserQueryVariables } from '@src/lib/types';

import { ErrorBoundary } from './components/error-boundary';
import { GameLogsSection } from './components/game-logs/game-logs-section';
import { FriendshipManagement } from './components/profile/friendship-management';
import { UserHeader } from './components/profile/user-header';

/**
 * A component that displays a user's profile, including their header information,
 * friendship management (if viewing another user's profile), and game logs.
 */
export default function UserProfile({ targetUserId }: IUserProfileProps) {
  const { user: currentUser } = useUser();

  const {
    data: userData,
    loading,
    error,
  } = useQuery<GetUserQuery, GetUserQueryVariables>(GET_USER, {
    variables: {
      id: targetUserId,
    },
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800">Error loading profile</h2>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  if (!userData?.user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800">User not found</h2>
        <p className="mt-2 text-sm text-yellow-600">
          The requested user profile could not be found.
        </p>
      </div>
    );
  }

  const user = {
    ...userData.user,
    id: (userData.user as unknown as { id: string }).id,
    username: (userData.user as unknown as { username: string }).username,
    first_name: ((userData.user as Record<string, unknown>).first_name as string) || undefined,
    last_name: ((userData.user as Record<string, unknown>).last_name as string) || undefined,
    image_url:
      ((userData.user as Record<string, unknown>).image_url as string) || '/default-avatar.png',
    last_sign_in_at: new Date().getTime(),
    createdAt: new Date().getTime(),
    comments: [],
    friendships: [],
    gameLogs: [],
    initiatedFriendships: [],
    email_verified: false,
    email_verification_strategy: null,
    external_id: null,
    password_enabled: false,
    two_factor_enabled: false,
    banned: false,
    deletedAt: null,
    updatedAt: new Date().toISOString(),
    reactions: [],
    __typename: 'DBUser' as const,
  };

  const stats = {
    totalGames: 0,
    totalFriends: 0,
    totalHours: 0,
  };

  const isCurrentUser = currentUser?.id === targetUserId;

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <UserHeader
          user={{
            ...user,
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            image_url: user.image_url ?? '',
          }}
          stats={stats}
          isOwnProfile={isCurrentUser}
          currentUserId={currentUser?.id || ''}
        />
        {!isCurrentUser && (
          <FriendshipManagement
            targetUserId={targetUserId}
            currentUserId={currentUser?.id || ''}
            friendship={null}
            onFriendshipUpdate={() => {}}
          />
        )}
        <GameLogsSection
          userId={targetUserId}
          currentUser={
            currentUser
              ? {
                  id: currentUser.id,
                  username: currentUser.username || '',
                  imageUrl: currentUser.imageUrl || '',
                }
              : undefined
          }
        />
      </div>
    </ErrorBoundary>
  );
}
