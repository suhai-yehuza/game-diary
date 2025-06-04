import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

import GameLog from './game-log';

interface GameLogPageProps {
  params: {
    id: string;
  };
}

export default async function GameLogPage({ params: _params }: GameLogPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <GameLog />;
}
