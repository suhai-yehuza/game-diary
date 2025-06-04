'use client';

import { gql } from '@apollo/client';
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
  UserCheck,
  UserX,
  Tv,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { GameLogModal } from '@/components/features/games';
import { GameLogActions } from '@/components/features/games/game-log-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/star-rating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEND_FRIEND_REQUEST, ACCEPT_FRIEND_REQUEST, REMOVE_FRIEND } from '@/lib/graphql/mutations';
import { GET_GAME_LOGS, GET_USER } from '@/lib/graphql/queries';
import { logger } from '@/lib/logger';
import { GameLog, Friendship, FriendshipStatus, DBUser } from '@/lib/types/generated/graphql';
import { UserProfileProps } from '@/lib/types/user.types';
import { cn } from '@/lib/utils';
// Custom query to get friendships between two users
const GET_USER_FRIENDSHIPS = gql`
  query GetUserFriendships($userId: ID!) {
    user(id: $userId) {
      id
      initiatedFriendships {
        id
        status
        createdAt
        updatedAt
        initiator {
          id
          emailAddress
          imageUrl
          firstName
          lastName
        }
        recipient {
          id
          emailAddress
          imageUrl
          firstName
          lastName
        }
      }
      friendships {
        id
        status
        createdAt
        updatedAt
        initiator {
          id
          emailAddress
          imageUrl
          firstName
          lastName
        }
        recipient {
          id
          emailAddress
          imageUrl
          firstName
          lastName
        }
      }
    }
  }
`;

