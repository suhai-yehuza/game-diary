'use client';

import { UserPlus } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { useFriendshipStatus } from '@/hooks/use-friendships';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { IUserSearchResultCardProps } from '@/types';

export function UserSearchResultCard({
  user,
  currentUserId,
  onSendRequest,
  onRemoveFriend,
  loading,
}: IUserSearchResultCardProps) {
  const [requestSent, setRequestSent] = useState(false);
  const [currentFriendshipId, setCurrentFriendshipId] = useState<string | null>(null);
  const [isOperating, setIsOperating] = useState(false);
  const validUserId = user.id?.trim();
  const friendshipStatus = useFriendshipStatus(validUserId || '');
  const { status } = friendshipStatus;
  const userName =
    (`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.username) ?? 'Unknown User';
  const userUsername = user.username ?? '';

  const handleSendRequest = async () => {
    setIsOperating(true);
    setRequestSent(true);
    try {
      await onSendRequest(user.id, () => {
        void friendshipStatus.refetch();
      });
      const refetchResult = await friendshipStatus.refetch();
      if (refetchResult?.data?.friendshipStatus?.friendshipId) {
        setCurrentFriendshipId(refetchResult.data.friendshipStatus.friendshipId);
      }
    } catch {
      setRequestSent(false);
      toast.error('Failed to send friend request');
    } finally {
      setIsOperating(false);
    }
  };

  const handleCancelRequest = async () => {
    const friendshipId = currentFriendshipId || status?.friendshipId;
    if (!friendshipId) {
      toast.error('No friendship found to cancel');
      return;
    }
    try {
      setIsOperating(true);
      await onRemoveFriend(friendshipId, 'cancel-request');
      setRequestSent(false);
      setCurrentFriendshipId(null);
      await friendshipStatus.refetch();
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'React Component',
        action: 'Cancel friend request',
      });
    } finally {
      setIsOperating(false);
    }
  };

  useEffect(() => {
    if (isOperating) return;
    if (status?.status === 'PENDING' && status?.isInitiator && !requestSent) {
      setRequestSent(true);
      setCurrentFriendshipId(status.friendshipId || null);
    } else if ((status?.status === 'ACCEPTED' || status?.status === 'REJECTED') && requestSent) {
      setRequestSent(false);
      setCurrentFriendshipId(null);
    }
  }, [status?.status, status?.isInitiator, status?.friendshipId, isOperating, requestSent]);

  const getActionButton = () => {
    if (user.id === currentUserId) {
      return <span className="text-sm text-gray-400 italic">This is you</span>;
    }
    if (status?.status === 'ACCEPTED') {
      return (
        <span className="text-sm text-green-500 font-medium bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
          Friends
        </span>
      );
    }
    if (status?.status === 'PENDING' && !status?.isInitiator) {
      return (
        <span className="text-sm text-blue-500 font-medium bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Request Received
        </span>
      );
    }
    const shouldShowCancel = requestSent || (status?.status === 'PENDING' && status?.isInitiator);
    if (shouldShowCancel) {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => void handleCancelRequest()}
          disabled={loading}
          className="text-yellow-500 border-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-300 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-500 border-t-transparent mr-2" />
          ) : null}
          Cancel Request
        </Button>
      );
    }
    return (
      <Button
        size="sm"
        onClick={() => void handleSendRequest()}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 transform hover:scale-105 whitespace-nowrap"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
        ) : (
          <UserPlus className="h-3 w-3" />
        )}
        Add Friend
      </Button>
    );
  };

  return (
    <Card className="hover:bg-gray-800/50 transition-all duration-200 border-gray-700 hover:border-gray-600">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Image
            src={user.image_url ?? '/avatars/default-user-avatar.svg'}
            alt={userName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full ring-2 ring-gray-600 hover:ring-blue-500 transition-all duration-200"
          />
          <div>
            <p className="font-medium text-white">{userName}</p>
            <p className="text-sm text-gray-400">@{userUsername}</p>
          </div>
        </div>
        {getActionButton()}
      </CardContent>
    </Card>
  );
}
