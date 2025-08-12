'use client';

import { MoreHorizontal, UserX } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/DropdownMenu';
import type { IFriendship } from '@/lib/types';

export interface IFriendshipCardProps {
  friendship: IFriendship;
  currentUserId: string;
  onRemove: (friendshipId: string) => Promise<void>;
  loading: boolean;
}

export function FriendshipCard({
  friendship,
  currentUserId,
  onRemove,
  loading,
}: IFriendshipCardProps) {
  const friend =
    friendship.initiator?.id === currentUserId ? friendship.recipient : friendship.initiator;
  const friendName =
    (`${friend?.first_name ?? ''} ${friend?.last_name ?? ''}`.trim() || friend?.username) ??
    'Unknown User';
  const friendUsername = friend?.username ?? '';

  return (
    <Card className="hover:bg-gray-800/50 transition-all duration-200 border-gray-700 hover:border-gray-600">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Image
            src={friend?.image_url ?? '/avatars/default-user-avatar.svg'}
            alt={friendName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full ring-2 ring-gray-600 hover:ring-green-500 transition-all duration-200"
          />
          <div>
            <p className="font-medium text-white">{friendName}</p>
            <p className="text-sm text-gray-400">@{friendUsername}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
            Friends
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                className="hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem
                onClick={() => {
                  void onRemove(friendship.id);
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10"
              >
                <UserX className="h-4 w-4 mr-2" />
                Remove Friend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
