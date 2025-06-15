import { useQuery, useMutation } from '@apollo/client/react/hooks';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { logger } from '@lib/core/logger';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '@src/lib/graphql/mutations';
import { GET_USER_FRIENDSHIPS } from '@src/lib/graphql/queries';
import type { IUseUserProfileProps, IUseUserProfileReturn } from '@src/lib/types';
import type { DbUser, Friendship, FriendshipStatus } from '@src/lib/types/generated/graphql';

export function useUserProfile({ targetUserId }: IUseUserProfileProps): IUseUserProfileReturn {
  const { user: currentUser } = useUser();
  const [targetUser, setTargetUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [currentUserDbId, setCurrentUserDbId] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null | 'loading'>(
    'loading'
  );
  const [currentFriendship, setCurrentFriendship] = useState<Friendship | null>(null);

  // Fetch current user's database ID
  useEffect(() => {
    const fetchCurrentUserDbId = async () => {
      if (currentUser?.id) {
        try {
          const response = await fetch(`/api/users/${currentUser.id}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentUserDbId(data.id);
          }
        } catch (error) {
          logger.error('Error fetching current user ID:', error);
        }
      }
    };
    fetchCurrentUserDbId();
  }, [currentUser?.id]);

  // Fetch target user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!targetUserId) {
        if (currentUser) {
          setTargetUser({
            id: currentUser.id,
            username: currentUser.username || '',
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
            emailAddress: currentUser.emailAddresses[0]?.emailAddress || '',
            imageUrl: currentUser.imageUrl,
            last_sign_in_at: currentUser.lastSignInAt
              ? new Date(currentUser.lastSignInAt)
              : new Date(),
            password_enabled: currentUser.passwordEnabled,
            two_factor_enabled: currentUser.twoFactorEnabled,
            email_verified: currentUser.emailAddresses[0]?.verification?.status === 'verified',
            email_verification_strategy:
              currentUser.emailAddresses[0]?.verification?.strategy || '',
            banned: false,
            comments: [],
            reactions: [],
            gameLogs: [],
            external_id: '',
            inboundFriendshipIds: [],
            outboundFriendshipIds: [],
            friendships: [],
            initiatedFriendships: [],
            createdAt: currentUser.createdAt ? new Date(currentUser.createdAt) : new Date(),
            updatedAt: currentUser.updatedAt ? new Date(currentUser.updatedAt) : new Date(),
            deletedAt: null,
            __typename: 'DBUser',
          });
        }
        // Fetch the current user's database record
        try {
          const response = await fetch(`/api/users/${currentUser?.id}`);
          if (response.ok) {
            const data = await response.json();
            setDbUserId(data.id);
          }
        } catch (error) {
          logger.error('Error fetching current user from database:', error);
        }
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${targetUserId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        setTargetUser(data);
        setDbUserId(data.id);
      } catch (error) {
        logger.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [targetUserId, currentUser]);

  // Fetch friendships for the current user
  useQuery(GET_USER_FRIENDSHIPS, {
    variables: { userId: currentUserDbId },
    skip: !currentUserDbId || !dbUserId,
    onCompleted: data => {
      if (data?.user && dbUserId && currentUserDbId) {
        const allFriendships = [
          ...(data.user.friendships || []),
          ...(data.user.initiatedFriendships || []),
        ];
        const friendship = allFriendships.find(
          (f: Friendship) =>
            (f.initiator.id === currentUserDbId && f.recipient.id === dbUserId) ||
            (f.recipient.id === currentUserDbId && f.initiator.id === dbUserId)
        );

        if (friendship) {
          setCurrentFriendship(friendship);
          setFriendshipStatus(friendship.status);
        } else {
          setFriendshipStatus(null);
        }
      } else if (!data?.user) {
        setFriendshipStatus(null);
      }
    },
  });

  // Send friend request mutation
  const [sendFriendRequest, { loading: sendingRequest }] = useMutation(SEND_FRIEND_REQUEST, {
    onCompleted: data => {
      if (data?.sendFriendRequest?.friendship) {
        setCurrentFriendship(data.sendFriendRequest.friendship);
        setFriendshipStatus(data.sendFriendRequest.friendship.status);
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
        setCurrentFriendship(data.acceptFriendRequest.friendship);
        setFriendshipStatus(data.acceptFriendRequest.friendship.status);
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
      setCurrentFriendship(null);
      setFriendshipStatus(null);
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

  const isOwnProfile = currentUser?.id === targetUserId || !targetUserId;

  return {
    targetUser,
    dbUserId,
    currentUserDbId,
    friendshipStatus,
    currentFriendship,
    isLoading,
    isOwnProfile,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRemoveFriend,
    sendingRequest,
    acceptingRequest,
    removingFriend,
  };
}
