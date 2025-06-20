'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { logger } from '@lib/core/logger';
import { fetchNbaTeamById, fetchNbaTeamStats } from '@src/lib/external-apis';
import type { ITeamDisplayStats, IGame, Team } from '@src/lib/types';
import { calculateTeamStats, getTeamStreak, getTeamLastTenGames } from '@src/lib/utils/game';
export default function TeamPage() {
  const params = useParams();
  const teamId = params?.id as string;
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<ITeamDisplayStats | null>(null);
  const [recentGames, setRecentGames] = useState<IGame[]>([]);
  const [teamTrends, setTeamTrends] = useState<{
    streak: { type: string; count: number };
    lastTen: string;
    stats: ReturnType<typeof calculateTeamStats>;
  } | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const teamResponse = await fetchNbaTeamById(teamId);
        if (!teamResponse.data || teamResponse.data.length === 0) {
          setError('Team not found');
          setLoading(false);
          return;
        }

        const apiTeam = teamResponse.data[0];
        const team: Team = {
          id: apiTeam.id.toString(),
          name: apiTeam.name,
          code: apiTeam.code,
          city: apiTeam.city,
          nickname: apiTeam.nickname,
          conference: apiTeam.conference,
          division: apiTeam.division,
          logo: apiTeam.logo,
          country: 'USA', // Default value
          h2h: { lastTenGames: null, losses: 0, wins: 0 }, // Default h2h structure
          league: 'NBA', // Default value
          season: new Date().getFullYear(), // Current year
          state: apiTeam.state || '', // Default empty string
          standings: null, // Default null
          stats: null, // Default null
        };
        setTeamData(team);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch team data: ' + err);
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  useEffect(() => {
    const loadTeamStats = async () => {
      try {
        const statsResponse = await fetchNbaTeamStats(`id=${teamId}&season=2024`);
        const stats: ITeamDisplayStats | undefined = statsResponse
          ? {
              games: 0,
              points: statsResponse.points || 0,
              fgp: String(statsResponse.fgp) || '0',
              ftp: String(statsResponse.ftp) || '0',
              tpp: String(statsResponse.tpp) || '0',
              longestRun: statsResponse.longestRun || 0,
              totReb: statsResponse.totReb || 0,
              assists: statsResponse.assists || 0,
              pFouls: statsResponse.pFouls || 0,
              steals: statsResponse.steals || 0,
              turnovers: statsResponse.turnovers || 0,
              blocks: statsResponse.blocks || 0,
              plusMinus: statsResponse.plusMinus || 0,
              // The following are not present in ITeamStats, so set to 0
              fastBreakPoints: 0,
              pointsInPaint: 0,
              biggestLead: 0,
              secondChancePoints: 0,
              pointsOffTurnovers: 0,
              offReb: 0,
            }
          : undefined;
        setTeamStats(stats || null);
      } catch (error) {
        logger.error('Error loading team stats:', error);
        setError('Failed to load team stats');
      }
    };

    loadTeamStats();
  }, [teamId]);

  useEffect(() => {
    const loadTeamTrends = async () => {
      try {
        // Fetch recent games for the team
        const gamesResponse = await fetch(`/api/games?teamId=${teamId}&limit=20`);
        const gamesData = await gamesResponse.json();
        const games = gamesData.games || [];
        setRecentGames(games);

        // Calculate team trends
        const streak = getTeamStreak(games, teamId);
        const lastTen = getTeamLastTenGames(games, teamId);
        const stats = calculateTeamStats(games, teamId);

        setTeamTrends({
          streak,
          lastTen,
          stats,
        });
      } catch (error) {
        logger.error('Error loading team trends:', error);
      }
    };

    if (teamId) {
      loadTeamTrends();
    }
  }, [teamId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!teamData) return <div>No team data found</div>;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))]">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/sports/nba"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to NBA
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Team Header */}
          <div className="flex items-center space-x-4 mb-8">
            {teamData.logo && (
              <Image
                src={teamData.logo}
                alt={`${teamData.name} logo`}
                width={100}
                height={100}
                className="rounded-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{teamData.name}</h1>
              <p className="text-gray-600">{teamData.city}</p>
              {teamData.conference && (
                <p className="text-gray-600">{teamData.conference} Conference</p>
              )}
              {teamData.division && <p className="text-gray-600">{teamData.division} Division</p>}
            </div>
          </div>

          {/* Team Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Team Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{teamData.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conference</p>
                  <p className="font-medium">{teamData.conference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Division</p>
                  <p className="font-medium">{teamData.division}</p>
                </div>
              </div>
            </div>

            {/* Team Stats */}
            <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Season Statistics</h3>
              {teamStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Points Per Game</p>
                      <p className="text-2xl font-bold">
                        {(teamStats as Record<string, number | string>).points
                          ? (
                              ((teamStats as Record<string, number | string>).points as number) /
                              (((teamStats as Record<string, number | string>).games as number) ||
                                1)
                            ).toFixed(1)
                          : '0.0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Field Goal %</p>
                      <p className="text-2xl font-bold">
                        {(teamStats as Record<string, number | string>).fgp}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>No stats available</div>
              )}
            </div>
          </div>

          {/* Team Trends */}
          {teamTrends && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Streak */}
              <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Current Streak</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {teamTrends.streak.count} {teamTrends.streak.type}
                  </span>
                  {teamTrends.streak.type === 'win' ? (
                    <span className="text-green-500">↑</span>
                  ) : (
                    <span className="text-red-500">↓</span>
                  )}
                </div>
              </div>

              {/* Last 10 Games */}
              <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Last 10 Games</h3>
                <div className="flex gap-1">
                  {teamTrends.lastTen.split('').map((result, index) => (
                    <span
                      key={index}
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        result === 'W' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Performance */}
              <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Recent Performance</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-xl font-bold">
                      {((teamTrends.stats.wins / teamTrends.stats.totalGames) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Points Per Game</p>
                    <p className="text-xl font-bold">
                      {(teamTrends.stats.pointsFor / teamTrends.stats.totalGames).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Points Against</p>
                    <p className="text-xl font-bold">
                      {(teamTrends.stats.pointsAgainst / teamTrends.stats.totalGames).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Games */}
          {recentGames.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Recent Games</h3>
              <div className="grid grid-cols-1 gap-4">
                {recentGames.map((game: IGame) => (
                  <div key={game.id} className="bg-[hsl(var(--card))] rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            typeof game.date === 'string' ? game.date : game.date.start
                          ).toLocaleDateString()}
                        </p>
                        <p className="font-medium">
                          {game.teams.home.name} vs {game.teams.visitors.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {typeof game.status === 'object' && game.status !== null
                            ? game.status.long
                            : ''}
                        </p>
                        <p className="font-medium">
                          {game.scores.home.points} - {game.scores.visitors.points}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
