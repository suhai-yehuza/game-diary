import { formatDistanceToNow } from 'date-fns';
import { Users, Trophy, Clock, Shield } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@src/app/components/ui/avatar';
import { Badge } from '@src/app/components/ui/badge';
import { Card, CardContent } from '@src/app/components/ui/card';
import type { IUserHeaderProps, GameLog } from '@src/lib/types';

import { GameLogModal } from '../game-logs/game-log-modal';

import { FriendshipManagement } from './friendship-management';

export function UserHeader({
  user,
  isOwnProfile,
  currentUserId,
  stats,
  onGameLogUpdate,
  onFriendshipUpdate,
}: IUserHeaderProps) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Anonymous User';
  const lastActive = formatDistanceToNow(
    new Date(user.last_sign_in_at || user.createdAt || Date.now()),
    {
      addSuffix: true,
    }
  );
  const memberSince = formatDistanceToNow(new Date(user.createdAt || Date.now()), {
    addSuffix: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.imageUrl || undefined} alt={fullName} />
          <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{fullName}</h2>
            {user.email_verified && (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Last active {lastActive}</p>
          <p className="text-sm text-muted-foreground">Member since {memberSince}</p>

          <div className="mt-4 flex gap-2">
            {isOwnProfile && onGameLogUpdate && (
              <GameLogModal
                mode="create"
                gameLog={{} as GameLog}
                isOpen={false}
                onClose={() => {}}
                onSuccess={onGameLogUpdate}
              />
            )}
            {!isOwnProfile && currentUserId && onFriendshipUpdate && (
              <FriendshipManagement
                currentUserId={currentUserId}
                targetUserId={user.id}
                friendship={undefined}
                onFriendshipUpdate={onFriendshipUpdate}
              />
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Games</p>
                <p className="text-2xl font-bold">{stats?.totalGames || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Friends</p>
                <p className="text-2xl font-bold">{stats?.totalFriends || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Hours</p>
                <p className="text-2xl font-bold">{stats?.totalHours || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
