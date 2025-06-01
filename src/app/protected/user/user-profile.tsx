'use client';

import { useQuery } from '@apollo/client/react/hooks';
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Clock, 
  Star,
  Eye,
  MessageSquare,
  Heart,
  Filter,
  ChevronRight,
  Gamepad2,
  TrendingUp,
  Shield,
  Globe,
  Lock,
  Users2
} from 'lucide-react';

import { CreateGameLogModal } from '@/components/features/games';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GET_GAME_LOGS, GET_USER } from '@/lib/graphql/queries';
import { GameLog } from '@/lib/types/generated/graphql';
import { DbCustomUser, UserProfileProps } from '@/lib/types/user.types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { StarRating } from '@/components/ui/star-rating';

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
  const [targetUser, setTargetUser] = useState<DbCustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [selectedClassification, setSelectedClassification] = useState<string>('all');

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
            game_logs: [],
            initiatedFriendships: [],
            comments: [],
            reactions: [],
            received_friendships: [],
            password_enabled: currentUser.passwordEnabled,
            two_factor_enabled: currentUser.twoFactorEnabled,
            email_verified: currentUser.emailAddresses[0]?.verification?.status === 'verified',
            email_verification_strategy:
              currentUser.emailAddresses[0]?.verification?.strategy || '',
            banned: false,
            external_accounts: [],
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
          console.error('Error fetching current user from database:', error);
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
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [targetUserId, currentUser]);

  const { data: userData, loading: userLoading } = useQuery<{ user: DbCustomUser }>(GET_USER, {
    variables: { id: dbUserId },
    skip: !dbUserId,
  });

  const { data: gameLogsData, loading: gameLogsLoading, fetchMore } = useQuery<{
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

  // console.log('UserProfile - dbUserId:', dbUserId);
  // console.log('UserProfile - userData:', userData);
  // console.log('UserProfile - gameLogsData:', gameLogsData);
  // console.log('UserProfile - userLoading:', userLoading);
  // console.log('UserProfile - gameLogsLoading:', gameLogsLoading);

  if (isLoading || !targetUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  const userProfile = userData?.user || targetUser;
  const gameLogs = gameLogsData?.gameLogs?.edges?.map(edge => edge.node) || [];
  const hasNextPage = gameLogsData?.gameLogs?.pageInfo?.hasNextPage || false;
  const hasPreviousPage = gameLogsData?.gameLogs?.pageInfo?.hasPreviousPage || false;

  const isOwnProfile = currentUser?.id === targetUserId || !targetUserId;

  // Calculate stats from game logs
  const averageRating = gameLogs.length > 0 
    ? gameLogs.reduce((sum, log) => sum + (log.ratingForGame || 0), 0) / gameLogs.length 
    : 0;

  const classificationCounts = gameLogs.reduce((acc, log) => {
    acc[log.classification] = (acc[log.classification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (userLoading || gameLogsLoading) {
    return <UserProfileSkeleton />;
  }

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
                    Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                {isOwnProfile && (
                  <CreateGameLogModal onSuccess={() => setCursor(null)} />
                )}
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
                    <p className="text-2xl font-bold">{userProfile?.initiatedFriendships?.length || 0}</p>
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
                    className={cn('gap-1', selectedClassification === 'Public' && 'bg-green-500 hover:bg-green-600')}
                  >
                    <Globe className="h-3 w-3" />
                    Public
                  </Button>
                  <Button
                    variant={selectedClassification === 'Protected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedClassification('Protected')}
                    className={cn('gap-1', selectedClassification === 'Protected' && 'bg-amber-500 hover:bg-amber-600')}
                  >
                    <Shield className="h-3 w-3" />
                    Protected
                  </Button>
                  <Button
                    variant={selectedClassification === 'Private' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedClassification('Private')}
                    className={cn('gap-1', selectedClassification === 'Private' && 'bg-red-500 hover:bg-red-600')}
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
                    <Card key={log.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className={cn("h-1", {
                        "bg-green-500": log.classification === 'Public',
                        "bg-amber-500": log.classification === 'Protected',
                        "bg-red-500": log.classification === 'Private',
                      })} />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {log.game.teams.home.name} vs {log.game.teams.visitors.name}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={cn("gap-1", classificationColors[log.classification])}
                              >
                                <ClassificationIcon className="h-3 w-3" />
                                {log.classification}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {log.watchedDate ? new Date(log.watchedDate).toLocaleDateString() : 'Not specified'}
                              </span>
                              {log.watchedLocation && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {log.watchedLocation}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {log.watchedSetting
                                  .split('_')
                                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {log.watchedScope}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <StarRating rating={log.ratingForGame || 0} size="md" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        
                        {log.notes && (
                          <div className="bg-muted/50 rounded-lg p-3 mb-3">
                            <p className="text-sm">{log.notes}</p>
                          </div>
                        )}
                        
                        {log.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {log.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
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
                      const Icon = classificationIcons[classification as keyof typeof classificationIcons];
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
                                className={cn("h-2 rounded-full", {
                                  "bg-green-500": classification === 'Public',
                                  "bg-amber-500": classification === 'Protected',
                                  "bg-red-500": classification === 'Private',
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
                    <StarRating rating={averageRating} size="lg" />
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
