'use client';

import { useQuery } from '@apollo/client/react/hooks';
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

import { CreateGameLogModal } from '@/components/features/games';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { badgeVariants } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GET_GAME_LOGS, GET_USER } from '@/lib/graphql/queries';
import { SharedGameLog } from '@/lib/types/generated/graphql';
import { DbCustomUser, UserProfileProps } from '@/lib/types/user.types';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

export default function UserProfile({ targetUserId }: UserProfileProps) {
  const { user: currentUser } = useUser();
  const [targetUser, setTargetUser] = useState<DbCustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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
            initiated_friendships: [],
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
    variables: { userId: dbUserId },
    skip: !dbUserId,
  });

  const { data: gameLogsData, loading: gameLogsLoading } = useQuery<{
    user: { game_logs: SharedGameLog[] };
  }>(GET_GAME_LOGS, {
    variables: {
      userId: dbUserId,
      pagination: {
        page,
        limit: ITEMS_PER_PAGE,
      },
    },
    skip: !dbUserId,
  });

  console.log('UserProfile - dbUserId:', dbUserId);
  console.log('UserProfile - userData:', userData);
  console.log('UserProfile - gameLogsData:', gameLogsData);
  console.log('UserProfile - userLoading:', userLoading);
  console.log('UserProfile - gameLogsLoading:', gameLogsLoading);

  if (isLoading || !targetUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  const userProfile = userData?.user as DbCustomUser;
  const gameLogs = gameLogsData?.user?.game_logs || [];
  const totalPages = Math.ceil((userProfile?.game_logs?.length || 0) / ITEMS_PER_PAGE);

  const calculateSecurityScore = (user: DbCustomUser) => {
    let score = 0;
    if (user.password_enabled) score += 1;
    if (user.two_factor_enabled) score += 2;
    if (user.email_verified) score += 1;
    return score;
  };

  const _securityScore = calculateSecurityScore(targetUser);
  const _maxScore = 4;

  if (userLoading || gameLogsLoading) {
    return <UserProfileSkeleton />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-[300px,1fr]">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile?.imageUrl ?? undefined} />
                <AvatarFallback>{userProfile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{userProfile?.username}</CardTitle>
                <p className="text-sm text-muted-foreground">{userProfile?.emailAddress}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Member Since</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(userProfile?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Game Logs</h3>
                <p className="text-sm text-muted-foreground">
                  {userProfile?.game_logs?.length || 0} logs
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Friends</h3>
                <p className="text-sm text-muted-foreground">
                  {userProfile?.initiated_friendships?.length || 0} friends
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Logs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Game Logs</h2>
            <CreateGameLogModal onSuccess={() => setPage(1)} />
          </div>

          {gameLogs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No game logs yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {gameLogs.map(log => (
                <Card key={log.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {log.game.teams.home.name} vs {log.game.teams.visitors.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {log.watchedDate ? new Date(log.watchedDate).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <div className={cn(badgeVariants({ variant: 'secondary' }), 'text-xs')}>
                        {log.classification
                          .split('_')
                          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Rating:</span>
                        <span className="text-sm">{'⭐'.repeat(log.rating ?? 1)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Watched:</span>
                        <span className="text-sm">
                          {log.watchedSetting
                            .split('_')
                            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        </span>
                      </div>
                      {log.notes && <p className="text-sm text-muted-foreground">{log.notes}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <Button
                    className={cn(buttonVariants({ variant: 'outline' }))}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    className={cn(buttonVariants({ variant: 'outline' }))}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserProfileSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-[300px,1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-64" />
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
