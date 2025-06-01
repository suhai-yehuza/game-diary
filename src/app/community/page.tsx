'use client';

import { useQuery } from '@apollo/client';
import React, { useState } from 'react';

import { GameLogsSection } from '@/components/features/games';
import { GameLogSearchSection } from '@/components/features/games';
import { UserSearchSection } from '@/components/features/users/UserSearchSection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import { GameLog } from '@/lib/types/generated/graphql';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('recent');

  const { data, loading, fetchMore, refetch } = useQuery(GET_GAME_LOGS, {
    variables: { first: 10 },
    skip: activeTab !== 'recent',
  });

  const gameLogs = data?.gameLogs?.edges?.map((edge: { node: GameLog }) => edge.node) || [];

  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);

  const handleLoadMore = React.useCallback(async () => {
    if (!data?.gameLogs?.pageInfo?.hasNextPage || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      await fetchMore({
        variables: { after: data.gameLogs.pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            gameLogs: {
              ...fetchMoreResult.gameLogs,
              edges: [...prev.gameLogs.edges, ...fetchMoreResult.gameLogs.edges],
            },
          };
        },
      });
    } finally {
      setIsFetchingMore(false);
    }
  }, [data, fetchMore, isFetchingMore]);

  React.useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || activeTab !== 'recent') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleLoadMore, activeTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground text-lg">
            Explore game logs and connect with other fans
          </p>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="logs">Game Logs</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* Recent Activity Tab */}
          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Game Logs</CardTitle>
                <CardDescription>
                  Latest game logs from the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GameLogsSection
                  gameLogs={gameLogs}
                  loading={loading}
                  isFetchingMore={isFetchingMore}
                  loadMoreRef={loadMoreRef}
                  onLoadMore={handleLoadMore}
                  refetch={refetch}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Game Logs Search Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Game Logs</CardTitle>
                <CardDescription>
                  Find and filter game logs from across the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GameLogSearchSection />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Members</CardTitle>
                <CardDescription>
                  Discover and connect with other members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserSearchSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
