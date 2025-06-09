import { useMutation } from '@apollo/client/react/hooks';
import { UserPlus, UserX } from 'lucide-react';
import React from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '@src/components/ui/button';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '@src/lib/graphql/mutations';
import { FRIENDSHIP_STATUS } from '@src/lib/types/config.types';
import type { Friendship } from '@src/lib/types/generated/graphql';

interface FriendshipManagementProps {
  currentUserId: string | null;
  targetUserId: string;
  friendship: Friendship | null;
  onFriendshipUpdate: () => void;
}

export function FriendshipManagement({
  currentUserId,
  targetUserId,
  friendship,
  onFriendshipUpdate,
}: FriendshipManagementProps) {
  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST, {
    onCompleted: () => {
      toast.success('Friend request sent!');
      onFriendshipUpdate();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND_REQUEST, {
    onCompleted: () => {
      toast.success('Friend request accepted!');
      onFriendshipUpdate();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const [removeFriend] = useMutation(REMOVE_FRIEND, {
    onCompleted: () => {
      toast.success('Friend removed');
      onFriendshipUpdate();
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const handleSendFriendRequest = () => {
    if (!currentUserId) return;
    sendFriendRequest({
      variables: {
        input: {
          senderId: currentUserId,
          receiverId: targetUserId,
        },
      },
    });
  };

  const handleAcceptFriendRequest = () => {
    if (!friendship?.id) return;
    acceptFriendRequest({
      variables: {
        id: friendship.id,
      },
    });
  };

  const handleRemoveFriend = () => {
    if (!friendship?.id) return;
    removeFriend({
      variables: {
        id: friendship.id,
      },
    });
  };

  if (!currentUserId || currentUserId === targetUserId) {
    return null;
  }

  const renderFriendshipButton = () => {
    if (!friendship) {
      return (
        <Button onClick={handleSendFriendRequest} className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Friend
        </Button>
      );
    }

    switch (friendship.status) {
      case FRIENDSHIP_STATUS.PENDING:
        return (
          <Button onClick={handleAcceptFriendRequest} className="w-full">
            Accept Friend Request
          </Button>
        );
      case FRIENDSHIP_STATUS.ACCEPTED:
        return (
          <Button onClick={handleRemoveFriend} variant="destructive" className="w-full">
            <UserX className="mr-2 h-4 w-4" />
            Remove Friend
          </Button>
        );
      default:
        return null;
    }
  };

  return <div className="mt-4">{renderFriendshipButton()}</div>;
}
