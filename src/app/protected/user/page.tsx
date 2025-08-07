'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

import { GameLogsTable } from '@/app/components/game-logs/GameLogsTable';
import { MobileGameLogsTable } from '@/app/components/game-logs/MobileGameLogsTable';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/Tabs';
import { ActivityTable } from '@/app/protected/user/components/ActivityTable';
import { FriendsTable } from '@/app/protected/user/components/FriendsTable';

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
    <section className="py-6 bg-gradient-to-r from-primary/5 to-primary/10 mb-6">
      <div className="container mx-auto px-4 text-left">
        <p className="text-base text-muted-foreground">
          {isSignedIn
            ? `Welcome, ${user?.username ?? user?.firstName ?? 'User'}!`
            : 'Welcome, Guest!'}
        </p>
      </div>
    </section>
  );
}

// Mobile-optimized dashboard component
function MobileDashboard() {
  const [selectedTab, setSelectedTab] = React.useState('game-logs');

  return (
    <div className="min-h-screen bg-background">
      <UserGreeting />
      <div className="px-4 pb-6">
        {/* Mobile-optimized tabs with text-only active state */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger
              value="game-logs"
              className="data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-600 dark:text-gray-400 transition-all duration-200 font-medium text-sm py-2 rounded-lg"
            >
              Game Logs
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-600 dark:text-gray-400 transition-all duration-200 font-medium text-sm py-2 rounded-lg"
            >
              Friends
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-600 dark:text-gray-400 transition-all duration-200 font-medium text-sm py-2 rounded-lg"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game-logs" className="mt-0">
            <MobileGameLogsTable />
          </TabsContent>
          <TabsContent value="friends" className="mt-0">
            <div className="rounded-lg border bg-background">
              <FriendsTable />
            </div>
          </TabsContent>
          <TabsContent value="activity" className="mt-0">
            <div className="rounded-lg border bg-background">
              <ActivityTable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Desktop dashboard component
function DesktopDashboard() {
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
            <GameLogsTable />
          </TabsContent>
          <TabsContent value="friends">
            <div className="rounded-lg border p-6 bg-background mb-8">
              <FriendsTable />
            </div>
          </TabsContent>
          <TabsContent value="activity">
            <div className="rounded-lg border p-6 bg-background mb-8">
              <ActivityTable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const isMobile = useMobileDetection();

  return isMobile ? <MobileDashboard /> : <DesktopDashboard />;
}
