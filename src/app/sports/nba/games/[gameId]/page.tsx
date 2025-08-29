'use client';

// import { useUser } from '@clerk/nextjs';
import { Calendar, Clock, MapPin, Users, Trophy, ArrowLeft, Plus, Edit, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';

import { CreateGameLogModal } from '@/app/components/game-logs/CreateGameLogModal';
import { EditGameLogModal } from '@/app/components/game-logs/EditGameLogModal';
import { SportsPageLayout } from '@/app/components/sports';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { useCentralizedErrorHandler } from '@/hooks/use-centralized-error-handler';
import { useGameLogs } from '@/hooks/use-game-logs';
import { useLatestGames } from '@/hooks/use-latest-games';
import { getButtonVariant } from '@/lib/design-tokens/button-variants';
import type { IGameResponse, IGameLog, IGameDetailPageProps } from '@/lib/types';

// Interface moved to src/lib/types/page.types.ts

export default function NBAGameDetailPage({ params }: IGameDetailPageProps) {
  const { handleClerkUser } = useCentralizedErrorHandler();

  // Handle case where Clerk is not configured (e.g., during SSR or in test environment)
  const userData = handleClerkUser();
  const user = userData.user as { id?: string } | null;

  const [game, setGame] = useState<IGameResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateGameLogModalOpen, setIsCreateGameLogModalOpen] = useState(false);
  const [editingGameLog, setEditingGameLog] = useState<IGameLog | null>(null);

  const { latestGames } = useLatestGames({
    limit: 1000,
    forceRealData: false, // Use mock data instead of external API
  });

  // Fetch user's game log for this specific game
  const [userGameLogs, setUserGameLogs] = useState<IGameLog[]>([]);
  const [refetchUserGameLogs, setRefetchUserGameLogs] = useState<
    (() => Promise<unknown>) | undefined
  >(undefined);

  // Always call useGameLogs but skip when we don't have valid data
  const gameLogsData = useGameLogs({
    filters: {
      userId: user?.id,
      gameId: game?.id?.toString(),
    },
    pagination: { first: 1 },
    skip: !game?.id?.toString() || !user?.id, // Skip until we have both gameId and userId
  });

  // Update state when gameLogsData changes
  useEffect(() => {
    if (gameLogsData) {
      setUserGameLogs(gameLogsData.gameLogs || []);
      setRefetchUserGameLogs(() => gameLogsData.refetch);
    } else {
      setUserGameLogs([]);
      setRefetchUserGameLogs(undefined);
    }
  }, [gameLogsData]);

  const { handleAsync } = useCentralizedErrorHandler({
    context: { component: 'NBAGameDetailPage', action: 'Load game' },
  });

  useEffect(() => {
    const loadGame = async () => {
      const result = await handleAsync(async () => {
        const { gameId } = await params;
        const foundGame = latestGames.find(g => g.id.toString() === gameId);

        if (!foundGame) {
          throw new Error('Game not found');
        }

        return foundGame;
      });

      if (result) {
        setGame(result);
      } else {
        setError('Failed to load game');
      }
      setLoading(false);
    };

    if (latestGames.length > 0) {
      void loadGame();
    }
  }, [params, latestGames, handleAsync]);

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status || typeof status !== 'string') {
      return 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }

    switch (status.toLowerCase()) {
      case 'ft':
      case 'finished':
        return 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'live':
      case 'q1':
      case 'q2':
      case 'q3':
      case 'q4':
      case 'ot':
        return 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'scheduled':
      case 'ns':
        return 'bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const getWinner = () => {
    if (!game?.scores?.home?.points || !game?.scores?.visitors?.points) return null;

    const homeScore = game.scores.home.points;
    const awayScore = game.scores.visitors.points;

    if (homeScore > awayScore) return 'home';
    if (awayScore > homeScore) return 'visitors';
    return 'tie';
  };

  // Check if user has an existing game log for this game
  const existingGameLog = userGameLogs?.[0] || null;
  const hasExistingGameLog = !!existingGameLog;

  const handleGameLogAction = () => {
    if (hasExistingGameLog) {
      setEditingGameLog(existingGameLog);
    } else {
      setIsCreateGameLogModalOpen(true);
    }
  };

  if (loading) {
    return (
      <SportsPageLayout
        title="Loading Game..."
        description="Loading game details"
        showLiveGamesButton
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
        </div>
      </SportsPageLayout>
    );
  }

  if (error || !game) {
    return notFound();
  }

  const winner = getWinner();

  return (
    <SportsPageLayout
      title={`${game.teams.visitors.name} @ ${game.teams.home.name}`}
      description={`NBA Game - ${formatGameDate(game.date.start)}`}
      showLiveGamesButton={false}
    >
      {/* Back Button and Game Log Actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/sports/nba">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Button>
        </Link>
        {user && (
          <div className="flex items-center gap-2">
            {hasExistingGameLog && (
              <Link href={`/protected/user/game-logs/${existingGameLog.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700 hover:border-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 dark:hover:border-green-400"
                >
                  <Eye className="w-4 h-4" />
                  View Game Log
                </Button>
              </Link>
            )}
            <Button
              onClick={handleGameLogAction}
              size="sm"
              className={`flex items-center gap-2 ${getButtonVariant('primary')}`}
            >
              {hasExistingGameLog ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {hasExistingGameLog ? 'Edit Game Log' : 'Create Game Log'}
            </Button>
          </div>
        )}
      </div>

      {/* Game Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {game.teams.visitors.name} @ {game.teams.home.name}
            </CardTitle>
            <Badge
              className={`px-3 py-1 text-sm font-medium ${getStatusColor(game.status?.short)}`}
            >
              {game.status?.long ?? game.status?.short ?? 'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-700 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatGameDate(game.date.start)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatGameTime(game.date.start)}
            </div>
            {game.arena?.name && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {game.arena.name}
                {game.arena.city && `, ${game.arena.city}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Away Team */}
            <div
              className={`text-center p-6 rounded-lg border-2 ${
                winner === 'visitors'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="mb-4">
                {game.teams.visitors.logo && (
                  <Image
                    src={game.teams.visitors.logo}
                    alt={`${game.teams.visitors.name} logo`}
                    width={64}
                    height={64}
                    className="w-16 h-16 mx-auto mb-2"
                  />
                )}
                <h3 className="text-xl font-bold score-text">{game.teams.visitors.name}</h3>
                <p className="nba-team-nickname">{game.teams.visitors.nickname}</p>
              </div>
              <div className="text-4xl font-bold score-text">
                {game.scores?.visitors?.points ?? '-'}
              </div>
              {winner === 'visitors' && (
                <div className="mt-2">
                  <Trophy className="w-5 h-5 text-green-600 mx-auto" />
                </div>
              )}
            </div>

            {/* Home Team */}
            <div
              className={`text-center p-6 rounded-lg border-2 ${
                winner === 'home'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="mb-4">
                {game.teams.home.logo && (
                  <Image
                    src={game.teams.home.logo}
                    alt={`${game.teams.home.name} logo`}
                    width={64}
                    height={64}
                    className="w-16 h-16 mx-auto mb-2"
                  />
                )}
                <h3 className="text-xl font-bold score-text">{game.teams.home.name}</h3>
                <p className="nba-team-nickname">{game.teams.home.nickname}</p>
              </div>
              <div className="text-4xl font-bold score-text">
                {game.scores?.home?.points ?? '-'}
              </div>
              {winner === 'home' && (
                <div className="mt-2">
                  <Trophy className="w-5 h-5 text-green-600 mx-auto" />
                </div>
              )}
            </div>
          </div>

          {/* Game Status Details */}
          {game.status?.clock && (
            <div className="mt-6 text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {game.status.clock} - {game.status.long}
              </div>
              {game.periods && (
                <div className="text-sm nba-game-details-text mt-1">
                  Period {game.periods.current} of {game.periods.total}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarter Scores */}
        {game.scores?.home?.linescore && game.scores?.visitors?.linescore && (
          <Card>
            <CardHeader>
              <CardTitle>Quarter Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Team</th>
                      <th className="text-center py-2">Q1</th>
                      <th className="text-center py-2">Q2</th>
                      <th className="text-center py-2">Q3</th>
                      <th className="text-center py-2">Q4</th>
                      <th className="text-center py-2 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">{game.teams.visitors.nickname}</td>
                      {game.scores.visitors.linescore.map((score, index) => (
                        <td key={`visitors-q${index + 1}`} className="text-center py-2">
                          {score}
                        </td>
                      ))}
                      <td className="text-center py-2 font-bold">{game.scores.visitors.points}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">{game.teams.home.nickname}</td>
                      {game.scores.home.linescore.map((score, index) => (
                        <td key={`home-q${index + 1}`} className="text-center py-2">
                          {score}
                        </td>
                      ))}
                      <td className="text-center py-2 font-bold">{game.scores.home.points}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Details */}
        <Card>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="nba-game-details-text">Season:</span>
                <span className="font-medium">{game.season}</span>
              </div>
              <div className="flex justify-between">
                <span className="nba-game-details-text">League:</span>
                <span className="font-medium">{game.league}</span>
              </div>
              <div className="flex justify-between">
                <span className="nba-game-details-text">Stage:</span>
                <span className="font-medium">{game.stage}</span>
              </div>
              {game.timesTied !== undefined && (
                <div className="flex justify-between">
                  <span className="nba-game-details-text">Times Tied:</span>
                  <span className="font-medium">{game.timesTied}</span>
                </div>
              )}
              {game.leadChanges !== undefined && (
                <div className="flex justify-between">
                  <span className="nba-game-details-text">Lead Changes:</span>
                  <span className="font-medium">{game.leadChanges}</span>
                </div>
              )}
              {game.arena?.city && game.arena?.state && (
                <div className="flex justify-between">
                  <span className="nba-game-details-text">Location:</span>
                  <span className="font-medium">
                    {game.arena.city}, {game.arena.state}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Officials */}
      {game.officials && game.officials.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Officials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {game.officials.map(official => (
                <div
                  key={`official-${official}`}
                  className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="font-medium">{official}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Game Log Modal */}
      <CreateGameLogModal
        isOpen={isCreateGameLogModalOpen}
        onClose={() => setIsCreateGameLogModalOpen(false)}
        onSuccess={() => {
          setIsCreateGameLogModalOpen(false);
          if (refetchUserGameLogs) {
            void refetchUserGameLogs();
          }
        }}
        preSelectedGame={
          game
            ? {
                id: game.id.toString(),
                name: `${game.teams.visitors.name} @ ${game.teams.home.name}`,
                date: game.date.start,
                homeTeam: game.teams.home.name,
                awayTeam: game.teams.visitors.name,
              }
            : undefined
        }
      />

      {/* Edit Game Log Modal */}
      {editingGameLog && (
        <EditGameLogModal
          gameLog={editingGameLog}
          isOpen={!!editingGameLog}
          onClose={() => setEditingGameLog(null)}
          onSuccess={() => {
            setEditingGameLog(null);
            if (refetchUserGameLogs) {
              void refetchUserGameLogs();
            }
          }}
        />
      )}
    </SportsPageLayout>
  );
}
