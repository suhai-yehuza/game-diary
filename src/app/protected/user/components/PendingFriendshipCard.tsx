'use client';

import { UserPlus, UserX } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/Card';
import type { IFriendship } from '@/lib/types';

export interface IPendingFriendshipCardProps {
  pending: IFriendship;
  onWithdraw: (friendshipId: string, context?: 'cancel-request' | 'remove-friend') => Promise<void>;
  loading: boolean;
  onSendRequest: (friendId: string) => Promise<void>;
}

export function PendingFriendshipCard({
  pending,
  onWithdraw,
  loading,
  onSendRequest,
}: IPendingFriendshipCardProps) {
  const [isOperating, setIsOperating] = useState(false);
  const [requestCancelled, setRequestCancelled] = useState(false);
  const recipient = pending.recipient;
  const recipientName =
    (`${recipient?.first_name ?? ''} ${recipient?.last_name ?? ''}`.trim() ||
      recipient?.username) ??
    'Unknown User';
  const recipientUsername = recipient?.username ?? '';

  const handleCancelRequest = async () => {
    setIsOperating(true);
    try {
      await onWithdraw(pending.id, 'cancel-request');
      setRequestCancelled(true);
    } catch (error) {
      console.error('Error canceling request:', error);
    } finally {
      setIsOperating(false);
    }
  };

  const handleSendRequest = async () => {
    if (!recipient?.id) {
      toast.error('Invalid recipient');
      return;
    }
    setIsOperating(true);
    try {
      await onSendRequest(recipient.id);
      setRequestCancelled(false);
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Failed to send friend request');
    } finally {
      setIsOperating(false);
    }
  };

  if (requestCancelled) {
    return (
      <Card className="hover:bg-gray-800/50 transition-all duration-200 border-gray-700 hover:border-gray-600">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image
              src={recipient?.image_url ?? '/avatars/default-user-avatar.svg'}
              alt={recipientName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full ring-2 ring-gray-600 hover:ring-blue-500 transition-all duration-200"
            />
            <div>
              <p className="font-medium text-white">{recipientName}</p>
              <p className="text-sm text-gray-400">@{recipientUsername}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              void handleSendRequest();
            }}
            disabled={loading || isOperating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 transform hover:scale-105 whitespace-nowrap"
          >
            {loading || isOperating ? (
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
            ) : (
              <UserPlus className="h-3 w-3" />
            )}
            Add Friend
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:bg-gray-800/50 transition-all duration-200 border-gray-700 hover:border-gray-600">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Image
            src={recipient?.image_url ?? '/avatars/default-user-avatar.svg'}
            alt={recipientName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full ring-2 ring-gray-600 hover:ring-orange-500 transition-all duration-200"
          />
          <div>
            <p className="font-medium text-white">{recipientName}</p>
            <p className="text-sm text-gray-400">@{recipientUsername}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void handleCancelRequest();
          }}
          disabled={loading || isOperating}
          className="text-orange-500 border-orange-500 hover:bg-orange-500/10 hover:border-orange-400 transition-all duration-300 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
        >
          {loading || isOperating ? (
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent mr-2" />
          ) : (
            <UserX className="h-3 w-3" />
          )}
          Cancel Request
        </Button>
      </CardContent>
    </Card>
  );
}
