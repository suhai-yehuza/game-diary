'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

function UserGreeting() {
  const { isLoaded, isSignedIn, user } = useUser();
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

function GameLogsTableStub() {
  return (
    <div className="rounded-lg border p-6 bg-background mb-8">
      <h2 className="text-2xl font-semibold mb-2">Game Logs</h2>
      <p className="text-muted-foreground mb-2">View and manage your created game logs here.</p>
      <div className="h-24 flex items-center justify-center text-muted-foreground italic">
        [Game Logs Table Placeholder]
      </div>
      <div className="flex gap-2 mt-4">
        <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
          Create New Log
        </button>
      </div>
    </div>
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

function UserSettingsStub() {
  return (
    <div className="rounded-lg border p-6 bg-background mb-8">
      <h2 className="text-2xl font-semibold mb-2">User Settings</h2>
      <p className="text-muted-foreground mb-2">Manage your account settings and preferences.</p>
      <div className="h-24 flex items-center justify-center text-muted-foreground italic">
        [User Settings Placeholder]
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <UserGreeting />
      <div className="container mx-auto px-4 py-8">
        <GameLogsTableStub />
        <FriendsTableStub />
        <ActivityTimelineStub />
        <UserSettingsStub />
      </div>
    </div>
  );
}
