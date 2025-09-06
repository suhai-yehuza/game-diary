'use client';

import { useUser } from '@clerk/nextjs';
import { Search, UserPlus, Check, X, Clock } from 'lucide-react';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import {
  useUserSearch,
  useFriendRequestMutations,
  useFriendships,
  useFriendshipStatus,
} from '@/hooks/use-friendships';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { UserSummary } from '@/types';
import { FriendshipStatus } from '@/types';

// Helper component to handle friendship status for each user
function UserFriendButton({ userResult }: { userResult: UserSummary }) {
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());
  const [cancellingRequests, setCancellingRequests] = useState<Set<string>>(new Set());

  // Get current user to check if this is the user's own profile
  let currentUser = null;
  let isLoaded = false;

  try {
    const userData = useUser();
    currentUser = userData.user;
    isLoaded = userData.isLoaded;
  } catch (_error) {
    // Handle case where Clerk is not configured
    console.warn('Clerk not configured, skipping user check');
  }

  // Check if this is the current user's own profile
  const isCurrentUser = isLoaded && currentUser && currentUser.id === userResult.id;

  // Get friendship status for this specific user
  const { status: friendshipStatus, refetch: refetchStatus } = useFriendshipStatus(userResult.id);
  const { sendFriendRequest, removeFriend, acceptFriendRequest, rejectFriendRequest } =
    useFriendRequestMutations();

  // Send friend request handler
  const handleSendFriendRequest = useCallback(
    async (_friendId: string) => {
      if (sendingRequests.has(_friendId)) {
        return; // Already sending
      }

      setSendingRequests(prev => new Set(prev).add(_friendId));

      try {
        await sendFriendRequest({ variables: { userId: _friendId } });
        // Refetch status to get updated friendship info
        await refetchStatus();
        toast.success('Friend request sent successfully!');
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'React Component',
          action: 'Send friend request',
        });
        toast.error('Failed to send friend request');
      } finally {
        setSendingRequests(prev => {
          const newSet = new Set(prev);
          newSet.delete(_friendId);
          return newSet;
        });
      }
    },
    [sendFriendRequest, sendingRequests, refetchStatus]
  );

  // Cancel friend request handler
  const handleCancelFriendRequest = useCallback(
    async (_friendId: string) => {
      if (cancellingRequests.has(_friendId)) {
        return; // Already cancelling
      }

      setCancellingRequests(prev => new Set(prev).add(_friendId));

      try {
        if (!friendshipStatus?.friendshipId) {
          toast.error('Friend request not found');
          return;
        }

        await removeFriend({ variables: { friendshipId: friendshipStatus.friendshipId } });
        // Refetch status to get updated friendship info
        await refetchStatus();
        toast.success('Friend request cancelled');
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'React Component',
          action: 'Cancel friend request',
        });
        toast.error('Failed to cancel friend request');
      } finally {
        setCancellingRequests(prev => {
          const newSet = new Set(prev);
          newSet.delete(_friendId);
          return newSet;
        });
      }
    },
    [removeFriend, cancellingRequests, friendshipStatus, refetchStatus]
  );

  // Accept friend request handler
  const handleAcceptRequest = useCallback(
    async (_friendId: string) => {
      if (!friendshipStatus?.friendshipId) {
        toast.error('Friend request not found');
        return;
      }

      try {
        await acceptFriendRequest({ variables: { friendshipId: friendshipStatus.friendshipId } });
        await refetchStatus();
        toast.success('Friend request accepted!');
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'React Component',
          action: 'Accept friend request',
        });
        toast.error('Failed to accept friend request');
      }
    },
    [acceptFriendRequest, friendshipStatus, refetchStatus]
  );

  // Reject friend request handler
  const handleRejectRequest = useCallback(
    async (_friendId: string) => {
      if (!friendshipStatus?.friendshipId) {
        toast.error('Friend request not found');
        return;
      }

      try {
        await rejectFriendRequest({ variables: { friendshipId: friendshipStatus.friendshipId } });
        await refetchStatus();
        toast.success('Friend request rejected');
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'React Component',
          action: 'Reject friend request',
        });
        toast.error('Failed to reject friend request');
      }
    },
    [rejectFriendRequest, friendshipStatus, refetchStatus]
  );

  // Unfriend handler
  const handleUnfriend = useCallback(
    async (_friendId: string) => {
      if (!friendshipStatus?.friendshipId) {
        toast.error('Friendship not found');
        return;
      }

      try {
        await removeFriend({ variables: { friendshipId: friendshipStatus.friendshipId } });
        await refetchStatus();
        toast.success('Friend removed successfully');
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'React Component',
          action: 'Unfriend user',
        });
        toast.error('Failed to remove friend');
      }
    },
    [removeFriend, friendshipStatus, refetchStatus]
  );

  // Determine button state based on friendship status
  const isPending = friendshipStatus?.status === 'PENDING';
  const isAccepted = friendshipStatus?.status === 'ACCEPTED';
  const _isRejected = friendshipStatus?.status === 'REJECTED';
  const isInitiator = friendshipStatus?.isInitiator;
  const isSending = sendingRequests.has(userResult.id);
  const isCancelling = cancellingRequests.has(userResult.id);

  // Show disabled button if this is the current user's own profile
  if (isCurrentUser) {
    return (
      <Button size="sm" disabled className="bg-gray-600 text-gray-400 cursor-not-allowed">
        <UserPlus className="h-3 w-3 mr-2" />
        This is you
      </Button>
    );
  }

  // Show unfriend option if already friends
  if (isAccepted) {
    return (
      <Button
        size="sm"
        onClick={() => void handleUnfriend(userResult.id)}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <X className="h-3 w-3 mr-2" />
        Unfriend
      </Button>
    );
  }

  // Show cancel button if user sent a pending request
  if (isPending && isInitiator) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-green-600 border-green-600 text-white hover:bg-green-700"
          disabled
        >
          <Check className="h-3 w-3 mr-2" />
          Request Sent
        </Button>
        <Button
          size="sm"
          onClick={() => void handleCancelFriendRequest(userResult.id)}
          disabled={isCancelling}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isCancelling ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-2" />
              Cancelling...
            </>
          ) : (
            <>
              <X className="h-3 w-3 mr-2" />
              Cancel
            </>
          )}
        </Button>
      </div>
    );
  }

  // Show accept/reject buttons if user received a pending request
  if (isPending && !isInitiator) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => void handleAcceptRequest(userResult.id)}
        >
          <Check className="h-3 w-3 mr-2" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          onClick={() => void handleRejectRequest(userResult.id)}
        >
          <X className="h-3 w-3 mr-2" />
          Reject
        </Button>
      </div>
    );
  }

  // Default: show Add Friend button
  return (
    <Button
      size="sm"
      onClick={() => void handleSendFriendRequest(userResult.id)}
      disabled={isSending}
      className={
        isSending
          ? 'bg-gray-600 text-white cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }
    >
      {isSending ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-2" />
          Sending...
        </>
      ) : (
        <>
          <UserPlus className="h-3 w-3 mr-2" />
          Add Friend
        </>
      )}
    </Button>
  );
}

