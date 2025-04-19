import { useQuery, useMutation } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { useNotifications } from '@/contexts/NotificationContext';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '@/lib/graphql/mutations';
import { GET_FRIENDSHIPS } from '@/lib/graphql/queries';
import type { FriendRequest } from '@/lib/types/friend.types';
import { Friendship } from '@/lib/types/generated/graphql';
import { SortDirection } from '@/lib/types/shared.types';

import { UserSearch } from './UserSearch';

export const FriendRequests: React.FC = () => {
  const [showSentRequests, setShowSentRequests] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'mutual'>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { addNotification } = useNotifications();
  const [removeFriendLastUserId, setRemoveFriendLastUserId] = useState<string | null>(null);
  const { loading, error, data } = useQuery(GET_FRIENDSHIPS);

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
        recipient: { id: 'unknown', username: '', imageUrl: '' },
      };
      addNotification({
        type: 'friend_request',
        title: 'Friend Request Sent',
        message: `Your friend request to ${request.recipient?.username} has been sent.`,
        userId: request.recipient.id,
        metadata: {
          username: request.recipient?.username || '',
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
            updated_at: () => updatedRequest.updated_at,
          },
        });
      }
    },
    onCompleted: data => {
      const request = data.friendship || {
        initiator: { id: 'unknown', username: null, imageUrl: null },
        recipient: { id: 'unknown', username: null, imageUrl: null },
      };
      addNotification({
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: `You are now friends with ${request.initiator?.username}.`,
        userId: request.initiator.id,
        metadata: {
          username: request?.initiator?.username || '',
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
            updated_at: () => updatedRequest.updated_at,
          },
        });
      }
    },
    onCompleted: data => {
      const request = data.friendship || {
        initiator: { id: 'unknown', username: null, imageUrl: null },
        recipient: { id: 'unknown', username: null, imageUrl: null },
      };
      addNotification({
        type: 'friend_rejected',
        title: 'Friend Request Rejected',
        message: `You have rejected the friend request from ${request.initiator?.username}.`,
        userId: request.initiator.id,
        metadata: {
          username: request?.initiator?.username || '',
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

  const handleAcceptRequest = async (request: FriendRequest) => {
    await acceptFriendRequest({ variables: { requestId: request.id } });
  };

  const handleRejectRequest = async (requestId: string) => {
    await rejectFriendRequest({ variables: { requestId } });
  };

  const handleRemoveFriend = async (userId: string) => {
    setRemoveFriendLastUserId(userId);
    await removeFriend({ variables: { userId } });
  };

  if (error) return <div>Error loading friend requests: {error.message}</div>;

  const friendRequests = data?.friendRequests || [];
  const pendingRequests = friendRequests.filter(
    (request: FriendRequest) => request.status === 'PENDING'
  );
  const acceptedRequests = friendRequests.filter(
    (request: FriendRequest) => request.status === 'ACCEPTED'
  );

  const filteredRequests = showSentRequests
    ? pendingRequests.filter((request: FriendRequest) => request.sender.id === 'current-user-id')
    : pendingRequests.filter((request: FriendRequest) => request.receiver.id === 'current-user-id');

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'date':
        return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
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
          excludeIds={friendRequests.map((r: FriendRequest) =>
            r.sender.id === 'current-user-id' ? r.receiver.id : r.sender.id
          )}
          users={data?.users || []}
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSentRequests(!showSentRequests)}
            className={`px-3 py-1 rounded ${
              showSentRequests ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            {showSentRequests ? 'Show Received' : 'Show Sent'}
          </button>

          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`px-3 py-1 rounded ${
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
          <div className="space-y-4">
            <AnimatePresence>
              {sortedRequests.map((request: FriendRequest) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image
                        src={
                          showSentRequests
                            ? request.receiver.imageUrl || '/default-avatar.png'
                            : request.sender.imageUrl || '/default-avatar.png'
                        }
                        alt={
                          showSentRequests
                            ? request.receiver.username || 'User'
                            : request.sender.username || 'User'
                        }
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">
                          {showSentRequests ? request.receiver.username : request.sender.username}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {showSentRequests ? 'Sent' : 'Received'}{' '}
                          {new Date(request.created_at).toLocaleDateString()}
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
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          disabled={isRemoving}
                        >
                          Cancel
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(request)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            disabled={isAccepting}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            disabled={isRejecting}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Friends List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Friends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {acceptedRequests.map((request: FriendRequest) => {
              const friend =
                request.sender.id === 'current-user-id' ? request.receiver : request.sender;
              return (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image
                        src={friend.imageUrl || '/default-avatar.png'}
                        alt={friend.username || 'User'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">{friend.username}</h3>
                        <p className="text-sm text-gray-500">
                          Friends since{' '}
                          {request.updated_at
                            ? new Date(request.updated_at).toLocaleDateString()
                            : ''}
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
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      disabled={isRemoving}
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Loading States */}
      {(isSending || isAccepting || isRejecting || isRemoving) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
