import { useMutation, useQuery } from '@apollo/client';
import { SignInButton } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import React, { useState, useCallback, useMemo } from 'react';

import { useAuthContext } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notification-context';
import { logger } from '@lib/core/logger';
import { Button } from '@src/app/components/ui/button';
import { useToast } from '@src/app/components/ui/use-toast';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST,
} from '@src/lib/graphql/mutations';
import { GET_USER_FRIENDSHIPS } from '@src/lib/graphql/queries';
import { FRIENDSHIP_STATUS } from '@src/lib/types';
import type { IGetFriendshipsForUserResponse } from '@src/lib/types';
import type { Friendship } from '@src/lib/types/generated/graphql';

export function FriendRequestButton({ targetUserId }: { targetUserId: string }) {
  const { userId, isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const { data: userData, loading: isLoadingFriendships } =
    useQuery<IGetFriendshipsForUserResponse>(GET_USER_FRIENDSHIPS, {
      variables: { userId: userId },
      skip: !userId,
    });

  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST);
  const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND_REQUEST);
  const [rejectFriendRequest] = useMutation(REJECT_FRIEND_REQUEST);

  const existingFriendship = useMemo(() => {
    if (!userData?.friendships) return null;
    return userData.friendships.find(
      (friendship: Friendship) =>
        (friendship.initiator.id === userId && friendship.recipient.id === targetUserId) ||
        (friendship.initiator.id === targetUserId && friendship.recipient.id === userId)
    );
  }, [userData?.friendships, userId, targetUserId]);

  const handleAddFriend = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      await sendFriendRequest({
        variables: {
          userId: targetUserId,
        },
      });

      addNotification({
        type: 'friend_request',
        title: 'Friend Request Sent',
        message: `Your friend request has been sent.`,
        userId,
      });

      toast({
        title: 'Friend request sent!',
        description: 'The user will be notified of your request.',
      });
    } catch (error) {
      logger.error('Error sending friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send friend request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, targetUserId, sendFriendRequest, addNotification, toast]);

  const handleAcceptRequest = useCallback(async () => {
    if (!existingFriendship) return;
    setIsLoading(true);

    try {
      await acceptFriendRequest({
        variables: {
          friendshipId: existingFriendship.id,
        },
      });

      addNotification({
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: 'You are now friends.',
        userId,
      });

      toast({
        title: 'Friend request accepted!',
        description: 'You are now friends.',
      });
    } catch (error) {
      logger.error('Error accepting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept friend request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [existingFriendship, acceptFriendRequest, addNotification, toast, userId]);

  const handleRejectRequest = useCallback(async () => {
    if (!existingFriendship) return;
    setIsLoading(true);

    try {
      await rejectFriendRequest({
        variables: {
          friendshipId: existingFriendship.id,
        },
      });

      addNotification({
        type: 'friend_rejected',
        title: 'Friend Request Rejected',
        message: `You have rejected the friend request.`,
        userId,
      });

      toast({
        title: 'Friend request rejected',
        description: 'The request has been rejected.',
      });
    } catch (error) {
      logger.error('Error rejecting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject friend request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [existingFriendship, rejectFriendRequest, addNotification, toast, userId]);

  if (!isAuthenticated) {
    return (
      <SignInButton mode="modal">
        <Button variant="outline" size="sm">
          Sign in to Add Friend
        </Button>
      </SignInButton>
    );
  }

  if (isLoadingFriendships) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (existingFriendship) {
    switch (existingFriendship.status) {
      case FRIENDSHIP_STATUS.PENDING:
        if (existingFriendship.initiator.id === userId) {
          return (
            <Button variant="outline" size="sm" disabled>
              Request Sent
            </Button>
          );
        }
        return (
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={handleAcceptRequest} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept'
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRejectRequest}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject'
              )}
            </Button>
          </div>
        );
      case FRIENDSHIP_STATUS.ACCEPTED:
        return (
          <Button variant="outline" size="sm" disabled>
            Friends
          </Button>
        );
      case FRIENDSHIP_STATUS.REJECTED:
        return (
          <Button variant="outline" size="sm" disabled>
            Request Rejected
          </Button>
        );
      case FRIENDSHIP_STATUS.BLOCKED:
        return (
          <Button variant="outline" size="sm" disabled>
            Request Blocked
          </Button>
        );
      default:
        return null;
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleAddFriend} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : (
        'Add Friend'
      )}
    </Button>
  );
}
