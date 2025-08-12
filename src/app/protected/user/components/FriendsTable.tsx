'use client';

import { useUser } from '@clerk/nextjs';
import { Search, UserPlus } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import {
  useFriendships,
  useFriendshipRequests,
  useUserSearch,
  useFriendshipMutations,
} from '@/hooks/use-friendships';
import type { IFriendship, IUserSummary } from '@/lib/types';

import { FriendRequestCard as FriendRequestCardComponent } from './FriendRequestCard';
import { FriendshipCard as FriendshipCardComponent } from './FriendshipCard';
import { PendingFriendshipCard as PendingFriendshipCardComponent } from './PendingFriendshipCard';
import { UserSearchResultCard } from './UserSearchResultCard';

export function FriendsTable() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IUserSummary[]>([]);
  const [selectedTab, setSelectedTab] = useState('friends');
  const [showUserSearch, setShowUserSearch] = useState(false);

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
    async (friendshipId: string, context?: 'cancel-request' | 'remove-friend') => {
      try {
        await removeFriend(friendshipId);

        if (context === 'cancel-request') {
          toast.success('Friend request cancelled');
        } else {
          toast.success('Friend removed successfully');
        }

        // Refetch friendships to update the UI
        await refetchFriendships();
        await refetchPendingFriendships();
      } catch (error) {
        console.error('Error removing friend:', error);
        if (context === 'cancel-request') {
          toast.error('Failed to cancel friend request');
        } else {
          toast.error('Failed to remove friend');
        }
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

  // kept intentionally minimal; search results are fully controlled by local state

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
                  <UserSearchResultCard
                    key={userResult.id}
                    user={userResult}
                    currentUserId={user.id}
                    onSendRequest={handleSendFriendRequest}
                    onRemoveFriend={handleRemoveFriend}
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
        <TabsList className="grid grid-cols-3 w-full gap-1">
          <TabsTrigger
            value="friends"
            className="data-[state=active]:border-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-700 dark:text-gray-300 rounded-md font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
          >
            Friends ({filteredFriendships.length})
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="data-[state=active]:border-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-700 dark:text-gray-300 rounded-md font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
          >
            Requests ({requests.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:border-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-700 dark:text-gray-300 rounded-md font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
          >
            Pending (
            {pendingFriendships.filter((f: IFriendship) => f.initiator?.id === user.id).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4 mt-6">
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
                <FriendshipCardComponent
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

        <TabsContent value="requests" className="space-y-4 mt-6">
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
                <FriendRequestCardComponent
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

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingFriendshipsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {pendingFriendships
                .filter((f: IFriendship) => f.initiator?.id === user.id)
                .map((pending: IFriendship) => (
                  <PendingFriendshipCardComponent
                    key={pending.id}
                    pending={pending}
                    onWithdraw={handleRemoveFriend}
                    onSendRequest={handleSendFriendRequest}
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
