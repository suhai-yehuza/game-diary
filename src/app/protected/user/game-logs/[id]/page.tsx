import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

import { GameLog } from '@src/components/features/game-logs';
import type { GameLogPageProps } from '@src/lib/types/consolidated.types';

export default async function GameLogPage({ params }: GameLogPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <GameLog gameLogId={params.id} />;
}
