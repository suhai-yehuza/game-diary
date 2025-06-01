'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Search, Filter, Users, Calendar, ChevronLeft, ChevronRight, ChevronDown, UserPlus, UserCheck, Clock as ClockIcon, MoreVertical, Check, X, Ban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SEARCH_USERS } from '@/lib/graphql/queries';
import { SEND_FRIEND_REQUEST, ACCEPT_FRIEND_REQUEST, REJECT_FRIEND_REQUEST } from '@/lib/graphql/mutations';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/utils/index.format';
import { FRIENDSHIP_STATUS } from '@/lib/types/config.types';
import { useNotifications } from '@/contexts/NotificationContext';

interface UserSearchSectionProps {
  className?: string;
}

interface UserNode {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  emailAddress: string;
  imageUrl?: string | null;
  createdAt: string;
  gameLogs?: { id: string }[];
  initiatedFriendships?: {
    id: string;
    status: string;
    recipient: {
      id: string;
    };
  }[];
  friendships?: {
    id: string;
    status: string;
    initiator: {
      id: string;
    };
  }[];
}

const UserCard = ({ user }: { user: UserNode }) => {
  const { user: currentUser } = useUser();
  const [sendFriendRequest, { loading: sendingRequest }] = useMutation(SEND_FRIEND_REQUEST);
  const [acceptFriendRequest, { loading: acceptingRequest }] = useMutation(ACCEPT_FRIEND_REQUEST);
  const [rejectFriendRequest, { loading: rejectingRequest }] = useMutation(REJECT_FRIEND_REQUEST);
  
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const displayName = fullName || user.username;
  const gameLogCount = user.gameLogs?.length || 0;
  
  // Don't show own profile in search results
  const isOwnProfile = currentUser?.id === user.id;
  if (isOwnProfile) return null;
  
  // Determine friendship status
  const getFriendshipStatus = () => {
    if (!currentUser) return null;
    
    // Check if current user initiated a friendship with this user
    const initiatedFriendship = user.friendships?.find(
      f => f.initiator.id === currentUser.id
    );
    
    // Check if this user initiated a friendship with current user
    const receivedFriendship = user.initiatedFriendships?.find(
      f => f.recipient.id === currentUser.id
    );
    
    const friendship = initiatedFriendship || receivedFriendship;
    
    if (friendship) {
      return {
        status: friendship.status,
        friendshipId: friendship.id,
        isReceivedRequest: !!receivedFriendship  // Fixed: true when current user received the request
      };
    }
    
    return { status: FRIENDSHIP_STATUS.NONE, friendshipId: null, isReceivedRequest: false };
  };
  
  const friendshipInfo = getFriendshipStatus();
  
  const handleSendFriendRequest = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    try {
      const { data } = await sendFriendRequest({
        variables: { userId: user.id },
        refetchQueries: ['SearchUsers'],
      });
      
      if (data?.sendFriendRequest?.friendship) {
        toast.success('Friend request sent!');
      } else if (data?.sendFriendRequest?.errors?.[0]) {
        toast.error(data.sendFriendRequest.errors[0].message);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };
  
  const handleAcceptRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!friendshipInfo?.friendshipId) return;
    
    try {
      const { data } = await acceptFriendRequest({
        variables: { friendshipId: friendshipInfo.friendshipId },
        refetchQueries: ['SearchUsers'],
      });
      
      if (data?.acceptFriendRequest?.friendship) {
        toast.success('Friend request accepted!');
      } else if (data?.acceptFriendRequest?.errors?.[0]) {
        toast.error(data.acceptFriendRequest.errors[0].message);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };
  
  const handleRejectRequest = async (e: React.MouseEvent) => {
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
      } else if (data?.rejectFriendRequest?.errors?.[0]) {
        toast.error(data.rejectFriendRequest.errors[0].message);
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to reject friend request');
    }
  };
  
  const renderFriendshipStatus = () => {
    if (!friendshipInfo) return null;
    
    const isLoading = sendingRequest || acceptingRequest || rejectingRequest;
    
    switch (friendshipInfo.status) {
      case FRIENDSHIP_STATUS.ACCEPTED:
        return (
          <Badge 
            variant="secondary" 
            className="gap-0.5 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs py-0.5 px-1.5"
          >
            <UserCheck className="h-2.5 w-2.5" />
            Friends
          </Badge>
        );
      case FRIENDSHIP_STATUS.PENDING:
        // If current user received the request, show accept/reject options
        if (friendshipInfo.isReceivedRequest) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-0.5 border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 text-xs h-7 px-2"
                  disabled={isLoading}
                >
                  <ClockIcon className="h-2.5 w-2.5" />
                  Accept Request
                  <MoreVertical className="h-2.5 w-2.5 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem 
                  onClick={handleAcceptRequest}
                  disabled={isLoading}
                  className="gap-2 text-green-600 focus:text-green-600"
                >
                  <Check className="h-3.5 w-3.5" />
                  Accept Friend Request
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleRejectRequest}
                  disabled={isLoading}
                  className="gap-2 text-red-600 focus:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject Request
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        // If current user sent the request
        return (
          <Badge 
            variant="outline" 
            className="gap-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs py-0.5 px-1.5"
          >
            <ClockIcon className="h-2.5 w-2.5" />
            Request Sent
          </Badge>
        );
      case FRIENDSHIP_STATUS.BLOCKED:
        return null; // Don't show blocked status
      case FRIENDSHIP_STATUS.NONE:
      default:
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendFriendRequest}
            disabled={sendingRequest}
            className="gap-0.5 border-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 text-xs h-7 px-2"
          >
            <UserPlus className="h-2.5 w-2.5" />
            Add Friend
          </Button>
        );
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
                  {fullName && (
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  )}
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
                  Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const UserCardSkeleton = () => (
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
);

