import { useMutation } from '@apollo/client/react/hooks';
import { UserPlus, UserX } from 'lucide-react';
import React from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '@src/app/components/ui/button';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '@src/lib/graphql/mutations';
import { GET_USER_FRIENDSHIPS } from '@src/lib/graphql/queries';
import { FRIENDSHIP_STATUS } from '@src/lib/types';
import type { IFriendshipManagementProps } from '@src/lib/types';

export function FriendshipManagement({
  currentUserId,
  targetUserId,
  friendship,
  onFriendshipUpdate,
}: IFriendshipManagementProps) {
  const isPendingFromCurrentUser = friendship?.initiator.id === currentUserId;

  // Send friend request mutation
  const [sendFriendRequest, { loading: sendingRequest }] = useMutation(SEND_FRIEND_REQUEST, {
    onCompleted: data => {
      if (data?.sendFriendRequest?.friendship) {
        if (onFriendshipUpdate) {
          onFriendshipUpdate(data.sendFriendRequest.friendship);
        }
        toast.success('Friend request sent!');
      }
    },
    onError: error => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_USER_FRIENDSHIPS, variables: { userId: currentUserId } }],
  });

  // Accept friend request mutation
  const [acceptFriendRequest, { loading: acceptingRequest }] = useMutation(ACCEPT_FRIEND_REQUEST, {
    onCompleted: data => {
      if (data?.acceptFriendRequest?.friendship) {
        if (onFriendshipUpdate) {
          onFriendshipUpdate(data.acceptFriendRequest.friendship);
        }
        toast.success('Friend request accepted!');
      }
    },
    onError: error => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_USER_FRIENDSHIPS, variables: { userId: currentUserId } }],
  });

  // Remove friend mutation
  const [removeFriend, { loading: removingFriend }] = useMutation(REMOVE_FRIEND, {
    onCompleted: () => {
      if (onFriendshipUpdate) {
        onFriendshipUpdate(null);
      }
      toast.success('Friend removed');
    },
    onError: error => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_USER_FRIENDSHIPS, variables: { userId: currentUserId } }],
  });

  const handleSendFriendRequest = () => {
    if (!currentUserId) return;
    sendFriendRequest({
      variables: {
        userId: targetUserId,
      },
    });
  };

  const handleAcceptFriendRequest = () => {
    if (!friendship?.id) return;
    acceptFriendRequest({
      variables: {
        friendshipId: friendship.id,
      },
    });
  };

  const handleRemoveFriend = () => {
    if (!friendship?.id) return;
    removeFriend({
      variables: {
        friendshipId: friendship.id,
      },
    });
  };

  if (!currentUserId || currentUserId === targetUserId) {
    return null;
  }

  const isLoading = sendingRequest || acceptingRequest || removingFriend;

  if (isLoading) {
    return (
      <Button disabled variant="outline" size="sm">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100 mr-2"></div>
        Loading...
      </Button>
    );
  }

  if (!friendship) {
    return (
      <Button
        onClick={handleSendFriendRequest}
        disabled={isLoading}
        variant="default"
        size="sm"
        className="gap-2"
      >
        <UserPlus className="h-4 w-4" />
        {isLoading ? 'Sending...' : 'Add Friend'}
      </Button>
    );
  }

  switch (friendship.status) {
    case FRIENDSHIP_STATUS.PENDING:
      if (isPendingFromCurrentUser) {
        return (
          <Button
            onClick={handleRemoveFriend}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <UserX className="h-4 w-4" />
            {isLoading ? 'Canceling...' : 'Cancel Request'}
          </Button>
        );
      } else {
        return (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleAcceptFriendRequest}
              disabled={acceptingRequest || removingFriend}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {acceptingRequest ? 'Accepting...' : 'Accept Request'}
            </Button>
            <Button
              onClick={() => {
                if (onFriendshipUpdate) {
                  onFriendshipUpdate(null);
                }
              }}
              disabled={acceptingRequest || removingFriend}
              variant="outline"
              size="sm"
            >
              Decline
            </Button>
          </div>
        );
      }

    case FRIENDSHIP_STATUS.ACCEPTED:
      return (
        <Button
          onClick={handleRemoveFriend}
          disabled={removingFriend || acceptingRequest}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          {removingFriend ? 'Removing...' : 'Remove Friend'}
        </Button>
      );

    case FRIENDSHIP_STATUS.REJECTED:
      return (
        <Button disabled variant="outline" size="sm">
          Request Rejected
        </Button>
      );

    case FRIENDSHIP_STATUS.BLOCKED:
      return (
        <Button variant="outline" size="sm" disabled className="gap-2">
          <UserX className="h-4 w-4" />
          Blocked
        </Button>
      );

    default:
      return null;
  }
}
