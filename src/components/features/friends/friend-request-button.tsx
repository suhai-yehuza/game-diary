import { useMutation, useQuery } from '@apollo/client';
import { SignInButton } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import React, { useState, useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { SEND_FRIEND_REQUEST, UPDATE_FRIENDSHIP_STATUS } from '@/lib/graphql/mutations';
import { GET_FRIENDSHIPS } from '@/lib/graphql/queries';
import { FRIENDSHIP_STATUS } from '@/lib/types/config.types';
import {
  FriendRequestButtonProps,
  GetFriendshipsForUserResponse,
} from '@/lib/types/consolidated.types';
import { Friendship } from '@/lib/types/generated/graphql';

export function FriendRequestButton({ targetUserId }: FriendRequestButtonProps) {
  const { userId, isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const { data: userData, loading: isLoadingFriendships } = useQuery<GetFriendshipsForUserResponse>(
    GET_FRIENDSHIPS,
    {
      variables: { user_id: userId },
      skip: !userId,
    }
  );

  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST);
  const [updateFriendshipStatus] = useMutation(UPDATE_FRIENDSHIP_STATUS);

  const existingFriendship = useMemo(() => {
    if (!userData?.friendships) return null;
    return userData.friendships.find(
      (friendship: Friendship) =>
        (friendship.subscriberId === userId && friendship.userId === targetUserId) ||
        (friendship.subscriberId === targetUserId && friendship.userId === userId)
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
      console.error('Error sending friend request:', error);
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
      await updateFriendshipStatus({
        variables: {
          id: existingFriendship.id,
          status: FRIENDSHIP_STATUS.ACCEPTED,
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
      console.error('Error accepting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept friend request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [existingFriendship, updateFriendshipStatus, addNotification, toast, userId]);

  const handleRejectRequest = useCallback(async () => {
    if (!existingFriendship) return;
    setIsLoading(true);

    try {
      await updateFriendshipStatus({
        variables: {
          id: existingFriendship.id,
          status: FRIENDSHIP_STATUS.REJECTED,
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
      console.error('Error rejecting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject friend request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [existingFriendship, updateFriendshipStatus, addNotification, toast, userId]);

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
        if (existingFriendship.subscriberId === userId) {
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
