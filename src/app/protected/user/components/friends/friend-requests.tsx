import { useQuery, useMutation } from '@apollo/client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { useNotifications } from '@/contexts/notification-context';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '@src/lib/graphql/mutations';
import { GET_USER_FRIENDSHIPS } from '@src/lib/graphql/queries';
import { FRIENDSHIP_STATUS } from '@src/lib/types/config.types';
import type { Friendship } from '@src/lib/types/generated/graphql';
import type { ISortDirection } from '@src/lib/types/shared.types';
import type { IFriendRequest } from '@src/lib/types/social.types';

import { UserSearch } from './user-search';

export const FriendRequests: React.FC = () => {
  const [showSentRequests, setShowSentRequests] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'mutual'>('date');
  const [sortDirection, setSortDirection] = useState<ISortDirection>('desc');
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const { addNotification } = useNotifications();
  const [removeFriendLastUserId, setRemoveFriendLastUserId] = useState<string | null>(null);
  const { loading, error, data } = useQuery(GET_USER_FRIENDSHIPS);

  // Send friend request mutation
  const [sendFriendRequest, { loading: isSending }] = useMutation(SEND_FRIEND_REQUEST, {
    update: (cache, result) => {
      const newRequest = result.data?.friendship;
      if (newRequest) {
        cache.modify({
          fields: {
            friendRequests: (existingRequests = []) => {
              return [...existingRequests, newRequest];
            },
          },
        });
      }
    },
    onCompleted: data => {
      const request = data.friendship || {
        recipient: { id: 'unknown', firstName: '', lastName: '', imageUrl: '' },
      };
      const displayName = request.recipient?.firstName
        ? `${request.recipient.firstName} ${request.recipient.lastName || ''}`.trim()
        : 'User';
      addNotification({
        type: 'friend_request',
        title: 'Friend Request Sent',
        message: `Your friend request to ${displayName} has been sent.`,
        userId: request.recipient.id,
        metadata: {
          username: displayName,
          avatar: request.recipient?.imageUrl || '',
        },
      });
      toast.success('Friend request sent successfully');
      setShowSuggestions(false);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  // Accept friend request mutation
  const [acceptFriendRequest, { loading: isAccepting }] = useMutation(ACCEPT_FRIEND_REQUEST, {
    update: (cache, result) => {
      const updatedRequest = result.data?.friendship;
      if (updatedRequest) {
        cache.modify({
          id: cache.identify({ __typename: 'Friendship', id: updatedRequest.id }),
          fields: {
            status: () => updatedRequest.status,
            updatedAt: () => updatedRequest.updatedAt,
          },
        });
      }
    },
    onCompleted: data => {
      const request = data.friendship || {
        initiator: { id: 'unknown', firstName: null, lastName: null, imageUrl: null },
        recipient: { id: 'unknown', firstName: null, lastName: null, imageUrl: null },
      };
      const displayName = request.initiator?.firstName
        ? `${request.initiator.firstName} ${request.initiator.lastName || ''}`.trim()
        : 'User';
      addNotification({
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: `You are now friends with ${displayName}.`,
        userId: request.initiator.id,
        metadata: {
          username: displayName,
          avatar: request?.initiator?.imageUrl || '',
        },
      });
      toast.success('Friend request accepted');
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  // Reject friend request mutation
  const [rejectFriendRequest, { loading: isRejecting }] = useMutation(REJECT_FRIEND_REQUEST, {
    update: (cache, result) => {
      const updatedRequest = result.data?.friendship;
      if (updatedRequest) {
        cache.modify({
          id: cache.identify({ __typename: 'Friendship', id: updatedRequest.id }),
          fields: {
            status: () => updatedRequest.status,
            updatedAt: () => updatedRequest.updatedAt,
          },
        });
      }
    },
    onCompleted: data => {
      const request = data.friendship || {
        initiator: { id: 'unknown', firstName: null, lastName: null, imageUrl: null },
        recipient: { id: 'unknown', firstName: null, lastName: null, imageUrl: null },
      };
      const displayName = request.initiator?.firstName
        ? `${request.initiator.firstName} ${request.initiator.lastName || ''}`.trim()
        : 'User';
      addNotification({
        type: 'friend_rejected',
        title: 'Friend Request Rejected',
        message: `You have rejected the friend request from ${displayName}.`,
        userId: request.initiator.id,
        metadata: {
          username: displayName,
          avatar: request?.initiator?.imageUrl || '',
        },
      });
      toast.success('Friend request rejected');
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  // Remove friend mutation
  const [removeFriend, { loading: isRemoving }] = useMutation(REMOVE_FRIEND, {
    update: cache => {
      if (removeFriendLastUserId) {
        cache.modify({
          fields: {
            friendRequests: (existingRequests = []) => {
              return existingRequests.filter(
                (request: Friendship) => request.id !== removeFriendLastUserId
              );
            },
          },
        });
      }
    },
    onCompleted: () => {
      if (removeFriendLastUserId) {
        addNotification({
          type: 'friend_removed',
          title: 'Friend Removed',
          message: 'Friend has been removed from your friends list.',
          userId: removeFriendLastUserId || '',
          metadata: {},
        });
        toast.success('Friend removed successfully');
      }
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest({ variables: { userId } });
  };

  const handleAcceptRequest = async (request: IFriendRequest) => {
    await acceptFriendRequest({ variables: { requestId: request.id } });
  };

  const handleRejectRequest = async (requestId: string) => {
    // Add to removing items for animation
    setRemovingItems(prev => new Set(prev).add(requestId));
    // Wait for animation to complete
    setTimeout(async () => {
      await rejectFriendRequest({ variables: { requestId } });
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }, 300);
  };

  const handleRemoveFriend = async (userId: string) => {
    setRemoveFriendLastUserId(userId);
    setRemovingItems(prev => new Set(prev).add(userId));
    // Wait for animation to complete
    setTimeout(async () => {
      await removeFriend({ variables: { userId } });
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }, 300);
  };

  if (error) return <div>Error loading friend requests: {error.message}</div>;

  const friendRequests = data?.friendRequests || [];
  const pendingRequests = friendRequests.filter(
    (request: IFriendRequest) => request.status === FRIENDSHIP_STATUS.PENDING
  );
  const acceptedRequests = friendRequests.filter(
    (request: IFriendRequest) => request.status === FRIENDSHIP_STATUS.ACCEPTED
  );

  const filteredRequests = showSentRequests
    ? pendingRequests.filter((request: IFriendRequest) => request.sender.id === 'current-user-id')
    : pendingRequests.filter(
        (request: IFriendRequest) => request.receiver.id === 'current-user-id'
      );

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'date':
        return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'name':
        return direction * a.sender.username.localeCompare(b.sender.username);
      case 'mutual':
        return direction * ((a.mutualFriends || 0) - (b.mutualFriends || 0));
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <UserSearch
          onUserSelect={handleSendRequest}
          excludeIds={friendRequests.map((r: IFriendRequest) =>
            r.sender.id === 'current-user-id' ? r.receiver.id : r.sender.id
          )}
          users={data?.users || []}
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSentRequests(!showSentRequests)}
            className={`px-3 py-1 rounded transition-colors ${
              showSentRequests ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            {showSentRequests ? 'Show Received' : 'Show Sent'}
          </button>

          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`px-3 py-1 rounded transition-colors ${
              showSuggestions ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
          </button>

          <select
            value={filter}
            onChange={e => setFilter(e.target.value as 'all' | 'pending' | 'accepted')}
            className="px-3 py-1 rounded bg-gray-100"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'date' | 'name' | 'mutual')}
            className="px-3 py-1 rounded bg-gray-100"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="mutual">Sort by Mutual Friends</option>
          </select>

          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 rounded bg-gray-100"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Friend Requests List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {showSentRequests ? 'Sent Requests' : 'Received Requests'}
        </h2>

        {loading ? (
          <div className="loading p-4 rounded-lg bg-gray-100 animate-pulse" />
        ) : (
          <div className="space-y-4 stagger-children">
            {sortedRequests.map((request: IFriendRequest) => (
              <div
                key={request.id}
                className={`
                  bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all
                  animate-slide-in-up hover-lift
                  ${removingItems.has(request.id) ? 'animate-slide-out-up' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/protected/user/${showSentRequests ? request.receiver.id : request.sender.id}`}
                      className="transition-opacity hover:opacity-80"
                    >
                      <Image
                        src={
                          showSentRequests
                            ? request.receiver.avatar || '/default-avatar.png'
                            : request.sender.avatar || '/default-avatar.png'
                        }
                        alt={
                          showSentRequests
                            ? request.receiver.username || 'User'
                            : request.sender.username || 'User'
                        }
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full cursor-pointer"
                      />
                    </Link>
                    <div>
                      <Link
                        href={`/protected/user/${showSentRequests ? request.receiver.id : request.sender.id}`}
                        className="font-semibold hover:underline cursor-pointer"
                      >
                        {showSentRequests ? request.receiver.username : request.sender.username}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {showSentRequests ? 'Sent' : 'Received'}{' '}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      {request.mutualFriends && (
                        <p className="text-sm text-blue-500">
                          {request.mutualFriends} mutual friends
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {showSentRequests ? (
                      <button
                        onClick={() => handleRemoveFriend(request.receiver.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 tap-scale"
                        disabled={isRemoving}
                      >
                        Cancel
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(request)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 tap-scale"
                          disabled={isAccepting}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 tap-scale"
                          disabled={isRejecting}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friends List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Friends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {acceptedRequests.map((request: IFriendRequest) => {
            const friend =
              request.sender.id === 'current-user-id' ? request.receiver : request.sender;
            return (
              <div
                key={friend.id}
                className={`
                  p-4 bg-white rounded-lg shadow hover:shadow-md transition-all
                  animate-scale-in hover-lift
                  ${removingItems.has(friend.id) ? 'animate-scale-out' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image
                      src={friend.avatar || '/default-avatar.png'}
                      alt={friend.username || 'User'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold">{friend.username}</h3>
                      <p className="text-sm text-gray-500">
                        Friends since{' '}
                        {request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : ''}
                      </p>
                      {request.mutualFriends && (
                        <p className="text-sm text-blue-500">
                          {request.mutualFriends} mutual friends
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 tap-scale"
                    disabled={isRemoving}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading States */}
      {(isSending || isAccepting || isRejecting || isRemoving) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-overlay-show">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
