'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_GAME } from '@/lib/graphql/queries';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Game } from '@/lib/types/types';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;

  const {
    loading,
    error,
    data: gameData,
  } = useQuery<{ game: Game }>(GET_GAME, {
    variables: { id: gameId },
  });

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const handleImageError = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  useEffect(() => {
    console.log({ gameData });
  }, [gameData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const game = gameData?.game;

  if (!game) return <div>Game not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/sports/nba"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Games
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Game Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {game.league.logo && (
                <Image
                  src={game.league.logo}
                  alt={game.league.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">
                  {game.teams.visitors.nickname} vs {game.teams.home.nickname}
                </h1>
                <p className="text-muted-foreground">
                  {format(new Date(game.date.start), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="text-lg font-medium">{game.status.long}</div>
          </div>

          {/* Scoreboard */}
          <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-3 gap-4">
              {/* Away Team */}
              <div className="text-center">
                {game.teams.visitors.logo && (
                  <Image
                    src={
                      imageErrors[`${game.id}-visitors`] ? '/gamelog.svg' : game.teams.visitors.logo
                    }
                    alt={game.teams.visitors.name}
                    width={80}
                    height={80}
                    className="mx-auto mb-4 w-20 h-20"
                    onError={() => handleImageError(`${game.id}-visitors`)}
                  />
                )}
                <div className="text-xl font-bold">{game.teams.visitors.nickname}</div>
                <div className="text-muted-foreground">
                  {game.scores.visitors.win}-{game.scores.visitors.loss}
                </div>
              </div>

              {/* Score */}
              <div className="text-center flex flex-col justify-center">
                <div className="text-4xl font-bold">
                  {game.scores.visitors.points} - {game.scores.home.points}
                </div>
                {game.status.clock && (
                  <div className="text-muted-foreground mt-2">{game.status.clock}</div>
                )}
              </div>

              {/* Home Team */}
              <div className="text-center">
                {game.teams.home.logo && (
                  <Image
                    src={imageErrors[`${game.id}-home`] ? '/gamelog.svg' : game.teams.home.logo}
                    alt={game.teams.home.name}
                    width={80}
                    height={80}
                    className="mx-auto mb-4 w-20 h-20"
                    onError={() => handleImageError(`${game.id}-home`)}
                  />
                )}
                <div className="text-xl font-bold">{game.teams.home.nickname}</div>
                <div className="text-muted-foreground">
                  {game.scores.home.win}-{game.scores.home.loss}
                </div>
              </div>
            </div>

            {/* Quarter Scores */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Quarter Scores</h3>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center font-medium">Team</div>
                {game.scores.visitors.linescore.map((score, index) => (
                  <div key={index} className="text-center font-medium">
                    Q{index + 1}
                  </div>
                ))}
                <div className="text-center font-medium">Total</div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-2">
                <div className="text-center">{game.teams.visitors.nickname}</div>
                {game.scores.visitors.linescore.map((score, index) => (
                  <div key={index} className="text-center">
                    {score}
                  </div>
                ))}
                <div className="text-center font-bold">{game.scores.visitors.points}</div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-2">
                <div className="text-center">{game.teams.home.nickname}</div>
                {game.scores.home.linescore.map((score, index) => (
                  <div key={index} className="text-center">
                    {score}
                  </div>
                ))}
                <div className="text-center font-bold">{game.scores.home.points}</div>
              </div>
            </div>
          </div>

          {/* Game Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Arena Info */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Arena Information</h3>
              <div className="space-y-2">
                <p className="font-medium">{game.arena.name}</p>
                <p className="text-muted-foreground">
                  {game.arena.city}, {game.arena.state}, {game.arena.country}
                </p>
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Game Statistics</h3>
              <div className="space-y-2">
                <p>Times Tied: {game.timesTied}</p>
                <p>Lead Changes: {game.leadChanges}</p>
                {game.officials.length > 0 && (
                  <div>
                    <p className="font-medium">Officials:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {game.officials.map((official, index) => (
                        <li key={index}>{official}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Statistics */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6">Team Statistics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {game.statistics?.map((teamStats, index) => (
                <div key={index} className="bg-card rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-6">
                    {teamStats.team.logo && (
                      <Image
                        src={teamStats.team.logo}
                        alt={teamStats.team.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <h4 className="text-xl font-bold">{teamStats.team.nickname}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-4">Shooting</h5>
                      <div className="space-y-2 text-sm">
                        <p>
                          Field Goals: {teamStats.fieldGoals.made}/{teamStats.fieldGoals.attempted}{' '}
                          ({teamStats.fieldGoals.percentage.toFixed(1)}%)
                        </p>
                        <p>
                          3-Pointers: {teamStats.threePointers.made}/
                          {teamStats.threePointers.attempted} (
                          {teamStats.threePointers.percentage.toFixed(1)}%)
                        </p>
                        <p>
                          Free Throws: {teamStats.freeThrows.made}/{teamStats.freeThrows.attempted}{' '}
                          ({teamStats.freeThrows.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-4">Game Stats</h5>
                      <div className="space-y-2 text-sm">
                        <p>Points: {teamStats.points}</p>
                        <p>
                          Rebounds: {teamStats.rebounds.total} (Off: {teamStats.rebounds.offensive},
                          Def: {teamStats.rebounds.defensive})
                        </p>
                        <p>Assists: {teamStats.assists}</p>
                        <p>Steals: {teamStats.steals}</p>
                        <p>Blocks: {teamStats.blocks}</p>
                        <p>Turnovers: {teamStats.turnovers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h5 className="font-medium mb-4">Additional Stats</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p>Fast Break Points: {teamStats.statistics.fastBreakPoints}</p>
                        <p>Points in Paint: {teamStats.statistics.pointsInPaint}</p>
                        <p>Biggest Lead: {teamStats.statistics.biggestLead}</p>
                      </div>
                      <div className="space-y-2">
                        <p>Second Chance Points: {teamStats.statistics.secondChancePoints}</p>
                        <p>Points off Turnovers: {teamStats.statistics.pointsOffTurnovers}</p>
                        <p>Longest Run: {teamStats.statistics.longestRun}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm font-medium">
                      Plus/Minus:{' '}
                      <span
                        className={teamStats.plusMinus >= 0 ? 'text-green-500' : 'text-red-500'}
                      >
                        {teamStats.plusMinus > 0 ? '+' : ''}
                        {teamStats.plusMinus}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Nugget */}
          {game.nugget && (
            <div className="mt-8 bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Game Highlight</h3>
              <p className="text-muted-foreground">{game.nugget}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
