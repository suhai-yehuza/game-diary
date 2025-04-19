import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

import GameLog from './game-log';

export default async function GameLogPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <GameLog />;
}
