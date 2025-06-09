'use client';

import { useQuery, useMutation } from '@apollo/client/react/hooks';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  Star,
  Eye,
  MessageSquare,
  Filter,
  Gamepad2,
  TrendingUp,
  Shield,
  Globe,
  Lock,
  Users2,
  UserPlus,
  UserX,
  Tv,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { GameLogModal } from '@src/components/features/games';
import { GameLogActions } from '@src/components/features/games/game-log-actions';
import { CommentsSection } from '@src/components/common/comments-section';
import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar';
import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@src/components/ui/card';
import { Skeleton } from '@src/components/ui/skeleton';
import { StarRating } from '@src/components/ui/star-rating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/components/ui/tabs';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '@src/lib/graphql/mutations';
import { GET_USER, GET_USER_FRIENDSHIPS, GET_USER_GAME_LOGS } from '@src/lib/graphql/queries';
import { logger } from 'lib/core/logger';
import { FRIENDSHIP_STATUS } from '@src/lib/types/config.types';
import type {
  GameLog,
  Friendship,
  FriendshipStatus,
  DbUser,
  ParentType,
} from '@src/lib/types/generated/graphql';
import type { UserProfileProps } from '@src/lib/types/user.types';
import { cn } from '@src/lib/utils';

const classificationIcons = {
  Private: Lock,
  Protected: Shield,
  Public: Globe,
};

const classificationColors = {
  Private: 'text-red-500 bg-red-50 border-red-200',
  Protected: 'text-amber-500 bg-amber-50 border-amber-200',
  Public: 'text-green-500 bg-green-50 border-green-200',
};

