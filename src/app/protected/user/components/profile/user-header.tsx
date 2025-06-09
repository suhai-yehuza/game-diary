import { formatDistanceToNow } from 'date-fns';
import { Users, Trophy, Clock } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar';
import { Card, CardContent } from '@src/components/ui/card';

interface UserHeaderProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    last_sign_in_at: number;
    createdAt: number;
  };
  stats: {
    totalGames: number;
    totalFriends: number;
    totalHours: number;
  };
}

export function UserHeader({ user, stats }: UserHeaderProps) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Anonymous User';
  const lastActive = formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true });
  const memberSince = formatDistanceToNow(new Date(user.createdAt), { addSuffix: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.imageUrl} alt={fullName} />
          <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{fullName}</h2>
          <p className="text-muted-foreground">Last active {lastActive}</p>
          <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Games</p>
                <p className="text-2xl font-bold">{stats.totalGames}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Friends</p>
                <p className="text-2xl font-bold">{stats.totalFriends}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
