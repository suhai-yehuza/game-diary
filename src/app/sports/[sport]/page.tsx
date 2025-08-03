'use client';

import Head from 'next/head';
import { notFound, useParams } from 'next/navigation';

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
  if (!config) return notFound();

  return (
    <>
      <Head>
        <title>{config.name} - Game Diary</title>
        <meta name="description" content={config.description} />
      </Head>
      <SimpleSportsPage title={config.name} description={config.description}>
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p>Welcome to the {config.fullName}</p>
        </div>
      </SimpleSportsPage>
    </>
  );
}
