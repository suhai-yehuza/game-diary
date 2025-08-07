import { notFound } from 'next/navigation';
import React from 'react';

import { SimpleSportsPage } from '@/app/components/sports';
import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';

// Generate metadata for the page
export function generateMetadata({ params }: { params: { sport: string } }) {
  const sport = params.sport;
  const config = SPORTS_CONFIG[sport as keyof typeof SPORTS_CONFIG];

  if (!config) {
    return {
      title: 'Sport Not Found - Game Diary',
      description: 'The requested sport could not be found',
    };
  }

  return {
    title: `${config.name} - Game Diary`,
    description: config.description,
  };
}

export default function SportPage({ params }: { params: { sport: string } }) {
  const sport = params.sport;
  const config = SPORTS_CONFIG[sport as keyof typeof SPORTS_CONFIG];

  if (!config) return notFound();

  return (
    <SimpleSportsPage title={config.name} description={config.description}>
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p>Welcome to the {config.fullName}</p>
      </div>
    </SimpleSportsPage>
  );
}
