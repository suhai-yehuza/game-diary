'use client';

import { useQuery } from '@apollo/client/react/hooks';
import { useUser } from '@clerk/nextjs';
import React from 'react';

import { ErrorBoundary } from './components/error-boundary';
import { FriendshipManagement } from './components/profile/friendship-management';
import { GameLogsSection } from './components/game-logs/game-logs-section';
import { UserHeader } from './components/profile/user-header';
import { GET_USER } from '@src/lib/graphql/queries';
import type { GetUserQuery, GetUserQueryVariables } from '@src/lib/types/generated/graphql';
import { Skeleton } from '@src/components/ui/skeleton';

interface UserProfileProps {
  targetUserId: string;
}

/**
 * A component that displays a user's profile, including their header information,
 * friendship management (if viewing another user's profile), and game logs.
 */
export default function UserProfile({ targetUserId }: UserProfileProps) {
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
    firstName: userData.user.firstName || null,
    lastName: userData.user.lastName || null,
    imageUrl: userData.user.imageUrl || '/default-avatar.png',
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
          user={user}
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
        <GameLogsSection userId={targetUserId} currentUserId={currentUser?.id || ''} />
      </div>
    </ErrorBoundary>
  );
}
