'use client';

import React from 'react';

import { GameLogsSection, LiveGamesSection } from '@/components/features/games';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CommunityPage() {
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
            <GameLogsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
