'use client';

import { useQuery } from '@apollo/client';
import { SignInButton } from '@clerk/nextjs';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { useAuthContext } from '@/contexts/auth-context';
import { Button } from '@src/app/components/ui/button';
import { GameLogModal } from '@src/app/protected/user/components/game-logs/game-log-modal';
import { fetchNbaGameById } from '@src/lib/external-apis';
import { GET_TEAM_GAME_STATS, GET_TEAM_H2H } from '@src/lib/graphql/queries';
import type { IGame, IGameApiResponse } from '@src/lib/types';
import type { IHeadToHeadData, ITeamGameStats } from '@src/lib/types/nba.types';
import { cn } from '@src/lib/utils';

// Helper function to validate state values
const isValidState = (state: string | undefined | null): boolean => {
  if (!state) return false;

  // Common invalid values
  if (state.length === 1 || state === 'O' || state === '0') return false;

  // Valid US state codes (2 letters) or reasonable length for full state names
  if (state.length === 2 || (state.length > 3 && state.length < 20)) {
    return /^[A-Za-z\s]+$/.test(state);
  }

  return false;
};

// Helper function to format arena location
const formatArenaLocation = (arena: {
  name?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}): string => {
  const parts = [];

  if (arena.city) parts.push(arena.city);
  if (arena.state && isValidState(arena.state)) parts.push(arena.state);
  if (arena.country) parts.push(arena.country);

  return parts.join(', ');
};

