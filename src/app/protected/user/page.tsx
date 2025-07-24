'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

import { GameLogsTable } from '@/app/components/game-logs/GameLogsTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/Tabs';

function UserGreeting() {
  // Handle case where Clerk is not configured (e.g., in test environment)
  let isLoaded = false;
  let isSignedIn = false;
  let user = null;

  try {
    const userData = useUser();
    isLoaded = userData.isLoaded;
    isSignedIn = userData.isSignedIn ?? false;
    user = userData.user;
  } catch {
    // Clerk is not configured (e.g., in test environment)
    console.log('Clerk not configured, using fallback user data');
    isLoaded = true;
    isSignedIn = false;
    user = null;
  }

  if (!isLoaded) return null;
  return (
    <section className="py-8 bg-gradient-to-r from-primary/5 to-primary/10 mb-8">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">User Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          {isSignedIn
            ? `Welcome, ${user?.username ?? user?.firstName ?? 'User'}!`
            : 'Welcome, Guest!'}
        </p>
      </div>
    </section>
  );
}

function FriendsTableStub() {
  return (
    <div className="rounded-lg border p-6 bg-background mb-8">
      <h2 className="text-2xl font-semibold mb-2">Friends</h2>
      <p className="text-muted-foreground mb-2">View and manage your friends list.</p>
      <div className="h-24 flex items-center justify-center text-muted-foreground italic">
        [Friends Table Placeholder]
      </div>
    </div>
  );
}

function ActivityTimelineStub() {
  return (
    <div className="rounded-lg border p-6 bg-background mb-8">
      <h2 className="text-2xl font-semibold mb-2">Activity & Timeline</h2>
      <p className="text-muted-foreground mb-2">See your recent activities and timeline here.</p>
      <div className="h-24 flex items-center justify-center text-muted-foreground italic">
        [Activity Timeline Placeholder]
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const [selectedTab, setSelectedTab] = React.useState('game-logs');
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <UserGreeting />
      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6 flex w-full flex-row gap-2 bg-transparent p-0 justify-start">
            <TabsTrigger
              value="game-logs"
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
            >
              Game Logs
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
            >
              Friends
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
            >
              Activity & Timeline
            </TabsTrigger>
          </TabsList>
          <TabsContent value="game-logs">
            <div className="rounded-lg border p-6 bg-background mb-8">
              <GameLogsTable />
            </div>
          </TabsContent>
          <TabsContent value="friends">
            <FriendsTableStub />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityTimelineStub />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
