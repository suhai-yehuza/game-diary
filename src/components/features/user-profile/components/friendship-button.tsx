'use client';

import { useMutation } from '@apollo/client';
import { UserPlus, UserX } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@src/components/ui/button';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '@src/lib/graphql/mutations';
import { GET_USER_FRIENDSHIPS } from '@src/lib/graphql/queries';
import { FRIENDSHIP_STATUS } from '@src/lib/types/config.types';
import type { Friendship, FriendshipStatus } from '@src/lib/types/generated/graphql';

interface FriendshipButtonProps {
  isOwnProfile: boolean;
  friendshipStatus: FriendshipStatus | null | 'loading';
  currentFriendship: Friendship | null;
  dbUserId: string | null;
  currentUserDbId: string | null;
  onFriendshipChange: (friendship: Friendship | null, status: FriendshipStatus | null) => void;
}

export function FriendshipButton({
  isOwnProfile,
  friendshipStatus,
  currentFriendship,
  dbUserId,
  currentUserDbId,
  onFriendshipChange,
}: FriendshipButtonProps) {
  const isPendingFromCurrentUser = currentFriendship?.initiator.id === currentUserDbId;

  // Send friend request mutation
  const [sendFriendRequest, { loading: sendingRequest }] = useMutation(SEND_FRIEND_REQUEST, {
    onCompleted: data => {
      if (data?.sendFriendRequest?.friendship) {
        onFriendshipChange(
          data.sendFriendRequest.friendship,
          data.sendFriendRequest.friendship.status
        );
        toast.success('Friend request sent!');
      }
    },
    onError: error => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_USER_FRIENDSHIPS, variables: { userId: currentUserDbId } }],
  });

  // Accept friend request mutation
  const [acceptFriendRequest, { loading: acceptingRequest }] = useMutation(ACCEPT_FRIEND_REQUEST, {
    onCompleted: data => {
      if (data?.acceptFriendRequest?.friendship) {
        onFriendshipChange(
          data.acceptFriendRequest.friendship,
          data.acceptFriendRequest.friendship.status
        );
        toast.success('Friend request accepted!');
      }
    },
    onError: error => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_USER_FRIENDSHIPS, variables: { userId: currentUserDbId } }],
  });

  // Remove friend mutation
  const [removeFriend, { loading: removingFriend }] = useMutation(REMOVE_FRIEND, {
    onCompleted: () => {
      onFriendshipChange(null, null);
      toast.success('Friend removed');
    },
    onError: error => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_USER_FRIENDSHIPS, variables: { userId: currentUserDbId } }],
  });

  const handleSendFriendRequest = () => {
    if (dbUserId) {
      sendFriendRequest({ variables: { userId: dbUserId } });
    }
  };

  const handleAcceptFriendRequest = () => {
    if (currentFriendship?.id) {
      acceptFriendRequest({ variables: { friendshipId: currentFriendship.id } });
    }
  };

  const handleRemoveFriend = () => {
    if (currentFriendship?.id) {
      removeFriend({ variables: { friendshipId: currentFriendship.id } });
    }
  };

  if (isOwnProfile) return null;

  const isLoading = sendingRequest || acceptingRequest || removingFriend;

  switch (friendshipStatus) {
    case 'loading':
      return (
        <Button disabled variant="outline" size="sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100 mr-2"></div>
          Loading...
        </Button>
      );

    case null:
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
              onClick={() => onFriendshipChange(null, null)}
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