// Team display component
const TeamDisplay = ({
  team,
  score,
  opponentScore,
  isHome,
  imageErrors,
  onImageError,
  gameId,
}: {
  team: { id: string; name: string; nickname: string; code: string; logo?: string };
  score?: number;
  opponentScore?: number;
  isHome: boolean;
  imageErrors?: Record<string, boolean>;
  onImageError?: (key: string) => void;
  gameId: string;
}) => {
  if (!team) return null;

  const imageKey = `${gameId}-${isHome ? 'home' : 'visitors'}`;
  const hasImageError = imageErrors?.[imageKey] || false;

  return (
    <div className={cn('text-center space-y-6', isHome ? 'flex-row-reverse text-right' : '')}>
      {team.logo && (
        <Image
          src={hasImageError ? '/logos/gamelog.svg' : team.logo}
          alt={team.name}
          width={96}
          height={96}
          priority
          style={{ width: 96, height: 'auto' }}
          className="mx-auto w-24 h-24 object-contain"
          onError={() => onImageError?.(imageKey)}
        />
      )}
      <div className="space-y-2">
        <div className="text-xl font-bold">{team.nickname}</div>
        <div className="text-muted-foreground">
          {score !== undefined && (
            <div
              className={`text-3xl font-bold ${
                score > (opponentScore || 0) ? 'text-green-500' : 'text-muted-foreground'
              }`}
            >
              {score}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add these interfaces before the HeadToHeadSection component
const defaultHeadToHead = {
  wins: 0,
  losses: 0,
  winPercentage: '0.0%',
  lastTenGames: [],
};

const HeadToHeadSection = ({
  h2hData,
  homeTeam,
  awayTeam,
  loading,
  error,
}: {
  h2hData: IHeadToHeadData | null;
  homeTeam: { nickname: string };
  awayTeam: { nickname: string };
  loading: boolean;
  error: unknown;
}) => {
  const h2h = h2hData?.teamHeadToHead || defaultHeadToHead;

  if (loading) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-6">Head-to-Head Record</h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-6">Head-to-Head Record</h3>
        <div className="text-red-500 text-center py-8">
          <p className="text-sm">Error loading head-to-head data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-6">Head-to-Head Record</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{awayTeam.nickname}</p>
            <p className="text-2xl font-bold text-blue-600">{h2h.wins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">vs</span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{homeTeam.nickname}</p>
            <p className="text-2xl font-bold text-orange-600">{h2h.losses}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">Win Percentage</p>
          <p className="text-xl font-bold">{h2h.winPercentage}</p>
        </div>

        {h2h.lastTenGames.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Last {h2h.lastTenGames.length} Games
            </p>
            <div className="flex gap-1 justify-center">
              {h2h.lastTenGames.map((result: string, index: number) => (
                <span
                  key={index}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    result === 'W' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TeamStatsSection = ({
  teamStats,
  team,
  isHome,
  loading,
  error,
}: {
  teamStats: ITeamGameStats | null;
  team: { nickname: string; logo?: string };
  isHome: boolean;
  loading: boolean;
  error: unknown;
}) => {
  if (loading) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-xl shadow-lg overflow-hidden">
        <div
          className={`bg-gradient-to-r ${isHome ? 'from-orange-600 to-red-600' : 'from-blue-600 to-purple-600'} p-6`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full animate-pulse"></div>
            <h4 className="text-2xl font-bold text-white">{team.nickname}</h4>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-xl shadow-lg overflow-hidden">
        <div
          className={`bg-gradient-to-r ${isHome ? 'from-orange-600 to-red-600' : 'from-blue-600 to-purple-600'} p-6`}
        >
          <div className="flex items-center gap-4">
            <Image
              src={team.logo || '/logos/gamelog.svg'}
              alt={team.nickname}
              width={64}
              height={64}
              style={{ width: 64, height: 'auto' }}
              className="rounded-full bg-white p-1 object-contain"
            />
            <h4 className="text-2xl font-bold text-white">{team.nickname}</h4>
          </div>
        </div>
        <div className="p-6">
          <div className="text-red-500 text-center py-8">
            <p className="text-sm">Error loading team stats</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = teamStats?.teamGameStats;
  if (!stats) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-xl shadow-lg overflow-hidden">
        <div
          className={`bg-gradient-to-r ${isHome ? 'from-orange-600 to-red-600' : 'from-blue-600 to-purple-600'} p-6`}
        >
          <div className="flex items-center gap-4">
            <Image
              src={team.logo || '/logos/gamelog.svg'}
              alt={team.nickname}
              width={64}
              height={64}
              style={{ width: 64, height: 'auto' }}
              className="rounded-full bg-white p-1 object-contain"
            />
            <h4 className="text-2xl font-bold text-white">{team.nickname}</h4>
          </div>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground text-center py-8">No stats available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl shadow-lg overflow-hidden">
      {/* Team Header */}
      <div
        className={`bg-gradient-to-r ${isHome ? 'from-orange-600 to-red-600' : 'from-blue-600 to-purple-600'} p-6`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={stats.team?.logo || team.logo || '/logos/gamelog.svg'}
              alt={stats.team?.nickname || team.nickname}
              width={64}
              height={64}
              style={{ width: 64, height: 'auto' }}
              className="rounded-full bg-white p-1 object-contain"
            />
            <div>
              <h4 className="text-2xl font-bold text-white">
                {stats.team?.nickname || team.nickname}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{stats.points}</p>
            <p className="text-blue-100">Points</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Shooting Stats */}
        <div className="space-y-4">
          <h5 className="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2">
            Shooting
          </h5>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Field Goals</p>
              <p className="text-xl font-bold">
                {stats.field_goals_made}/{stats.field_goals_attempted}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.field_goal_percentage ? stats.field_goal_percentage.toFixed(1) : '0.0'}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">3-Pointers</p>
              <p className="text-xl font-bold">
                {stats.three_pointers_made}/{stats.three_pointers_attempted}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.three_pointer_percentage ? stats.three_pointer_percentage.toFixed(1) : '0.0'}
                %
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Free Throws</p>
              <p className="text-xl font-bold">
                {stats.free_throws_made}/{stats.free_throws_attempted}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.free_throw_percentage ? stats.free_throw_percentage.toFixed(1) : '0.0'}%
              </p>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="space-y-4">
          <h5 className="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2">
            Game Stats
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Rebounds</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total_rebounds}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Assists</p>
              <p className="text-2xl font-bold text-blue-600">{stats.assists}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Steals</p>
              <p className="text-2xl font-bold text-blue-600">{stats.steals}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Blocks</p>
              <p className="text-2xl font-bold text-blue-600">{stats.blocks}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Turnovers</p>
              <p className="text-2xl font-bold text-red-600">{stats.turnovers}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Fouls</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.personal_fouls}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const { user } = useAuthContext();
  const userId = user?.id;
  const [gameData, setGameData] = useState<IGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const handleImageError = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  // Get team IDs from game data
  const homeTeamId = gameData?.teams?.home?.id;
  const awayTeamId = gameData?.teams?.visitors?.id;

  // Fetch team game stats for both teams
  const {
    loading: homeStatsLoading,
    error: homeStatsError,
    data: homeStatsData,
  } = useQuery(GET_TEAM_GAME_STATS, {
    variables: { gameId, teamId: homeTeamId },
    skip: !gameId || !homeTeamId,
  });

  const {
    loading: awayStatsLoading,
    error: awayStatsError,
    data: awayStatsData,
  } = useQuery(GET_TEAM_GAME_STATS, {
    variables: { gameId, teamId: awayTeamId },
    skip: !gameId || !awayTeamId,
  });

  // Fetch head-to-head data
  const {
    loading: h2hLoading,
    error: h2hError,
    data: h2hData,
  } = useQuery(GET_TEAM_H2H, {
    variables: { teamId: homeTeamId, opponentId: awayTeamId },
    skip: !homeTeamId || !awayTeamId,
  });

  const processGameData = (data: IGameApiResponse['response'][0]): IGame => {
    const now = new Date();
    return {
      id: String(data.id),
      league: data.league || 'NBA',
      season: data.season,
      status: {
        long: typeof data.status === 'string' ? data.status : data.status.long || '',
        short: typeof data.status === 'string' ? data.status : data.status.short || '',
        clock: typeof data.status === 'string' ? null : data.status.clock || null,
        halftime: typeof data.status === 'string' ? false : (data.status.halftime ?? false),
      },
      date:
        typeof data.date === 'string'
          ? { start: data.date, end: null, duration: null }
          : {
              start: data.date.start || '',
              end: data.date.end || null,
              duration: data.date.duration || null,
            },
      teams: {
        home: {
          id: Number(data.teams.home.id),
          name: data.teams.home.name,
          nickname: data.teams.home.nickname || '',
          code: data.teams.home.code || '',
          logo: data.teams.home.logo || '',
        },
        visitors: {
          id: Number(data.teams.visitors.id),
          name: data.teams.visitors.name,
          nickname: data.teams.visitors.nickname || '',
          code: data.teams.visitors.code || '',
          logo: data.teams.visitors.logo || '',
        },
      },
      scores: {
        home: {
          points: data.teams.home.score,
          win: data.scores?.home.win || 0,
          loss: data.scores?.home.loss || 0,
          linescore: data.scores?.home.linescore || [],
          series: {
            win: data.scores?.home.series?.win || 0,
            loss: data.scores?.home.series?.loss || 0,
          },
        },
        visitors: {
          points: data.teams.visitors.score,
          win: data.scores?.visitors.win || 0,
          loss: data.scores?.visitors.loss || 0,
          linescore: data.scores?.visitors.linescore || [],
          series: {
            win: data.scores?.visitors.series?.win || 0,
            loss: data.scores?.visitors.series?.loss || 0,
          },
        },
      },
      periods: {
        current: data.periods?.current || 0,
        total: data.periods?.total || 0,
        endOfPeriod: data.periods?.endOfPeriod || false,
      },
      arena: {
        name: typeof data.arena === 'string' ? data.arena : data.arena?.name || '',
        city: data.arena?.city || '',
        state: data.arena?.state || '',
        country: data.arena?.country || '',
      },
      createdAt: now,
      updatedAt: now,
      officials: data.officials || [],
      timesTied: data.timesTied || 0,
      leadChanges: data.leadChanges || 0,
      nugget: data.nugget,
    };
  };

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetchNbaGameById(gameId);
        if (response && response.data && response.data.length > 0) {
          const processedData = processGameData(
            response.data[0] as IGameApiResponse['response'][0]
          );
          setGameData(processedData);
        } else {
          setError('Game not found');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch game data: ' + err);
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!gameData) return <div>Game not found</div>;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/sports/nba"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Games
            </Link>
            <div className="flex items-center gap-4">
              {userId ? (
                <GameLogModal
                  isOpen={true}
                  mode="create"
                  gameLog={undefined}
                  onClose={() => {}}
                  onSuccess={() => {}}
                />
              ) : (
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    Sign in to Create Game Log
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Game Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {gameData?.league && (
                <Image
                  src={gameData.teams.home.logo || ''}
                  alt={gameData.league}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">
                  {gameData?.teams.visitors.nickname} vs {gameData?.teams.home.nickname}
                </h1>
                <p className="text-muted-foreground">
                  {format(
                    new Date(
                      typeof gameData?.date === 'object' ? gameData.date.start : gameData.date
                    ),
                    'MMMM d, yyyy'
                  )}
                </p>
              </div>
            </div>
            <div className="text-lg font-medium">
              {typeof gameData?.status === 'object' && gameData?.status !== null
                ? gameData.status.long
                : ''}
            </div>
          </div>

          {/* Scoreboard */}
          <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Away Team */}
              <TeamDisplay
                team={{
                  id: String(gameData?.teams.visitors.id || ''),
                  code: gameData?.teams.visitors.code || '',
                  logo: gameData?.teams.visitors.logo || '',
                  name: gameData?.teams.visitors.name || '',
                  nickname: gameData?.teams.visitors.nickname || '',
                }}
                score={gameData?.scores.visitors.points}
                opponentScore={gameData?.scores.home.points}
                isHome={false}
                imageErrors={imageErrors}
                onImageError={handleImageError}
                gameId={gameId}
              />

              {/* Score */}
              <div className="text-center flex flex-col justify-center space-y-4">
                {typeof gameData?.status === 'object' &&
                  gameData?.status !== null &&
                  gameData.status.clock && (
                    <div className="text-muted-foreground">{gameData.status.clock}</div>
                  )}
                <div className="text-4xl font-bold">
                  {gameData?.scores.visitors.points} - {gameData?.scores.home.points}
                </div>
              </div>

              {/* Home Team */}
              <TeamDisplay
                team={{
                  id: String(gameData?.teams.home.id || ''),
                  code: gameData?.teams.home.code || '',
                  logo: gameData?.teams.home.logo || '',
                  name: gameData?.teams.home.name || '',
                  nickname: gameData?.teams.home.nickname || '',
                }}
                score={gameData?.scores.home.points}
                opponentScore={gameData?.scores.visitors.points}
                isHome={true}
                imageErrors={imageErrors}
                onImageError={handleImageError}
                gameId={gameId}
              />
            </div>
          </div>

          {/* Game Details and Head-to-Head */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Arena Info */}
            <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-6">Arena Information</h3>
              <div className="space-y-2">
                <p className="font-medium">
                  {typeof gameData?.arena === 'string'
                    ? gameData.arena
                    : gameData?.arena?.name || ''}
                </p>
                <p className="text-muted-foreground">
                  {formatArenaLocation(
                    typeof gameData?.arena === 'string'
                      ? { name: gameData.arena, city: '', state: null, country: null }
                      : gameData?.arena || {}
                  )}
                </p>
              </div>

              {/* Game Info */}
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Times Tied</p>
                    <p className="font-medium">{gameData?.timesTied}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lead Changes</p>
                    <p className="font-medium">{gameData?.leadChanges}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Head-to-Head */}
            <HeadToHeadSection
              h2hData={h2hData}
              homeTeam={gameData.teams.home}
              awayTeam={gameData.teams.visitors}
              loading={h2hLoading}
              error={h2hError}
            />
          </div>

          {/* Team Statistics */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-8 text-center">Team Statistics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Away Team Stats */}
              <TeamStatsSection
                teamStats={awayStatsData}
                team={gameData.teams.visitors}
                isHome={false}
                loading={awayStatsLoading}
                error={awayStatsError}
              />

              {/* Home Team Stats */}
              <TeamStatsSection
                teamStats={homeStatsData}
                team={gameData.teams.home}
                isHome={true}
                loading={homeStatsLoading}
                error={homeStatsError}
              />
            </div>
          </div>

          {/* Officials */}
          {(gameData?.officials?.length ?? 0) > 0 && (
            <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Officials</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {(gameData?.officials || []).map((official: string, index: number) => (
                  <div key={index} className="text-sm bg-gray-50 rounded p-2">
                    {official}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Nugget */}
          {gameData?.nugget && (
            <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Game Highlight</h3>
              <p className="text-muted-foreground">{gameData?.nugget}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
