'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import {
  Search,
  Filter,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserPlus,
  UserCheck,
  MoreVertical,
  Check,
  X,
  Ban,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useDebounce } from 'use-debounce';

import { logger } from '@lib/core/logger';
import { Avatar, AvatarFallback, AvatarImage } from '@src/app/components/ui/avatar';
import { Badge } from '@src/app/components/ui/badge';
import { Button } from '@src/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@src/app/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@src/app/components/ui/dropdown-menu';
import { Input } from '@src/app/components/ui/input';
import { Label } from '@src/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/app/components/ui/select';
import { Skeleton } from '@src/app/components/ui/skeleton';
import { useNotifications } from '@src/contexts/notification-context';
import { clientCache, CLIENT_CACHE_KEYS } from '@src/lib/cache/client';
import { API_CONFIG } from '@src/lib/config/api.config';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '@src/lib/graphql/mutations';
import { SEARCH_USERS } from '@src/lib/graphql/queries';
import type { IUserSearchSectionProps } from '@src/lib/types/component.types';
import { FRIENDSHIP_STATUS } from '@src/lib/types/config.types';
import type { UserEdge } from '@src/lib/types/generated/graphql';
import type { IUserNode } from '@src/lib/types/misc.types';
import { cn } from '@src/lib/utils';
import { formatCount } from '@src/lib/utils/format';

