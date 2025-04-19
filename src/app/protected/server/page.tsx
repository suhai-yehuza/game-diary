'use server';

import React from 'react';

import { NbaDataClient } from '@/components/features/games/nba-data-client';

export default async function Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">NBA Data Dashboard</h1>
      <NbaDataClient />
    </div>
  );
}
