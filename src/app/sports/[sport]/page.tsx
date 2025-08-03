'use client';

import { notFound, useParams } from 'next/navigation';
import React from 'react';

import { SimpleSportsPage } from '@/app/components/sports';
import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';

export default function SportPage() {
  const params = useParams();
  const sport =
    typeof params.sport === 'string'
      ? params.sport
      : Array.isArray(params.sport)
        ? params.sport[0]
        : '';
  const config = SPORTS_CONFIG[sport as keyof typeof SPORTS_CONFIG];

  // Set document title using useEffect with multiple attempts
  React.useEffect(() => {
    if (config) {
      // Set title immediately
      document.title = `${config.name} - Game Diary`;

      // Also set it after a short delay to handle timing issues
      const timer = setTimeout(() => {
        document.title = `${config.name} - Game Diary`;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [config]);

  if (!config) return notFound();

  return (
    <SimpleSportsPage title={config.name} description={config.description}>
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p>Welcome to the {config.fullName}</p>
      </div>
    </SimpleSportsPage>
  );
}