export function UserSearchSection({ className }: UserSearchSectionProps) {
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
  const pageSize = 12;
  
  const { data, loading, error, fetchMore } = useQuery(SEARCH_USERS, {
    variables: {
      first: pageSize,
      searchTerm: debouncedSearchTerm || null,
      filters: {
        hasGameLogs,
        minGameLogs,
        isVerified,
        orderBy,
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  // Check for received friend requests and create notifications
  useEffect(() => {
    if (!data?.searchUsers?.edges || !currentUser) return;
    
    const users = data.searchUsers.edges.map((edge: any) => edge.node);
    const receivedRequests = users.filter((user: UserNode) => {
      const receivedFriendship = user.initiatedFriendships?.find(
        f => f.recipient.id === currentUser.id && f.status === FRIENDSHIP_STATUS.PENDING
      );
      return !!receivedFriendship;
    });
    
    // Create notifications for received friend requests
    receivedRequests.forEach((user: UserNode) => {
      const notificationKey = `friend-request-${user.id}`;
      const existingNotification = localStorage.getItem(notificationKey);
      
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
        localStorage.setItem(notificationKey, 'true');
      }
    });
  }, [data, currentUser, addNotification]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, hasGameLogs, minGameLogs, isVerified, orderBy]);

  const users = data?.searchUsers?.edges?.map((edge: any) => edge.node) || [];
  const totalCount = data?.searchUsers?.totalCount || 0;
  const pageInfo = data?.searchUsers?.pageInfo;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = useCallback(
    async (page: number) => {
      if (page < 1 || page > totalPages) return;
      
      const isNextPage = page > currentPage;
      const cursor = isNextPage 
        ? data?.searchUsers?.edges[data.searchUsers.edges.length - 1]?.cursor
        : null;

      if (cursor) {
        await fetchMore({
          variables: {
            after: cursor,
          },
        });
      }
      
      setCurrentPage(page);
    },
    [currentPage, totalPages, data, fetchMore]
  );

  const resetFilters = () => {
    setHasGameLogs(null);
    setMinGameLogs(null);
    setIsVerified(null);
    setOrderBy('CREATED_AT_DESC');
  };

  const activeFiltersCount = [hasGameLogs, minGameLogs, isVerified].filter(f => f !== null).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 px-1">
              Searches in username, first name, last name, and email address
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
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
                    onValueChange={(value) => {
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
                    onChange={(e) => {
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
                    onValueChange={(value) => {
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
              Found {formatCount(totalCount)} {totalCount === 1 ? 'user' : 'users'}
              {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
            </p>
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-red-500">Error loading users. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {loading && !data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : users.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {users.map((user: UserNode) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i < 5 ? i + 1 : i === 5 ? -1 : totalPages;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = i === 0 ? 1 : i === 1 ? -1 : totalPages - 6 + i;
                    } else {
                      pageNum = i === 0 ? 1 : i === 1 ? -1 : i === 5 ? -1 : i === 6 ? totalPages : currentPage - 3 + i;
                    }

                    if (pageNum === -1) {
                      return <span key={i} className="px-2 text-muted-foreground">...</span>;
                    }

                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="w-9 h-9 p-0"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
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