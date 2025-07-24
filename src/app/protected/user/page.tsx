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
        {/* Add test elements for security tests */}
        {isSignedIn && user && (
          <div className="mt-4 text-sm text-muted-foreground">
            <div data-testid="user-email">
              {user.emailAddresses?.[0]?.emailAddress || 'No email'}
            </div>
            <div data-testid="user-phone">{user.phoneNumbers?.[0]?.phoneNumber || 'No phone'}</div>
          </div>
        )}
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
          <TabsList className="mb-6">
            <TabsTrigger value="game-logs">Game Logs</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="activity">Activity & Timeline</TabsTrigger>
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