const UserCard = React.memo(({ user }: { user: IUserNode }) => {
  const { user: currentUser } = useUser();
  const [sendFriendRequest, { loading: sendingRequest }] = useMutation(SEND_FRIEND_REQUEST);
  const [acceptFriendRequest, { loading: acceptingRequest }] = useMutation(ACCEPT_FRIEND_REQUEST);
  const [rejectFriendRequest, { loading: rejectingRequest }] = useMutation(REJECT_FRIEND_REQUEST);
  const [removeFriend, { loading: removingFriend }] = useMutation(REMOVE_FRIEND);

  // Dropdown open states
  const [friendRequestDropdownOpen, setFriendRequestDropdownOpen] = useState(false);
  const [friendsDropdownOpen, setFriendsDropdownOpen] = useState(false);
  const [sentRequestDropdownOpen, setSentRequestDropdownOpen] = useState(false);

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const displayName = fullName || user.username;
  const gameLogCount = user.gameLogs?.length || 0;

  // Format the createdAt date
  const formattedJoinDate = useMemo(() => {
    try {
      const date = new Date(user.createdAt);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  }, [user.createdAt]);

  // Determine friendship status
  const friendshipInfo = useMemo(() => {
    if (!currentUser) return null;

    // Check if current user initiated a friendship with this user
    const initiatedFriendship = user.friendships?.find(f => f.initiator.id === currentUser.id);

    // Check if this user initiated a friendship with current user
    const receivedFriendship = user.initiatedFriendships?.find(
      f => f.recipient.id === currentUser.id
    );

    const friendship = initiatedFriendship || receivedFriendship;

    if (friendship) {
      return {
        status: friendship.status,
        friendshipId: friendship.id,
        isReceivedRequest: !!receivedFriendship,
      };
    }

    return { status: null, friendshipId: null, isReceivedRequest: false };
  }, [currentUser, user.friendships, user.initiatedFriendships]);

  const handleSendFriendRequest = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        const { data } = await sendFriendRequest({
          variables: { userId: user.id },
          refetchQueries: ['SearchUsers'],
        });

        if (data?.sendFriendRequest?.friendship) {
          toast.success(`Friend request sent to ${displayName}`);
        } else if (data?.sendFriendRequest?.errors?.[0]) {
          toast.error(data.sendFriendRequest.errors[0].message);
        }
      } catch (error) {
        logger.error('Error sending friend request:', error);
        toast.error('An unexpected error occurred');
      }
    },
    [user.id, displayName, sendFriendRequest]
  );

  const handleAcceptRequest = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!friendshipInfo?.friendshipId) return;

      try {
        const { data } = await acceptFriendRequest({
          variables: { friendshipId: friendshipInfo.friendshipId },
          refetchQueries: ['SearchUsers'],
        });

        if (data?.acceptFriendRequest?.friendship) {
          toast.success(`You are now friends with ${displayName}`);
          setFriendRequestDropdownOpen(false);
        } else if (data?.acceptFriendRequest?.errors?.[0]) {
          toast.error(data.acceptFriendRequest.errors[0].message);
        }
      } catch (error) {
        logger.error('Error accepting friend request:', error);
        toast.error('An unexpected error occurred');
      }
    },
    [friendshipInfo?.friendshipId, displayName, acceptFriendRequest]
  );

  const handleRejectRequest = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!friendshipInfo?.friendshipId) return;

      try {
        const { data } = await rejectFriendRequest({
          variables: { friendshipId: friendshipInfo.friendshipId },
          refetchQueries: ['SearchUsers'],
        });

        if (data?.rejectFriendRequest?.friendship) {
          toast.success('Friend request rejected');
          setFriendRequestDropdownOpen(false);
        } else if (data?.rejectFriendRequest?.errors?.[0]) {
          toast.error(data.rejectFriendRequest.errors[0].message);
        }
      } catch (error) {
        logger.error('Error rejecting friend request:', error);
        toast.error('An unexpected error occurred');
      }
    },
    [friendshipInfo?.friendshipId, rejectFriendRequest]
  );

  const handleRemoveFriend = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!friendshipInfo?.friendshipId) return;

      try {
        const { data } = await removeFriend({
          variables: { friendshipId: friendshipInfo.friendshipId },
          refetchQueries: ['SearchUsers'],
        });

        if (data?.removeFriend?.success) {
          toast.success(`You are no longer friends with ${displayName}`);
          setFriendsDropdownOpen(false);
        } else if (data?.removeFriend?.errors?.[0]) {
          toast.error(data.removeFriend.errors[0].message);
        }
      } catch (error) {
        logger.error('Error removing friend:', error);
        toast.error('An unexpected error occurred');
      }
    },
    [friendshipInfo?.friendshipId, displayName, removeFriend]
  );

  const handleCancelRequest = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!friendshipInfo?.friendshipId) return;

      try {
        const { data } = await removeFriend({
          variables: { friendshipId: friendshipInfo.friendshipId },
          refetchQueries: ['SearchUsers'],
        });

        if (data?.removeFriend?.success) {
          toast.success('Friend request cancelled');
          setSentRequestDropdownOpen(false);
        } else if (data?.removeFriend?.errors?.[0]) {
          toast.error(data.removeFriend.errors[0].message);
        }
      } catch (error) {
        logger.error('Error cancelling friend request:', error);
        toast.error('An unexpected error occurred');
      }
    },
    [friendshipInfo?.friendshipId, removeFriend]
  );

  const handleBlockUser = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toast.error('Block functionality temporarily unavailable');
  }, []);

  const isLoading = useMemo(
    () => sendingRequest || acceptingRequest || rejectingRequest || removingFriend,
    [sendingRequest, acceptingRequest, rejectingRequest, removingFriend]
  );

  const renderFriendshipStatus = () => {
    if (!friendshipInfo) return null;

    switch (friendshipInfo.status) {
      case FRIENDSHIP_STATUS.ACCEPTED:
        return (
          <DropdownMenu open={friendsDropdownOpen} onOpenChange={setFriendsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="gap-0.5 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20 text-xs h-7 px-2"
                disabled={isLoading}
                onClick={e => e.stopPropagation()}
              >
                <UserCheck className="h-2.5 w-2.5" />
                Friends
                <MoreVertical className="h-2.5 w-2.5 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleRemoveFriend}
                disabled={isLoading}
                className="gap-2 text-gray-600 focus:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
                Unfriend
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleBlockUser}
                disabled={isLoading}
                className="gap-2 text-red-600 focus:text-red-600"
              >
                <Ban className="h-3.5 w-3.5" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );

      case FRIENDSHIP_STATUS.PENDING:
        if (friendshipInfo.isReceivedRequest) {
          return (
            <DropdownMenu
              open={friendRequestDropdownOpen}
              onOpenChange={setFriendRequestDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 text-xs h-7 px-2"
                  disabled={isLoading}
                  onClick={e => e.stopPropagation()}
                >
                  <UserPlus className="h-2.5 w-2.5" />
                  Accept Request
                  <MoreVertical className="h-2.5 w-2.5 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleAcceptRequest}
                  disabled={isLoading}
                  className="gap-2 text-green-600 focus:text-green-600"
                >
                  <Check className="h-3.5 w-3.5" />
                  Accept
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleRejectRequest}
                  disabled={isLoading}
                  className="gap-2 text-red-600 focus:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Decline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        } else {
          return (
            <DropdownMenu open={sentRequestDropdownOpen} onOpenChange={setSentRequestDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 text-xs h-7 px-2"
                  disabled={isLoading}
                  onClick={e => e.stopPropagation()}
                >
                  <UserPlus className="h-2.5 w-2.5" />
                  Request Sent
                  <MoreVertical className="h-2.5 w-2.5 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleCancelRequest}
                  disabled={isLoading}
                  className="gap-2 text-red-600 focus:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel Request
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

      case FRIENDSHIP_STATUS.REJECTED:
        return (
          <Button
            variant="secondary"
            size="sm"
            className="gap-0.5 bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20 text-xs h-7 px-2"
            disabled
          >
            <X className="h-2.5 w-2.5" />
            Request Rejected
          </Button>
        );

      case FRIENDSHIP_STATUS.BLOCKED:
        return (
          <Button
            variant="secondary"
            size="sm"
            className="gap-0.5 bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20 text-xs h-7 px-2"
            disabled
          >
            <Ban className="h-2.5 w-2.5" />
            Blocked
          </Button>
        );

      case null:
        return (
          <Button
            onClick={handleSendFriendRequest}
            variant="secondary"
            size="sm"
            className="gap-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20 text-xs h-7 px-2"
            disabled={isLoading}
          >
            <UserPlus className="h-2.5 w-2.5" />
            {isLoading ? 'Sending...' : 'Add Friend'}
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <Link href={`/protected/user/${user.id}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-background group-hover:ring-primary/20 transition-all">
              <AvatarImage src={user.imageUrl || undefined} alt={displayName} />
              <AvatarFallback className="text-lg font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2 gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate pr-4">
                    {displayName}
                  </h3>
                  {fullName && <p className="text-sm text-muted-foreground">@{user.username}</p>}
                </div>
                <div className="flex items-center gap-2 ml-6 flex-shrink-0 -mt-1">
                  {gameLogCount > 0 && (
                    <Badge variant="secondary" className="shrink-0 text-xs py-0.5 px-1.5">
                      {gameLogCount} logs
                    </Badge>
                  )}
                  {renderFriendshipStatus()}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {formattedJoinDate}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

UserCard.displayName = 'UserCard';

const UserCardSkeleton = React.memo(() => (
  <Card className="h-full">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </CardContent>
  </Card>
));

UserCardSkeleton.displayName = 'UserCardSkeleton';

export function UserSearchSection({ className }: IUserSearchSectionProps) {
  const { user: currentUser } = useUser();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [hasGameLogs, setHasGameLogs] = useState<boolean | null>(null);
  const [minGameLogs, setMinGameLogs] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [orderBy, setOrderBy] = useState('CREATED_AT_DESC');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pageData, setPageData] = useState<{ [key: number]: IUserNode[] }>({});
  const [cursors, setCursors] = useState<{ [key: number]: string | null }>({ 1: null });
  const pageSize = API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

  const { data, loading, fetchMore } = useQuery(SEARCH_USERS, {
    variables: {
      first: pageSize,
      after: null,
      searchTerm: debouncedSearchTerm || null,
      filters: {
        hasGameLogs,
        minGameLogs,
        isVerified,
        orderBy,
      },
    },
    notifyOnNetworkStatusChange: false, // Prevent unnecessary re-renders
    fetchPolicy: 'cache-first',
    onCompleted: result => {
      if (result?.searchUsers?.edges) {
        const users = result.searchUsers.edges.map((edge: UserEdge) => edge.node);
        setPageData(prev => ({ ...prev, 1: users }));
        if (result.searchUsers.pageInfo?.endCursor) {
          setCursors(prev => ({ ...prev, 2: result.searchUsers.pageInfo.endCursor }));
        }
      }
    },
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageData({});
    setCursors({ 1: null });
  }, [debouncedSearchTerm, hasGameLogs, minGameLogs, isVerified, orderBy]);

  // Current page users - use cached data if available, otherwise fall back to query data
  const currentPageUsers =
    pageData[currentPage] ||
    (currentPage === 1 ? data?.searchUsers?.edges?.map((edge: UserEdge) => edge.node) : []) ||
    [];
  const totalCount = data?.searchUsers?.totalCount || 0;
  const hasNextPage = data?.searchUsers?.pageInfo?.hasNextPage || false;
  const hasPreviousPage = currentPage > 1;

  // Pre-fetch next page data when user hovers over Next button
  const prefetchNextPage = useCallback(async () => {
    const nextPage = currentPage + 1;
    const nextCursor = cursors[nextPage];

    if (!pageData[nextPage] && nextCursor && hasNextPage) {
      try {
        await fetchMore({
          variables: {
            first: pageSize,
            after: nextCursor,
            searchTerm: debouncedSearchTerm || null,
            filters: {
              hasGameLogs,
              minGameLogs,
              isVerified,
              orderBy,
            },
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (fetchMoreResult?.searchUsers?.edges) {
              const users = fetchMoreResult.searchUsers.edges.map((edge: UserEdge) => edge.node);
              setPageData(prevData => ({ ...prevData, [nextPage]: users }));

              if (fetchMoreResult.searchUsers.pageInfo?.endCursor) {
                setCursors(prevCursors => ({
                  ...prevCursors,
                  [nextPage + 1]: fetchMoreResult.searchUsers.pageInfo.endCursor,
                }));
              }
            }
            return prev; // Don't update the main query
          },
        });
      } catch (error) {
        console.error('Error prefetching next page:', error);
      }
    }
  }, [
    currentPage,
    cursors,
    pageData,
    hasNextPage,
    fetchMore,
    pageSize,
    debouncedSearchTerm,
    hasGameLogs,
    minGameLogs,
    isVerified,
    orderBy,
  ]);

  const handlePageChange = useCallback(
    async (page: number) => {
      if (loading || isNavigating) return;

      const isNextPage = page > currentPage;

      // If we already have the data cached, switch immediately
      if (pageData[page]) {
        setCurrentPage(page);
        return;
      }

      setIsNavigating(true);

      try {
        if (isNextPage && hasNextPage) {
          const cursor = cursors[page];
          if (cursor) {
            await fetchMore({
              variables: {
                first: pageSize,
                after: cursor,
                searchTerm: debouncedSearchTerm || null,
                filters: {
                  hasGameLogs,
                  minGameLogs,
                  isVerified,
                  orderBy,
                },
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (fetchMoreResult?.searchUsers?.edges) {
                  const users = fetchMoreResult.searchUsers.edges.map(
                    (edge: UserEdge) => edge.node
                  );
                  setPageData(prevData => ({ ...prevData, [page]: users }));

                  if (fetchMoreResult.searchUsers.pageInfo?.endCursor) {
                    setCursors(prevCursors => ({
                      ...prevCursors,
                      [page + 1]: fetchMoreResult.searchUsers.pageInfo.endCursor,
                    }));
                  }
                }
                return prev;
              },
            });
          }
        } else if (!isNextPage && page === currentPage - 1) {
          // For previous page, calculate cursor and fetch
          const targetOffset = (page - 1) * pageSize;
          const targetCursor = targetOffset > 0 ? btoa(targetOffset.toString()) : null;

          await fetchMore({
            variables: {
              first: pageSize,
              after: targetCursor,
              searchTerm: debouncedSearchTerm || null,
              filters: {
                hasGameLogs,
                minGameLogs,
                isVerified,
                orderBy,
              },
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (fetchMoreResult?.searchUsers?.edges) {
                const users = fetchMoreResult.searchUsers.edges.map((edge: UserEdge) => edge.node);
                setPageData(prevData => ({ ...prevData, [page]: users }));
              }
              return prev;
            },
          });
        }

        setCurrentPage(page);
      } catch (error) {
        console.error('Error navigating pages:', error);
      } finally {
        setIsNavigating(false);
      }
    },
    [
      currentPage,
      pageData,
      cursors,
      loading,
      hasNextPage,
      fetchMore,
      pageSize,
      debouncedSearchTerm,
      hasGameLogs,
      minGameLogs,
      isVerified,
      orderBy,
      isNavigating,
    ]
  );

  // Check for received friend requests and create notifications
  useEffect(() => {
    if (!data?.searchUsers?.edges || !currentUser) return;

    const checkFriendRequests = async () => {
      const users = data.searchUsers.edges.map((edge: UserEdge) => edge.node);
      const receivedRequests = users.filter((user: IUserNode) => {
        const receivedFriendship = user.initiatedFriendships?.find(
          f => f.recipient.id === currentUser.id && f.status === FRIENDSHIP_STATUS.PENDING
        );
        return !!receivedFriendship;
      });

      // Create notifications for received friend requests
      for (const user of receivedRequests) {
        try {
          const notificationKey = CLIENT_CACHE_KEYS.FRIEND_REQUEST_NOTIFICATION(user.id);
          const existingNotification = await clientCache.getItem<string>(notificationKey);

          // Only create notification if we haven't already notified about this request
          if (!existingNotification) {
            addNotification({
              type: 'friend_request',
              title: 'New Friend Request',
              message: `${user.firstName || user.username} sent you a friend request`,
              userId: user.id,
              metadata: {
                avatar: user.imageUrl,
                username: user.username,
              },
            });

            await clientCache.setItem(
              notificationKey,
              'true',
              60 * 60 * 24 * 30 // 30 days TTL
            );
          }
        } catch (error) {
          console.error('Failed to process friend request notification:', error);
        }
      }
    };

    checkFriendRequests();
  }, [data, currentUser, addNotification]);

  const resetFilters = () => {
    setHasGameLogs(null);
    setMinGameLogs(null);
    setIsVerified(null);
    setOrderBy('CREATED_AT_DESC');
  };

  const activeFiltersCount = [hasGameLogs, minGameLogs, isVerified].filter(f => f !== null).length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, name, or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 px-1">
              Searches in username, first name, last name, and email address
            </p>
          </div>

          <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', showFilters && 'rotate-180')}
            />
          </Button>

          <Select value={orderBy} onValueChange={setOrderBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CREATED_AT_DESC">Newest First</SelectItem>
              <SelectItem value="CREATED_AT_ASC">Oldest First</SelectItem>
              <SelectItem value="USERNAME_ASC">Username A-Z</SelectItem>
              <SelectItem value="USERNAME_DESC">Username Z-A</SelectItem>
              <SelectItem value="GAME_LOGS_DESC">Most Active</SelectItem>
              <SelectItem value="GAME_LOGS_ASC">Least Active</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filter Options</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 px-2 text-xs"
                >
                  Reset All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Has Game Logs Filter */}
                <div className="space-y-2">
                  <Label>Activity Status</Label>
                  <Select
                    value={hasGameLogs === null ? 'all' : hasGameLogs ? 'active' : 'inactive'}
                    onValueChange={value => {
                      if (value === 'all') setHasGameLogs(null);
                      else if (value === 'active') setHasGameLogs(true);
                      else setHasGameLogs(false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Has Game Logs</SelectItem>
                      <SelectItem value="inactive">No Game Logs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Minimum Game Logs */}
                <div className="space-y-2">
                  <Label>Minimum Game Logs</Label>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={minGameLogs || ''}
                    onChange={e => {
                      const value = e.target.value ? parseInt(e.target.value) : null;
                      setMinGameLogs(value);
                    }}
                    min={0}
                  />
                </div>

                {/* Verified Status */}
                <div className="space-y-2">
                  <Label>Verification Status</Label>
                  <Select
                    value={isVerified === null ? 'all' : isVerified ? 'verified' : 'unverified'}
                    onValueChange={value => {
                      if (value === 'all') setIsVerified(null);
                      else if (value === 'verified') setIsVerified(true);
                      else setIsVerified(false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="unverified">Unverified Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      <div>
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {totalCount > 0 ? (
                <>
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalCount)} of {formatCount(totalCount)}{' '}
                  {totalCount === 1 ? 'user' : 'users'}
                  {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
                </>
              ) : (
                <>
                  Found {formatCount(totalCount)} {totalCount === 1 ? 'user' : 'users'}
                  {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
                </>
              )}
            </p>
            {totalCount > pageSize && (
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalCount / pageSize)}
              </p>
            )}
          </div>
        )}

        {loading && !data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : currentPageUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {debouncedSearchTerm
                  ? 'Try adjusting your search terms or filters'
                  : 'Be the first to join the community!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div
              className={cn(
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-200',
                isNavigating && 'opacity-60'
              )}
            >
              {currentPageUsers.map((user: IUserNode) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>

            {/* Pagination */}
            {(hasNextPage || hasPreviousPage) && (
              <div className="flex items-center justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage || isNavigating}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-muted-foreground">
                    {isNavigating ? 'Loading...' : `Page ${currentPage}`}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  onMouseEnter={prefetchNextPage}
                  disabled={!hasNextPage || isNavigating}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
