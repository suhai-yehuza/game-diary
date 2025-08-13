'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

import { GameLogsTable } from '@/app/components/game-logs/GameLogsTable';
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
    <section className="py-4 sm:py-6 bg-gradient-to-r from-primary/5 to-primary/10 mb-4 sm:mb-6">
      <div className="container mx-auto px-4 text-left">
        <p className="text-sm sm:text-base text-muted-foreground">
          {isSignedIn
            ? `Welcome, ${user?.username ?? user?.firstName ?? 'User'}!`
            : 'Welcome, Guest!'}
        </p>
      </div>
    </section>
  );
}

export default function UserDashboardPage() {
  const isMobile = useMobileDetection();
  const [selectedTab, setSelectedTab] = React.useState('game-logs');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <UserGreeting />
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          {/* Enhanced Responsive Tabs with better visual design */}
          <TabsList
            className={`mb-6 sm:mb-8 ${
              isMobile ? 'grid w-full grid-cols-3 gap-2' : 'flex w-full flex-row gap-4'
            }`}
          >
            <TabsTrigger
              value="game-logs"
              className={
                isMobile
                  ? 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-cyan-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-cyan-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-6 transition-all duration-300 font-semibold text-sm sm:text-base rounded-xl hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            >
              {isMobile ? 'Game Logs' : 'Game Logs'}
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className={
                isMobile
                  ? 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-cyan-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-cyan-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-6 transition-all duration-300 font-semibold text-sm sm:text-base rounded-xl hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            >
              {isMobile ? 'Friends' : 'Friends'}
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className={
                isMobile
                  ? 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-cyan-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-cyan-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-6 transition-all duration-300 font-semibold text-sm sm:text-base rounded-xl hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            >
              {isMobile ? 'Activity' : 'Activity & Timeline'}
            </TabsTrigger>
          </TabsList>

          {/* Tab Content - Responsive padding and spacing */}
          <TabsContent value="game-logs" className="mt-0">
            <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
              <GameLogsTable />
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-0">
            <div
              className={`rounded-lg border bg-background ${isMobile ? 'p-3' : 'p-6'} mb-4 sm:mb-8`}
            >
              <FriendsTable />
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <div
              className={`rounded-lg border bg-background ${isMobile ? 'p-3' : 'p-6'} mb-4 sm:mb-8`}
            >
              <ActivityTable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
