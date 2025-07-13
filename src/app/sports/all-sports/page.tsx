'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function AllSportsPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  let greeting;
  if (!isLoaded) {
    greeting = 'Loading...';
  } else if (isSignedIn) {
    greeting = `Welcome, ${user?.username ?? user?.firstName ?? 'User'}!`;
  } else {
    greeting = 'Welcome, Guest! (Not signed in)';
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">All Sports</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Explore all sports leagues - NBA, NFL, MLB, NHL, MLS and more
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
            href="/sports/nba"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            NBA
          </Link>
          <Link
            href="/sports/nfl"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            NFL
          </Link>
          <Link
            href="/sports/mlb"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            MLB
          </Link>
          <Link
            href="/sports/nhl"
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
          >
            NHL
          </Link>
          <Link
            href="/sports/mls"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            MLS
          </Link>
        </div>
      </div>
      <div>
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p>{greeting}</p>
        </div>
      </div>
    </section>
  );
}
