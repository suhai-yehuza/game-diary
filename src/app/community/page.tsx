'use client';

import { useState } from 'react';

import { BasketballGameSearchSection } from '@/components/features/games/BasketballGameSearchSection';
import { GameLogSearchSection } from '@/components/features/games/GameLogSearchSection';
import { UserSearchSection } from '@/components/features/users/UserSearchSection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('logs');

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
                <CardTitle>Community Members</CardTitle>
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
