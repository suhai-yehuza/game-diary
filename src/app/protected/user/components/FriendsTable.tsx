'use client';

import { useUser } from '@clerk/nextjs';
import { Search, UserPlus, UserX, Check, X, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/DropdownMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import {
  useFriendships,
  useFriendshipRequests,
  useUserSearch,
  useFriendshipMutations,
  useFriendshipStatus,
} from '@/hooks/use-friendships';
import type { IFriendship, IUserSummary } from '@/lib/types';

export function FriendsTable() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState('friends');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IUserSummary[]>([]);

  const {
    friendships,
    loading: friendshipsLoading,
    refetch: refetchFriendships,
  } = useFriendships({
    status: 'ACCEPTED',
  });

  const {
    friendships: pendingFriendships,
    loading: pendingFriendshipsLoading,
    refetch: refetchPendingFriendships,
  } = useFriendships({
    status: 'PENDING',
  });

  const { requests, loading: requestsLoading, refetch: refetchRequests } = useFriendshipRequests();

  const { users, loading: userSearchLoading, search } = useUserSearch();

  const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    loading: mutationsLoading,
  } = useFriendshipMutations();

  const handleSendFriendRequest = useCallback(
    async (friendId: string, refetchStatus?: () => void) => {
      try {
        await sendFriendRequest(friendId);
        toast.success('Friend request sent successfully!');
        // Refetch the friendship status to update the UI
        if (refetchStatus) {
          void refetchStatus();
        }
        // Also refetch pending friendships to update the Pending tab
        void refetchPendingFriendships();
      } catch {
        toast.error('Failed to send friend request');
      }
    },
    [sendFriendRequest, refetchPendingFriendships]
  );

  const handleAcceptRequest = useCallback(
    async (friendshipId: string) => {
      try {
        await acceptFriendRequest(friendshipId);
        toast.success('Friend request accepted!');
        await refetchRequests();
        await refetchFriendships();
      } catch (error) {
        console.error('Error accepting request:', error);
        toast.error('Failed to accept friend request');
      }
    },
    [acceptFriendRequest, refetchRequests, refetchFriendships]
  );

  const handleRejectRequest = useCallback(
    async (friendshipId: string) => {
      try {
        await rejectFriendRequest(friendshipId);
        toast.success('Friend request rejected');
        await refetchRequests();
      } catch (error) {
        console.error('Error rejecting request:', error);
        toast.error('Failed to reject friend request');
      }
    },
    [rejectFriendRequest, refetchRequests]
  );

  const handleRemoveFriend = useCallback(
    async (friendshipId: string) => {
      try {
        await removeFriend(friendshipId);
        toast.success('Friend removed successfully');
        void refetchFriendships();
        void refetchPendingFriendships();
      } catch {
        toast.error('Failed to remove friend');
      }
    },
    [removeFriend, refetchFriendships, refetchPendingFriendships]
  );

  const handleUserSearch = useCallback(async () => {
    if (userSearchTerm.trim()) {
      const result = await search(userSearchTerm);
      // Update local search results state with the returned data
      if (result?.data?.searchUsers) {
        setSearchResults(
          result.data.searchUsers.edges.map(edge => ({
            id: edge.node.id,
            username: edge.node.username ?? '',
            first_name: edge.node.first_name ?? '',
            last_name: edge.node.last_name ?? '',
            email_address: '',
            image_url: edge.node.image_url,
          }))
        );
      }
    }
  }, [search, userSearchTerm]);

  const handleRemoveFromSearchResults = useCallback((userId: string) => {
    setSearchResults(prev => prev.filter(user => user.id !== userId));
  }, []);

  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        void handleUserSearch();
      }
    },
    [handleUserSearch]
  );

  const filteredFriendships = friendships
    .filter((friendship: IFriendship) => friendship.status === 'ACCEPTED')
    .filter((friendship: IFriendship) => {
      const friend =
        friendship.initiator?.id === user?.id ? friendship.recipient : friendship.initiator;
      const friendName = `${friend?.first_name ?? ''} ${friend?.last_name ?? ''}`.trim();
      const friendUsername = friend?.username ?? '';
      const searchLower = searchTerm.toLowerCase();
      return (
        friendName.toLowerCase().includes(searchLower) ||
        friendUsername.toLowerCase().includes(searchLower)
      );
    });

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Please sign in to view your friends</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Friends Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Friends</h2>
        <Button
          onClick={() => setShowUserSearch(!showUserSearch)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Friends
        </Button>
      </div>

      {/* User Search Section */}
      {showUserSearch && (
        <Card className="border-2 border-dashed border-blue-500/30 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-100">
              <Search className="h-5 w-5 text-blue-400" />
              Find People
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username, name, or email..."
                  value={userSearchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUserSearchTerm(e.target.value)
                  }
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-inner"
                />
              </div>
              <Button
                onClick={() => void handleUserSearch()}
                disabled={userSearchLoading || mutationsLoading || !userSearchTerm.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2 min-w-[100px] justify-center"
              >
                {userSearchLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </Button>
            </div>

            {userSearchLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            )}

            {!userSearchLoading && searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-gray-400 mb-3">
                  Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map((userResult: IUserSummary) => (
                  <UserSearchResult
                    key={userResult.id}
                    user={userResult}
                    currentUserId={user.id}
                    onSendRequest={handleSendFriendRequest}
                    onRemoveFriend={handleRemoveFriend}
                    onRemoveFromResults={handleRemoveFromSearchResults}
                    loading={mutationsLoading}
                  />
                ))}
              </div>
            )}

            {!userSearchLoading && userSearchTerm && users.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                <p>No users found matching &quot;{userSearchTerm}&quot;</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Friends Interface */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Friends ({filteredFriendships.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending (
            {pendingFriendships.filter((f: IFriendship) => f.initiator?.id === user.id).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {friendshipsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredFriendships.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                  <p>No friends found matching &quot;{searchTerm}&quot;</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </>
              ) : (
                <>
                  <UserPlus className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-lg font-medium mb-2">No friends yet</p>
                  <p className="text-sm">Add some friends to get started!</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriendships.map((friendship: IFriendship) => (
                <FriendshipCard
                  key={friendship.id}
                  friendship={friendship}
                  currentUserId={user.id}
                  onRemove={handleRemoveFriend}
                  loading={mutationsLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {requestsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <UserPlus className="h-12 w-12 mx-auto mb-3 text-gray-600" />
              <p className="text-lg font-medium mb-2">No pending requests</p>
              <p className="text-sm">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((request: IFriendship) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                  loading={mutationsLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingFriendshipsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {pendingFriendships
                .filter((f: IFriendship) => f.initiator?.id === user.id)
                .map((pending: IFriendship) => (
                  <PendingFriendshipCard
                    key={pending.id}
                    pending={pending}
                    onWithdraw={handleRemoveFriend}
                    loading={mutationsLoading}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components
function FriendshipCard({
  friendship,
  currentUserId,
  onRemove,
  loading,
}: {
  friendship: IFriendship;
  currentUserId: string;
  onRemove: (friendshipId: string) => Promise<void>;
  loading: boolean;
}) {
  const friend =
    friendship.initiator?.id === currentUserId ? friendship.recipient : friendship.initiator;
  const friendName =
    (`${friend?.first_name ?? ''} ${friend?.last_name ?? ''}`.trim() || friend?.username) ??
    'Unknown User';
  const friendUsername = friend?.username ?? '';

  return (
    <Card className="hover:bg-gray-800/50 transition-all duration-200 border-gray-700 hover:border-gray-600">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Image
            src={friend?.image_url ?? '/avatars/default-user-avatar.svg'}
            alt={friendName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full ring-2 ring-gray-600 hover:ring-green-500 transition-all duration-200"
          />
          <div>
            <p className="font-medium text-white">{friendName}</p>
            <p className="text-sm text-gray-400">@{friendUsername}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
            Friends
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                className="hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem
                onClick={() => {
                  void onRemove(friendship.id);
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10"
              >
                <UserX className="h-4 w-4 mr-2" />
                Remove Friend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function FriendRequestCard({
  request,
  onAccept,
  onReject,
  loading,
}: {
  request: IFriendship;
  onAccept: (friendshipId: string) => Promise<void>;
  onReject: (friendshipId: string) => Promise<void>;
  loading: boolean;
}) {
  const requester = request.initiator;
  const requesterName =
    (`${requester?.first_name ?? ''} ${requester?.last_name ?? ''}`.trim() ||
      requester?.username) ??
    'Unknown User';
  const requesterUsername = requester?.username ?? '';

  return (
    <Card className="hover:bg-gray-800/50 transition-all duration-200 border-gray-700 hover:border-gray-600">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Image
            src={requester?.image_url ?? '/avatars/default-user-avatar.svg'}
            alt={requesterName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full ring-2 ring-gray-600 hover:ring-blue-500 transition-all duration-200"
          />
          <div>
            <p className="font-medium text-white">{requesterName}</p>
            <p className="text-sm text-gray-400">@{requesterUsername}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Incoming Request
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                void onAccept(request.id);
              }}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void onReject(request.id);
              }}
              disabled={loading}
              className="text-red-500 border-red-500 hover:bg-red-500/10 hover:border-red-400 transition-all duration-200 px-3 py-2 rounded-lg font-medium shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-500 border-t-transparent" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PendingFriendshipCard({
  pending,
  onWithdraw,
  loading,
}: {
  pending: IFriendship;
  onWithdraw: (friendshipId: string) => Promise<void>;
  loading: boolean;
}) {
  const recipient = pending.recipient;
  const recipientName =
    (`${recipient?.first_name ?? ''} ${recipient?.last_name ?? ''}`.trim() ||
      recipient?.username) ??
    'Unknown User';
  const recipientUsername = recipient?.username ?? '';

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
            void onWithdraw(pending.id);
          }}
          disabled={loading}
          className="text-orange-500 border-orange-500 hover:bg-orange-500/10 hover:border-orange-400 transition-all duration-300 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-2 min-w-[120px] justify-center"
        >
          {loading ? (
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

function UserSearchResult({
  user,
  currentUserId,
  onSendRequest,
  onRemoveFriend,
  onRemoveFromResults,
  loading,
}: {
  user: IUserSummary;
  currentUserId: string;
  onSendRequest: (friendId: string, refetchStatus?: () => void) => Promise<void>;
  onRemoveFriend: (friendshipId: string) => Promise<void>;
  onRemoveFromResults?: (userId: string) => void;
  loading: boolean;
}) {
  const [requestSent, setRequestSent] = useState(false);
  const validUserId = user.id?.trim();
  const friendshipStatus = useFriendshipStatus(validUserId || '');
  const { status } = friendshipStatus;
  const userName =
    (`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.username) ?? 'Unknown User';
  const userUsername = user.username ?? '';

  const handleSendRequest = async () => {
    setRequestSent(true);
    try {
      await onSendRequest(user.id, () => {
        void friendshipStatus.refetch();
      });
      toast.success('Friend request sent!');
    } catch {
      // If the request fails, reset the local state
      setRequestSent(false);
      toast.error('Failed to send friend request');
    }
  };

  const handleCancelRequest = async () => {
    if (!status?.friendshipId) {
      toast.error('No friendship found to cancel');
      return;
    }

    try {
      await onRemoveFriend(status.friendshipId);
      toast.success('Friend request cancelled');

      // Immediately set the local state to false - this is all we need
      setRequestSent(false);

      // Remove the user from search results immediately
      if (onRemoveFromResults) {
        onRemoveFromResults(user.id);
      }
    } catch (error) {
      console.error('Error canceling request:', error);
      toast.error('Failed to cancel friend request');
    }
  };

  // Initialize local state based on server state only on mount
  React.useEffect(() => {
    if (status?.status === 'PENDING' && status?.isInitiator) {
      setRequestSent(true);
    } else if (status?.status === 'ACCEPTED' || status?.status === 'REJECTED' || !status) {
      setRequestSent(false);
    }
  }, [status]); // Include status in dependencies

  const getActionButton = () => {
    if (user.id === currentUserId) {
      return <span className="text-sm text-gray-400 italic">This is you</span>;
    }

    // Show status badges for accepted friendships
    if (status?.status === 'ACCEPTED') {
      return (
        <span className="text-sm text-green-500 font-medium bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
          Friends
        </span>
      );
    }

    // Show status badges for pending requests (non-initiator)
    if (status?.status === 'PENDING' && !status?.isInitiator) {
      return (
        <span className="text-sm text-blue-500 font-medium bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Request Received
        </span>
      );
    }

    // Show toggle-able buttons for all other cases
    if (requestSent || (status?.status === 'PENDING' && status?.isInitiator)) {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void handleCancelRequest();
          }}
          disabled={loading}
          className="text-yellow-500 border-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-300 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-2 min-w-[120px] justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-500 border-t-transparent mr-2" />
          ) : null}
          Cancel Request
        </Button>
      );
    } else {
      return (
        <Button
          size="sm"
          onClick={() => {
            void handleSendRequest();
          }}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 transform hover:scale-105 min-w-[120px] justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
          ) : (
            <UserPlus className="h-3 w-3" />
          )}
          Add Friend
        </Button>
      );
    }
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