export function FriendsTable() {
  // Handle case where Clerk is not configured (e.g., in test environment)
  let user = null;
  let isLoaded = false;

  try {
    const userData = useUser();
    user = userData.user;
    isLoaded = userData.isLoaded;
  } catch (error) {
    // Clerk is not configured (e.g., in test environment)
    console.log('Clerk not configured in FriendsTable, using fallback:', error);
    user = null;
    isLoaded = true;
  }

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');

  // User search hook
  const { loading: userSearchLoading, search } = useUserSearch();

  // Get accepted friends data (only when friends tab is active)
  const { friendships: acceptedFriends, loading: friendsLoading } = useFriendships(
    {
      status: FriendshipStatus.Accepted,
    },
    { skip: activeTab !== 'friends' }
  );

  // Get pending requests (only when requests tab is active)
  const { friendships: pendingRequests, loading: pendingLoading } = useFriendships(
    {
      status: FriendshipStatus.Pending,
      isInitiator: false,
    },
    { skip: activeTab !== 'requests' }
  );

  // Get sent requests (only when sent tab is active)
  const { friendships: sentRequests, loading: sentLoading } = useFriendships(
    {
      status: FriendshipStatus.Pending,
      isInitiator: true,
    },
    { skip: activeTab !== 'sent' }
  );

  // Friend request mutations
  const { removeFriend, acceptFriendRequest, rejectFriendRequest } = useFriendRequestMutations();

  // Unfriend handler
  const handleUnfriend = useCallback(
    async (friendshipId: string) => {
      try {
        await removeFriend({ variables: { friendshipId } });
        toast.success('Friend removed successfully');
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'React Component',
          action: 'Unfriend user',
        });
        toast.error('Failed to remove friend');
      }
    },
    [removeFriend]
  );

  // Accept friend request handler
  const handleAcceptRequest = useCallback(
    async (friendshipId: string) => {
      try {
        await acceptFriendRequest({ variables: { friendshipId } });
        toast.success('Friend request accepted');
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'React Component',
          action: 'Accept friend request',
        });
        toast.error('Failed to accept friend request');
      }
    },
    [acceptFriendRequest]
  );

  // Reject friend request handler
  const handleRejectRequest = useCallback(
    async (friendshipId: string) => {
      try {
        await rejectFriendRequest({ variables: { friendshipId } });
        toast.success('Friend request rejected');
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'React Component',
          action: 'Reject friend request',
        });
        toast.error('Failed to reject friend request');
      }
    },
    [rejectFriendRequest]
  );

  // Cancel sent friend request handler
  const handleCancelSentRequest = useCallback(
    async (friendshipId: string) => {
      try {
        await removeFriend({ variables: { friendshipId } });
        toast.success('Friend request cancelled');
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'React Component',
          action: 'Cancel sent friend request',
        });
        toast.error('Failed to cancel friend request');
      }
    },
    [removeFriend]
  );

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Search handler
  const performSearch = useCallback(
    async (searchTerm: string) => {
      if (searchTerm.trim()) {
        try {
          const result = await search(searchTerm);
          if (result?.data?.searchUsers) {
            setSearchResults(
              result.data.searchUsers.edges.map((edge: { node: UserSummary }) => ({
                id: edge.node.id,
                username: edge.node.username ?? '',
                first_name: edge.node.first_name ?? '',
                last_name: edge.node.last_name ?? '',
                email_address: '',
                image_url: edge.node.image_url,
                isAdmin: edge.node.isAdmin ?? false,
              }))
            );
          }
        } catch (error) {
          console.error('Error searching users:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    },
    [search]
  );

  // Debounced search effect
  useEffect(() => {
    // Set typing state when user starts typing
    if (userSearchTerm.trim()) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
      setSearchResults([]);
    }

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      setIsTyping(false);
      void performSearch(userSearchTerm);
    }, 300); // 300ms debounce delay

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [userSearchTerm, performSearch]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Please sign in to view your friends</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Friends</h2>
        <Button
          onClick={() => setShowUserSearch(!showUserSearch)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Find Friends
        </Button>
      </div>

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
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-inner"
                />
              </div>
              <Button
                onClick={() => setUserSearchTerm('')}
                disabled={!userSearchTerm.trim()}
                variant="outline"
                className="px-6 py-3 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-all duration-200 flex items-center gap-2 min-w-[100px] justify-center"
              >
                Clear
              </Button>
            </div>

            {(userSearchLoading || isTyping) && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                <span className="ml-3 text-gray-400">
                  {isTyping ? 'Typing...' : 'Searching...'}
                </span>
              </div>
            )}

            {!userSearchLoading && !isTyping && searchResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Search Results</h4>
                {searchResults.map((userResult: UserSummary) => (
                  <div
                    key={userResult.id}
                    className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {userResult.first_name?.[0]}
                          {userResult.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {userResult.first_name} {userResult.last_name}
                        </p>
                        <p className="text-gray-400 text-sm">@{userResult.username}</p>
                      </div>
                    </div>
                    <UserFriendButton userResult={userResult} />
                  </div>
                ))}
              </div>
            )}

            {!userSearchLoading && !isTyping && userSearchTerm && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                <p>No users found matching &quot;{userSearchTerm}&quot;</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-200 dark:bg-gray-800">
          <TabsTrigger
            value="friends"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Friends ({acceptedFriends?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Requests ({pendingRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Sent ({sentRequests?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Friends ({acceptedFriends?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {friendsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
                </div>
              ) : acceptedFriends && acceptedFriends.length > 0 ? (
                <div className="space-y-3">
                  {acceptedFriends.map(friendship => {
                    // The friend is the other person in the friendship (not the current user)
                    const friend =
                      friendship.initiator?.id === user?.id
                        ? friendship.recipient
                        : friendship.initiator;

                    return (
                      <div
                        key={friendship.id}
                        className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {friend?.first_name?.[0] || friend?.username?.[0] || '?'}
                              {friend?.last_name?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {friend?.first_name && friend?.last_name
                                ? `${friend.first_name} ${friend.last_name}`
                                : friend?.username || 'Unknown User'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              @{friend?.username || 'unknown'}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => void handleUnfriend(friendship.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <X className="h-3 w-3 mr-2" />
                          Unfriend
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Check className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-lg font-medium mb-2">No friends yet</p>
                  <p className="text-sm">Start by searching for people to add as friends</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Pending Requests ({pendingRequests?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
                </div>
              ) : pendingRequests && pendingRequests.length > 0 ? (
                <div className="space-y-3">
                  {pendingRequests.map(friendship => {
                    // The requester is the initiator (the person who sent the request)
                    const requester = friendship.initiator;

                    return (
                      <div
                        key={friendship.id}
                        className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {requester?.first_name?.[0] || requester?.username?.[0] || '?'}
                              {requester?.last_name?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {requester?.first_name && requester?.last_name
                                ? `${requester.first_name} ${requester.last_name}`
                                : requester?.username || 'Unknown User'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              @{requester?.username || 'unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => void handleAcceptRequest(friendship.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-3 w-3 mr-2" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => void handleRejectRequest(friendship.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <X className="h-3 w-3 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-lg font-medium mb-2">No pending requests</p>
                  <p className="text-sm">You don&apos;t have any pending friend requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-500" />
                Sent Requests ({sentRequests?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
                </div>
              ) : sentRequests && sentRequests.length > 0 ? (
                <div className="space-y-3">
                  {sentRequests.map(friendship => {
                    // The recipient is the person who received the request
                    const recipient = friendship.recipient;

                    return (
                      <div
                        key={friendship.id}
                        className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {recipient?.first_name?.[0] || recipient?.username?.[0] || '?'}
                              {recipient?.last_name?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {recipient?.first_name && recipient?.last_name
                                ? `${recipient.first_name} ${recipient.last_name}`
                                : recipient?.username || 'Unknown User'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              @{recipient?.username || 'unknown'}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => void handleCancelSentRequest(friendship.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <X className="h-3 w-3 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <UserPlus className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-lg font-medium mb-2">No sent requests</p>
                  <p className="text-sm">You haven&apos;t sent any friend requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
