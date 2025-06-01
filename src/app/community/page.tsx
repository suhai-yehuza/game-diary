'use client';

import React from 'react';

import { GameLogsSection, LiveGamesSection } from '@/components/features/games';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import { usePaginatedData } from '@/lib/hooks/use-paginated-data';
import { GameLog } from '@/lib/types/game.types';
import { API_CONFIG } from '@/lib/config/api.config';

export default function CommunityPage() {
  const { data, loading, isFetchingMore, loadMoreRef, handleLoadMore } = usePaginatedData<GameLog>({
    query: GET_GAME_LOGS,
    variables: { first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE },
    dataKey: 'gameLogs',
  });

  const gameLogs = data?.gameLogs?.edges?.map((edge: { node: GameLog }) => edge.node) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to the Town Square</h1>
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live">Live Games</TabsTrigger>
            <TabsTrigger value="logs">Game Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="live" className="mt-6">
            <LiveGamesSection />
          </TabsContent>
          <TabsContent value="logs" className="mt-6">
            <GameLogsSection
              gameLogs={gameLogs}
              loading={loading}
              isFetchingMore={isFetchingMore}
              loadMoreRef={loadMoreRef}
              onLoadMore={handleLoadMore}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