export default function UserProfile({ targetUserId }: UserProfileProps) {
  const { user: currentUser } = useUser();
  const [targetUser, setTargetUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [currentUserDbId, setCurrentUserDbId] = useState<string | null>(null);
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null | 'loading'>(
    'loading'
  );
  const [currentFriendship, setCurrentFriendship] = useState<Friendship | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  const { data: userData, loading: userLoading } = useQuery<{ user: DbUser }>(GET_USER, {
    variables: { id: dbUserId },
    skip: !dbUserId,
  });

  const {
    data: userGameLogsData,
    loading: userGameLogsLoading,
    refetch: refetchUserGameLogs,
  } = useQuery<{
    gameLogs: {
      edges: Array<{ node: GameLog }>;
      totalCount: number;
    };
  }>(GET_USER_GAME_LOGS, {
    variables: {
      filters: {
        userId: dbUserId,
        classification: selectedClassification !== 'all' ? selectedClassification : undefined,
      },
    },
    skip: !dbUserId,
  });

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

  const toggleNotesExpansion = (gameLogId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameLogId)) {
        newSet.delete(gameLogId);
      } else {
        newSet.add(gameLogId);
      }
      return newSet;
    });
  };

  const handleGameLogClick = (gameLogId: string, event: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent navigation if clicking on interactive elements
    const target = event.target as HTMLElement;
    const cardElement = event.currentTarget as HTMLElement;

    // Check for buttons, links, and other interactive elements, but exclude the card itself
    const isInteractiveElement =
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[data-interactive]') ||
      target.closest('.dropdown-menu') ||
      target.closest('[data-radix-popper-content-wrapper]') ||
      (target.closest('[role="button"]') && target.closest('[role="button"]') !== cardElement);

    if (!isInteractiveElement) {
      router.push(`/protected/user/game-logs/${gameLogId}`);
    }
  };

  if (isLoading || !targetUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (userLoading || userGameLogsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  const userProfile = userData?.user || targetUser;
  const allGameLogs = userGameLogsData?.gameLogs?.edges?.map(edge => edge.node) || [];
  const totalCount = userGameLogsData?.gameLogs?.totalCount || 0;

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const gameLogs = allGameLogs.slice(startIndex, endIndex);

  const isOwnProfile = currentUser?.id === targetUserId || !targetUserId;
  const isPendingFromCurrentUser = currentFriendship?.initiator.id === currentUserDbId;

  // Calculate stats from game logs
  const averageRating =
    gameLogs.length > 0
      ? gameLogs.reduce((sum, log) => sum + log.ratingForGame, 0) / gameLogs.length
      : 0;

  const classificationCounts = gameLogs.reduce(
    (acc, log) => {
      acc[log.classification] = (acc[log.classification] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Render friendship button based on status
  const renderFriendshipButton = () => {
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
                onClick={() => setCurrentFriendship(null)}
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
            onClick={() => setCurrentFriendship(null)}
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Profile Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
              <AvatarImage src={userProfile?.imageUrl ?? undefined} />
              <AvatarFallback className="text-3xl">
                {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {userProfile?.username || 'Unknown User'}
                    {userProfile?.email_verified && (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </h1>
                  {userProfile?.firstName || userProfile?.lastName ? (
                    <p className="text-muted-foreground">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </p>
                  ) : null}
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4" />
                    Member since{' '}
                    {userProfile?.createdAt
                      ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isOwnProfile && (
                    <GameLogModal
                      mode="create"
                      gameId={''}
                      gameLog={{} as GameLog}
                      onSuccess={() => {
                        refetchUserGameLogs({
                          variables: {
                            userId: dbUserId,
                          },
                        });
                      }}
                    />
                  )}
                  {renderFriendshipButton()}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <Gamepad2 className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{totalCount}</p>
                    <p className="text-xs text-muted-foreground">Game Logs</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <Star className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                    <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <Users2 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">
                      {userProfile?.initiatedFriendships?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Friends</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold">{userProfile?.comments?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Comments</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="game-logs" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="game-logs">Game Logs</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="game-logs" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <Badge variant="secondary">
                    {gameLogs.length}/{totalCount} results
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedClassification === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedClassification('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedClassification === 'Public' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedClassification('Public')}
                    className={cn(
                      'gap-1',
                      selectedClassification === 'Public' && 'bg-green-500 hover:bg-green-600'
                    )}
                  >
                    <Globe className="h-3 w-3" />
                    Public
                  </Button>
                  <Button
                    variant={selectedClassification === 'Protected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedClassification('Protected')}
                    className={cn(
                      'gap-1',
                      selectedClassification === 'Protected' && 'bg-amber-500 hover:bg-amber-600'
                    )}
                  >
                    <Shield className="h-3 w-3" />
                    Protected
                  </Button>
                  <Button
                    variant={selectedClassification === 'Private' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedClassification('Private')}
                    className={cn(
                      'gap-1',
                      selectedClassification === 'Private' && 'bg-red-500 hover:bg-red-600'
                    )}
                  >
                    <Lock className="h-3 w-3" />
                    Private
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Game Logs */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Game Logs</h2>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <select
                    value={selectedClassification}
                    onChange={e => setSelectedClassification(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="all">All</option>
                    <option value="Private">Private</option>
                    <option value="Protected">Protected</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>

              {userGameLogsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : gameLogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No game logs found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gameLogs.map(gameLog => {
                    const ClassificationIcon =
                      classificationIcons[
                        gameLog.classification as keyof typeof classificationIcons
                      ];
                    return (
                      <Card
                        key={gameLog.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={event => handleGameLogClick(gameLog.id, event)}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleGameLogClick(gameLog.id, event);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`View game log details for ${gameLog.game?.teams?.visitors?.name} vs ${gameLog.game?.teams?.home?.name}`}
                      >
                        <div
                          className={cn('h-1', {
                            'bg-green-500': gameLog.classification === 'Public',
                            'bg-amber-500': gameLog.classification === 'Protected',
                            'bg-red-500': gameLog.classification === 'Private',
                          })}
                        />
                        <CardContent className="p-0">
                          {/* Header Section */}
                          <div className="p-6 pb-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-xl text-foreground">
                                    {gameLog.game?.teams?.visitors?.name} vs{' '}
                                    {gameLog.game?.teams?.home?.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'gap-1 text-xs',
                                      classificationColors[
                                        gameLog.classification as keyof typeof classificationColors
                                      ]
                                    )}
                                  >
                                    <ClassificationIcon className="h-3 w-3" />
                                    {gameLog.classification}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">
                                      Rating:
                                    </span>
                                    <StarRating ratingForGame={gameLog.ratingForGame} size="sm" />
                                    <span className="text-sm font-medium text-foreground">
                                      {gameLog.ratingForGame}/5
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {isOwnProfile && (
                                <GameLogActions
                                  gameLog={gameLog}
                                  onSuccess={() => {
                                    refetchUserGameLogs({
                                      variables: {
                                        userId: dbUserId,
                                      },
                                    });
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          {/* Watching Details Section */}
                          <div className="px-6 pb-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Watching Details
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Date:</span>
                                  <span className="font-medium">
                                    {gameLog.watchedDate
                                      ? new Date(gameLog.watchedDate).toLocaleDateString()
                                      : 'Not specified'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  <Tv className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Method:</span>
                                  <span className="font-medium">
                                    {gameLog.watchedSetting
                                      .split('_')
                                      .map(
                                        (word: string) =>
                                          word.charAt(0).toUpperCase() + word.slice(1)
                                      )
                                      .join(' ')}
                                  </span>
                                </div>

                                {gameLog.watchedLocation && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Location:</span>
                                    <span className="font-medium">{gameLog.watchedLocation}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Scope:</span>
                                  <span className="font-medium">{gameLog.watchedScope}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Notes Section */}
                          {gameLog.notes && (
                            <div className="px-6 pb-4">
                              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                                <div className="p-4 flex items-center justify-between">
                                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Notes
                                  </h4>
                                  <button
                                    onClick={event => {
                                      event.stopPropagation();
                                      toggleNotesExpansion(gameLog.id);
                                    }}
                                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                                    aria-label={
                                      expandedNotes.has(gameLog.id)
                                        ? 'Collapse notes'
                                        : 'Expand notes'
                                    }
                                  >
                                    {expandedNotes.has(gameLog.id) ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </button>
                                </div>
                                {expandedNotes.has(gameLog.id) && (
                                  <div className="px-4 pb-4">
                                    <p className="text-sm text-foreground leading-relaxed">
                                      {gameLog.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Footer Section */}
                          <div className="px-6 pb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {gameLog?.tags && gameLog.tags.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Tags:</span>
                                    {gameLog.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        #{tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(gameLog.createdAt), {
                                  addSuffix: true,
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Comments Section */}
                          <div
                            className="border-t border-muted/50"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="px-6 pb-6">
                                                          <CommentsSection
                              parentId={gameLog.id}
                              parentType={'game_log' as ParentType}
                              initialExpanded={false}
                            />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Game Log Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(classificationCounts).map(([classification, count]) => {
                      const Icon =
                        classificationIcons[classification as keyof typeof classificationIcons];
                      const percentage = ((count / totalCount) * 100).toFixed(1);
                      return (
                        <div key={classification} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{classification}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-secondary rounded-full h-2">
                              <div
                                className={cn('h-2 rounded-full', {
                                  'bg-green-500': classification === 'Public',
                                  'bg-amber-500': classification === 'Protected',
                                  'bg-red-500': classification === 'Private',
                                })}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Rating Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
                    <StarRating ratingForGame={averageRating} size="lg" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on {totalCount} game logs
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Activity timeline coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
