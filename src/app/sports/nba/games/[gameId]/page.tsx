'use client';

import { useUser } from '@clerk/nextjs';
import { Calendar, Clock, MapPin, Users, Trophy, ArrowLeft, Plus, Edit, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { CreateGameLogModal, EditGameLogModal } from '@/app/components/game-logs/GameLogModal';
import { SportsPageLayout } from '@/app/components/sports';
import { GameStats } from '@/app/components/sports/game-stats';
import { PlayerStats } from '@/app/components/sports/player-stats';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { useCentralizedErrorHandler } from '@/hooks/use-centralized-error-handler';
import { useGameLogs } from '@/hooks/use-game-logs';
import { useGameStats } from '@/hooks/use-game-stats';
import { usePlayerStats } from '@/hooks/use-player-stats';
import { useTeamPlayers } from '@/hooks/use-team-players';
import { getButtonVariant } from '@/lib/design-tokens/button-variants';
import { getCurrentNbaSeason } from '@/lib/utils/season-filter.utils';
import type { IGameResponse, IGameLog, IGameDetailPageProps } from '@/types';

// Interface moved to src/lib/types/page.types.ts

export default function NBAGameDetailPage({ params: _params }: IGameDetailPageProps) {
  // Use proper Clerk authentication
  const { user, isLoaded, isSignedIn } = useUser();

  // Get params using useParams hook
  const routeParams = useParams();
  const gameId = routeParams?.gameId as string;

  const [game, setGame] = useState<IGameResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateGameLogModalOpen, setIsCreateGameLogModalOpen] = useState(false);
  const [editingGameLog, setEditingGameLog] = useState<IGameLog | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Note: userGameLogs and refetchUserGameLogs are now derived from memoized values below

  // Test the simplified useGameLogs hook
  const shouldSkip = !isLoaded || !isSignedIn || !user?.id || !game?.id?.toString();

  // Debug the parameters being passed to useGameLogs
  const filtersForUseGameLogs = {
    userId: user?.id,
    gameId: game?.id?.toString(),
  };

  setTimeout(() => {
    console.log('🔍 [PAGE] useGameLogs call parameters:', {
      user,
      userId: user?.id,
      game,
      gameId: game?.id,
      gameIdString: game?.id?.toString(),
      filtersForUseGameLogs,
      shouldSkip,
      timestamp: new Date().toISOString(),
    });
  }, 50);

  const gameLogsData = useGameLogs(
    filtersForUseGameLogs,
    { page: 1, limit: 1 },
    { skip: shouldSkip }
  );

  // Debug game ID format
  console.log('🔍 Game ID format check:', {
    gameId: game?.id,
    gameIdString: game?.id?.toString(),
    gameIdType: typeof game?.id,
    resolvedParamsGameId: gameId,
  });

  // Use useMemo for stable references that trigger re-renders when data changes
  const memoizedGameLogs = useMemo(() => {
    const result = gameLogsData?.gameLogs || [];
    setTimeout(() => {
      console.log('🔍 [MEMO] Memoizing game logs:', {
        gameLogsData,
        gameLogs: gameLogsData?.gameLogs,
        loading: gameLogsData?.loading,
        error: gameLogsData?.error,
        gameLogsLength: gameLogsData?.gameLogs?.length,
        resultLength: result.length,
        result: result,
        timestamp: new Date().toISOString(),
      });
    }, 200);
    return result;
  }, [gameLogsData]);

  const memoizedForceRefresh = useCallback(() => {
    console.log('🔍 Memoizing force refresh:', gameLogsData?.refresh);
    return gameLogsData?.refresh;
  }, [gameLogsData?.refresh]);

  // Use the memoized data directly instead of syncing state to avoid infinite loops
  const userGameLogs = memoizedGameLogs;
  const refetchUserGameLogs = memoizedForceRefresh;

  // Get current season for statistics
  const currentSeason = getCurrentNbaSeason().toString();

  // Fetch game statistics
  const {
    gameStats,
    loading: gameStatsLoading,
    error: gameStatsError,
  } = useGameStats({
    gameId: gameId || '',
    skip: !gameId,
  });

  // Get team IDs for fetching players
  const homeTeamId = game?.teams?.home?.id?.toString();
  const awayTeamId = game?.teams?.visitors?.id?.toString();

  // Fetch team players for both teams
  const {
    teamPlayers: homeTeamPlayers,
    loading: homeTeamPlayersLoading,
    error: homeTeamPlayersError,
  } = useTeamPlayers({
    teamId: homeTeamId || '',
    season: currentSeason,
    skip: !homeTeamId || !game,
  });

  const {
    teamPlayers: awayTeamPlayers,
    loading: awayTeamPlayersLoading,
    error: awayTeamPlayersError,
  } = useTeamPlayers({
    teamId: awayTeamId || '',
    season: currentSeason,
    skip: !awayTeamId || !game,
  });

  // Combine both teams' players
  const allTeamPlayers = useMemo(() => {
    const players = [];
    if (homeTeamPlayers) players.push(...homeTeamPlayers);
    if (awayTeamPlayers) players.push(...awayTeamPlayers);
    return players;
  }, [homeTeamPlayers, awayTeamPlayers]);

  // Fetch player statistics for selected player
  const {
    playerStats,
    loading: playerStatsLoading,
    error: playerStatsError,
  } = usePlayerStats({
    playerId: selectedPlayerId || '',
    season: currentSeason,
    gameId: gameId || '',
    skip: !selectedPlayerId || !gameId,
  });

  // Handle player selection
  const handlePlayerSelect = useCallback((playerId: string) => {
    setSelectedPlayerId(playerId);
  }, []);

  // Debug when userGameLogs data changes
  useEffect(() => {
    setTimeout(() => {
      console.log('🔍 [DATA_CHANGE] userGameLogs data changed:', {
        userGameLogs,
        userGameLogsLength: userGameLogs?.length,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  }, [userGameLogs]);

  const errorHandlerContext = useMemo(
    () => ({
      component: 'NBAGameDetailPage',
      action: 'Load game',
    }),
    []
  );

  const { handleAsync: _handleAsync } = useCentralizedErrorHandler({
    context: errorHandlerContext,
  });

  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) {
        return; // Wait for params to be resolved
      }

      console.log(`🔍 Fetching game ${gameId} directly from database...`);

      try {
        const response = await fetch(`/api/games/${gameId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            console.log(`✅ Found game ${gameId} via API`);
            setGame(data.data);
            setError(null);
          } else {
            console.log(`❌ No game data in API response for ${gameId}`);
            setError('Game data not found');
          }
        } else if (response.status === 404) {
          console.log(`❌ Game ${gameId} not found in database`);
          setError(`Game not found: ${gameId}`);
        } else {
          console.warn(`❌ API request failed: ${response.status} ${response.statusText}`);
          setError(`Failed to fetch game: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Failed to fetch game from API:', error);
        setError('Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    // Always try to load the game if we have a gameId
    if (gameId) {
      void loadGame();
    }
  }, [gameId]);

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
    if (awayScore > homeScore) return 'away';
    return 'tie';
  };

  // Check if user has an existing game log for this game
  const existingGameLog = userGameLogs?.[0] || null;
  const hasExistingGameLog = !!existingGameLog;

  setTimeout(() => {
    console.log('🎯 [BUTTON] Game log detection:', {
      userGameLogs,
      userGameLogsLength: userGameLogs?.length,
      existingGameLog,
      hasExistingGameLog,
      gameId: game?.id?.toString(),
      userId: user?.id,
      timestamp: new Date().toISOString(),
    });
  }, 500);

  // Debug logging (removed to prevent infinite re-renders)

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
      title={`${game.teams?.visitors?.name || 'Unknown'} @ ${game.teams?.home?.name || 'Unknown'}`}
      description={`NBA Game - ${formatGameDate(typeof game.date === 'string' ? game.date : game.date?.start || '')}`}
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
        {isLoaded && user && (
          <div className="flex items-center gap-2">
            {hasExistingGameLog && (
              <Link href={`/protected/dashboard/game-logs/${existingGameLog.id}`}>
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
              {(() => {
                console.log(
                  '🎯 [RENDER] Button render - hasExistingGameLog:',
                  hasExistingGameLog,
                  'userGameLogs length:',
                  userGameLogs?.length
                );
                return hasExistingGameLog ? (
                  <Edit className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                );
              })()}
              {(() => {
                console.log('🎯 [RENDER] Button text - hasExistingGameLog:', hasExistingGameLog);
                return hasExistingGameLog ? 'Edit Game Log' : 'Create Game Log';
              })()}
            </Button>
          </div>
        )}
      </div>

      {/* Game Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {game.teams?.visitors?.name || 'Unknown'} @ {game.teams?.home?.name || 'Unknown'}
            </CardTitle>
            <Badge
              className={`px-3 py-1 text-sm font-medium ${getStatusColor(typeof game.status === 'string' ? game.status : game.status?.short?.toString() || 'scheduled')}`}
            >
              {typeof game.status === 'string'
                ? game.status
                : (game.status?.long ?? game.status?.short ?? 'Unknown')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-700 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatGameDate(typeof game.date === 'string' ? game.date : game.date?.start || '')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatGameTime(typeof game.date === 'string' ? game.date : game.date?.start || '')}
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
                winner === 'away'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="mb-4">
                {game.teams?.visitors?.logo && (
                  <Image
                    src={game.teams?.visitors?.logo}
                    alt={`${game.teams?.visitors?.name || 'Team'} logo`}
                    width={64}
                    height={64}
                    className="w-16 h-16 mx-auto mb-2"
                  />
                )}
                <h3 className="text-xl font-bold score-text">
                  {game.teams?.visitors?.name || 'Unknown'}
                </h3>
                <p className="nba-team-nickname">{game.teams?.visitors?.nickname || ''}</p>
              </div>
              <div className="text-4xl font-bold score-text">
                {game.scores?.visitors?.points ?? '-'}
              </div>
              {winner === 'away' && (
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
                {game.teams?.home?.logo && (
                  <Image
                    src={game.teams?.home?.logo}
                    alt={`${game.teams?.home?.name || 'Team'} logo`}
                    width={64}
                    height={64}
                    className="w-16 h-16 mx-auto mb-2"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                )}
                <h3 className="text-xl font-bold score-text">
                  {game.teams?.home?.name || 'Unknown'}
                </h3>
                <p className="nba-team-nickname">{game.teams?.home?.nickname || ''}</p>
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
          {typeof game.status === 'string'
            ? false
            : game.status?.clock && (
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
        {(game.scores?.home as { points: number; linescore?: number[] })?.linescore &&
          (game.scores?.visitors as { points: number; linescore?: number[] })?.linescore && (
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
                        <td className="py-2 font-medium">
                          {game.teams?.visitors?.nickname || 'Away'}
                        </td>
                        {(
                          game.scores?.visitors as { points: number; linescore?: number[] }
                        )?.linescore?.map((score: number, index: number) => (
                          <td key={`away-q${index + 1}`} className="text-center py-2">
                            {score}
                          </td>
                        )) || []}
                        <td className="text-center py-2 font-bold">
                          {game.scores?.visitors?.points ?? '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">{game.teams?.home?.nickname || 'Home'}</td>
                        {(
                          game.scores?.home as { points: number; linescore?: number[] }
                        )?.linescore?.map((score: number, index: number) => (
                          <td key={`home-q${index + 1}`} className="text-center py-2">
                            {score}
                          </td>
                        )) || []}
                        <td className="text-center py-2 font-bold">
                          {game.scores?.home?.points ?? '-'}
                        </td>
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
                <span className="font-medium">{game.season || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="nba-game-details-text">League:</span>
                <span className="font-medium">{(game as { league?: string }).league || 'NBA'}</span>
              </div>
              <div className="flex justify-between">
                <span className="nba-game-details-text">Stage:</span>
                <span className="font-medium">{game.stage || 'Regular Season'}</span>
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
              {game.officials.map((official: string) => (
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

      {/* Game Statistics */}
      <div className="mt-6 space-y-6">
        <GameStats gameStats={gameStats} loading={gameStatsLoading} error={gameStatsError} />

        <PlayerStats
          playerStats={playerStats}
          teamPlayers={allTeamPlayers}
          loading={playerStatsLoading || homeTeamPlayersLoading || awayTeamPlayersLoading}
          error={playerStatsError || homeTeamPlayersError || awayTeamPlayersError}
          onPlayerSelect={handlePlayerSelect}
          selectedPlayerId={selectedPlayerId}
        />
      </div>

      {/* Create Game Log Modal */}
      <CreateGameLogModal
        isOpen={isCreateGameLogModalOpen}
        onClose={() => setIsCreateGameLogModalOpen(false)}
        onSuccess={() => {
          console.log('🎉 Game log created successfully, refetching data...');
          console.log('🔍 Current state before refetch:', {
            userGameLogs,
            userGameLogsLength: userGameLogs?.length,
            hasExistingGameLog,
            refetchUserGameLogs: !!refetchUserGameLogs,
          });
          setIsCreateGameLogModalOpen(false);
          if (refetchUserGameLogs) {
            console.log('🔄 Calling refetchUserGameLogs...');
            void refetchUserGameLogs();
          } else {
            console.warn('⚠️ refetchUserGameLogs is not available');
          }
        }}
        preSelectedGame={
          game
            ? (() => {
                const preSelectedGame = {
                  id: game.id,
                  name: `${game.teams?.visitors?.name || 'Unknown'} @ ${game.teams?.home?.name || 'Unknown'}`,
                  date: typeof game.date === 'string' ? game.date : game.date?.start || '',
                  homeTeam: game.teams?.home?.name || 'Unknown',
                  awayTeam: game.teams?.visitors?.name || 'Unknown',
                };
                console.log('🔍 preSelectedGame for modal:', preSelectedGame);
                return preSelectedGame;
              })()
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
            console.log('🎉 Game log updated successfully, refetching data...');
            setEditingGameLog(null);
            if (refetchUserGameLogs) {
              console.log('🔄 Calling refetchUserGameLogs...');
              void refetchUserGameLogs();
            } else {
              console.warn('⚠️ refetchUserGameLogs is not available');
            }
          }}
        />
      )}
    </SportsPageLayout>
  );
}
