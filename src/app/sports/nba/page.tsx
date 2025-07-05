'use client';

import { SignedIn, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';

import { LiveGamesDetail } from '@src/app/components/live-games-detail';

export default function NBAPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">NBA</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          National Basketball Association - Live scores, stats, and more
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <Link
            href="/sports/live"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
            Live Games
          </Link>
          <Link
            href="/protected/admin/experimental"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            API Testing
          </Link>
        </div>
      </div>

      <SignedIn>
        <div>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <UserWelcome />
          </div>

          <LiveGamesDetail />
        </div>
      </SignedIn>
    </div>
  );
}

function UserWelcome() {
  const { user } = useUser();
  return (
    <p className="text-sm text-blue-800 dark:text-blue-200">
      Welcome back, {user?.firstName}! You can access live games and API testing features.
    </p>
  );
}
