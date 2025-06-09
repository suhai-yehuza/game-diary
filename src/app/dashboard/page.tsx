'use client';

import { useState } from 'react';

import { BasketballGameSearchSection } from '@src/app/protected/user/components/game-logs/basketball-game-search-section';
import { GameLogSearchSection } from '@src/app/protected/user/components/game-logs/game-log-search-section';
import { UserSearchSection } from '@src/app/protected/user/components/search/user-search-section';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('logs');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Explore game logs and connect with other fans
          </p>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="logs" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="games">Basketball Games</TabsTrigger>
            <TabsTrigger value="logs">Game Logs</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* Basketball Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>NBA Games</CardTitle>
                <CardDescription>
                  Browse and search NBA games from the current and past seasons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BasketballGameSearchSection />
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
                <CardTitle>Dashboard Members</CardTitle>
                <CardDescription>Discover and connect with other members</CardDescription>
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