const ITEMS_PER_PAGE = 10;

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
  const [targetUser, setTargetUser] = useState<DBUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [currentUserDbId, setCurrentUserDbId] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null | 'loading'>(
    'loading'
  );
  const [currentFriendship, setCurrentFriendship] = useState<Friendship | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

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
            createdAt: currentUser.createdAt ? new Date(currentUser.createdAt) : new Date(),
            updatedAt: currentUser.updatedAt ? new Date(currentUser.updatedAt) : new Date(),
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
            deletedAt: null,
            external_id: '',
            inboundFriendshipIds: [],
            outboundFriendshipIds: [],
            timestamp: new Date(),
            friendships: [],
            initiatedFriendships: [],
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

  const { data: userData, loading: userLoading } = useQuery<{ user: DBUser }>(GET_USER, {
    variables: { id: dbUserId },
    skip: !dbUserId,
  });

  const {
    data: gameLogsData,
    loading: gameLogsLoading,
    refetch: refetchGameLogs,
  } = useQuery<{
    gameLogs: {
      edges: Array<{ node: GameLog; cursor: string }>;
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        endCursor: string | null;
        startCursor: string | null;
      };
    };
  }>(GET_GAME_LOGS, {
    variables: {
      first: ITEMS_PER_PAGE,
      after: cursor,
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

  if (isLoading || !targetUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  const userProfile = userData?.user || targetUser;
  const gameLogs = gameLogsData?.gameLogs?.edges?.map((edge: { node: GameLog }) => edge.node) || [];
  const hasNextPage = gameLogsData?.gameLogs?.pageInfo?.hasNextPage || false;
  const hasPreviousPage = gameLogsData?.gameLogs?.pageInfo?.hasPreviousPage || false;

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

  if (userLoading || gameLogsLoading) {
    return <UserProfileSkeleton />;
  }

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

      case 'Pending':
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
            <div className="flex gap-2">
              <Button
                onClick={handleAcceptFriendRequest}
                disabled={isLoading}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <UserCheck className="h-4 w-4" />
                {isLoading ? 'Accepting...' : 'Accept Request'}
              </Button>
              <Button
                onClick={handleRemoveFriend}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <UserX className="h-4 w-4" />
                Decline
              </Button>
            </div>
          );
        }

      case 'Accepted':
        return (
          <Button
            onClick={handleRemoveFriend}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <UserCheck className="h-4 w-4" />
            {isLoading ? 'Removing...' : 'Friends'}
          </Button>
        );

      case 'Rejected':
        return (
          <Button variant="outline" size="sm" disabled className="gap-2">
            <UserX className="h-4 w-4" />
            Request Rejected
          </Button>
        );

      case 'Blocked':
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
                        setCursor(null);
                        refetchGameLogs({
                          variables: {
                            first: ITEMS_PER_PAGE,
                            after: null,
                            filters: {
                              userId: dbUserId,
                              classification:
                                selectedClassification !== 'all'
                                  ? selectedClassification
                                  : undefined,
                            },
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
                    <p className="text-2xl font-bold">{gameLogsData?.gameLogs?.totalCount || 0}</p>
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
                  <Badge variant="secondary">{gameLogs.length} results</Badge>
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
            {gameLogs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No game logs found</p>
                  {selectedClassification !== 'all' && (
                    <Button
                      variant="link"
                      onClick={() => setSelectedClassification('all')}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {gameLogs.map(log => {
                  const ClassificationIcon = classificationIcons[log.classification];
                  return (
                    <Card
                      key={log.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div
                        className={cn('h-1', {
                          'bg-green-500': log.classification === 'Public',
                          'bg-amber-500': log.classification === 'Protected',
                          'bg-red-500': log.classification === 'Private',
                        })}
                      />
                      <CardContent className="p-0">
                        {/* Header Section */}
                        <div className="p-6 pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-xl text-foreground">
                                  {log.game?.teams?.visitors?.name} vs {log.game?.teams?.home?.name}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'gap-1 text-xs',
                                    classificationColors[log.classification]
                                  )}
                                >
                                  <ClassificationIcon className="h-3 w-3" />
                                  {log.classification}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Rating:
                                  </span>
                                  <StarRating ratingForGame={log.ratingForGame} size="sm" />
                                  <span className="text-sm font-medium text-foreground">
                                    {log.ratingForGame}/5
                                  </span>
                                </div>
                              </div>
                            </div>

                            {isOwnProfile && (
                              <GameLogActions
                                gameLog={log}
                                onSuccess={() => {
                                  refetchGameLogs({
                                    variables: {
                                      first: ITEMS_PER_PAGE,
                                      after: cursor,
                                      filters: {
                                        userId: dbUserId,
                                        classification:
                                          selectedClassification !== 'all'
                                            ? selectedClassification
                                            : undefined,
                                      },
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
                                  {log.watchedDate
                                    ? new Date(log.watchedDate).toLocaleDateString()
                                    : 'Not specified'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Tv className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-medium">
                                  {log.watchedSetting
                                    .split('_')
                                    .map(
                                      (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                                    )
                                    .join(' ')}
                                </span>
                              </div>

                              {log.watchedLocation && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Location:</span>
                                  <span className="font-medium">{log.watchedLocation}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Scope:</span>
                                <span className="font-medium">{log.watchedScope}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notes Section */}
                        {log.notes && (
                          <div className="px-6 pb-4">
                            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleNotesExpansion(log.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                              >
                                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Notes
                                </h4>
                                {expandedNotes.has(log.id) ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                              {expandedNotes.has(log.id) && (
                                <div className="px-4 pb-4">
                                  <p className="text-sm text-foreground leading-relaxed">
                                    {log.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer Section */}
                        <div className="px-6 pb-6">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {log?.tags && log.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Tags:</span>
                                  {log.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Pagination */}
                {(hasNextPage || hasPreviousPage) && (
                  <div className="flex justify-center space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCursor(null)}
                      disabled={!hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (gameLogsData?.gameLogs?.pageInfo?.endCursor) {
                          setCursor(gameLogsData.gameLogs.pageInfo.endCursor);
                        }
                      }}
                      disabled={!hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                )}
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
                      const percentage = ((count / gameLogs.length) * 100).toFixed(1);
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
                      Based on {gameLogs.length} game logs
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

function UserProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Profile Header Skeleton */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="border-2">
                    <CardContent className="p-4 text-center">
                      <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
                      <Skeleton className="h-6 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-full md:w-[400px]" />

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <Skeleton className="h-1 w-full" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-64 mb-2" />
                      <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full mb-3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
