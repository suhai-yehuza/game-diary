'use client';

import Link from 'next/link';

import { SimpleSportsPage } from '@/app/components/sports';

export default function NBAPage() {
  return (
    <SimpleSportsPage
      title="NBA"
      description="National Basketball Association - Live scores, stats, and more"
    >
      <div className="flex flex-wrap gap-4 mb-6">
        <Link
          href="/sports/live"
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
          Live Games
        </Link>
      </div>
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p>Welcome to the NBA section</p>
      </div>
    </SimpleSportsPage>
  );
}
