import { GameLogView } from '@src/components/features/games';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

interface GameLogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GameLogPage({ params }: GameLogPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const resolvedParams = await params;
  return <GameLogView gameLogId={resolvedParams.id} />;
}
