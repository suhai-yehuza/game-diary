'use client';

import { Check, X } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/Card';
import type { IFriendship } from '@/lib/types';

export interface IFriendRequestCardProps {
  request: IFriendship;
  onAccept: (friendshipId: string) => Promise<void>;
  onReject: (friendshipId: string) => Promise<void>;
  loading: boolean;
}

export function FriendRequestCard({
  request,
  onAccept,
  onReject,
  loading,
}: IFriendRequestCardProps) {
  const requester = request.initiator;
  const requesterName =
    (`${requester?.first_name ?? ''} ${requester?.last_name ?? ''}`.trim() ||
      requester?.username) ??
    'Unknown User';
  const requesterUsername = requester?.username ?? '';

  return (
    <Card className="hover:bg-gray-800/50 transition-all duration-200 border-gray-700 hover:border-gray-600">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Image
            src={requester?.image_url ?? '/avatars/default-user-avatar.svg'}
            alt={requesterName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full ring-2 ring-gray-600 hover:ring-blue-500 transition-all duration-200"
          />
          <div>
            <p className="font-medium text-white">{requesterName}</p>
            <p className="text-sm text-gray-400">@{requesterUsername}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Incoming Request
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                void onAccept(request.id);
              }}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void onReject(request.id);
              }}
              disabled={loading}
              className="text-red-500 border-red-500 hover:bg-red-500/10 hover:border-red-400 transition-all duration-200 px-3 py-2 rounded-lg font-medium shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-500 border-t-transparent" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
