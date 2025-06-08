'use client';

import { Calendar, Shield } from 'lucide-react';

import { GameLogModal } from '@src/components/features/games';
import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar';
import { Badge } from '@src/components/ui/badge';
import type {
  GameLog,
  DbUser,
  Friendship,
  FriendshipStatus,
} from '@src/lib/types/generated/graphql';

import { FriendshipButton } from './friendship-button';

interface UserProfileHeaderProps {
  userProfile: DbUser;
  isOwnProfile: boolean;
  dbUserId: string | null;
  refetchUserGameLogs: () => void;
  friendshipProps: {
    friendshipStatus: FriendshipStatus;
    currentFriendship: Friendship | null;
    currentUserDbId: string | null;
    onFriendshipChange: (friendship: Friendship | null, status: FriendshipStatus | null) => void;
  };
}

export function UserProfileHeader({
  userProfile,
  isOwnProfile,
  dbUserId,
  refetchUserGameLogs,
  friendshipProps,
}: UserProfileHeaderProps) {
  return (
    <div className="bg-card border-b">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
            <AvatarImage src={userProfile?.imageUrl ?? undefined} />
            <AvatarFallback className="text-3xl">
              {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  {userProfile?.username || 'Unknown User'}
                  {userProfile?.email_verified && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </h1>
                {userProfile?.firstName || userProfile?.lastName ? (
                  <p className="text-muted-foreground">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </p>
                ) : null}
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4" />
                  Member since{' '}
                  {userProfile?.createdAt
                    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
              <div className="flex gap-2">
                {isOwnProfile && (
                  <GameLogModal
                    mode="create"
                    gameId={''}
                    gameLog={{} as GameLog}
                    onSuccess={() => {
                      refetchUserGameLogs();
                    }}
                  />
                )}
                <FriendshipButton
                  isOwnProfile={isOwnProfile}
                  dbUserId={dbUserId}
                  {...friendshipProps}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
