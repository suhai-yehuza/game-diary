'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { fetchNbaTeamById, fetchNbaTeamStats } from '@/lib/external-apis';
import type { TeamDisplayStats, Game } from '@/lib/types/consolidated.types';
import { type Team } from '@/lib/types/generated/graphql';
import { calculateTeamStats, getTeamStreak, getTeamLastTenGames } from '@/lib/utils/index.game';
import { import { logger } from '@/lib/logger'; } from '@/lib/logger';
export default function TeamPage() {
  const params = useParams();
  const teamId = params?.id as string;
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<TeamDisplayStats | null>(null);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
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
          abbreviation: apiTeam.abbreviation,
          city: apiTeam.city,
          nickname: apiTeam.nickname,
          code: apiTeam.code,
          conference: apiTeam.conference,
          division: apiTeam.division,
          logo: apiTeam.logo,
          logoUrl: apiTeam.logo,
          primaryColor: apiTeam.primaryColor,
          secondaryColor: apiTeam.secondaryColor,
          createdAt: new Date(),
          updatedAt: new Date(),
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
        const stats: TeamDisplayStats | undefined = statsResponse
          ? {
              games: 0,
              points: statsResponse.points || 0,
              fgm: statsResponse.fgm || 0,
              fga: statsResponse.fga || 0,
              fgp: statsResponse.fgp || '0',
              ftm: statsResponse.ftm || 0,
              fta: statsResponse.fta || 0,
              ftp: statsResponse.ftp || '0',
              tpm: statsResponse.tpm || 0,
              tpa: statsResponse.tpa || 0,
              tpp: statsResponse.tpp || '0',
              longestRun: statsResponse.longestRun || 0,
              defReb: statsResponse.defReb || 0,
              totReb: statsResponse.totReb || 0,
              assists: statsResponse.assists || 0,
              pFouls: statsResponse.pFouls || 0,
              steals: statsResponse.steals || 0,
              turnovers: statsResponse.turnovers || 0,
              blocks: statsResponse.blocks || 0,
              plusMinus: statsResponse.plusMinus || 0,
              // The following are not present in TeamStats, so set to 0
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
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
            {teamData.logoUrl && (
              <Image
                src={teamData.logoUrl}
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
            <div className="bg-card rounded-lg shadow-sm p-6">
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
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Season Statistics</h3>
              {teamStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Points Per Game</p>
                      <p className="text-2xl font-bold">
                        {teamStats.points ? (teamStats.points / teamStats.games).toFixed(1) : '0.0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Field Goal %</p>
                      <p className="text-2xl font-bold">{teamStats.fgp}%</p>
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
              <div className="bg-card rounded-lg shadow-sm p-6">
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
              <div className="bg-card rounded-lg shadow-sm p-6">
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
              <div className="bg-card rounded-lg shadow-sm p-6">
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
                {recentGames.map(game => (
                  <div key={game.id} className="bg-card rounded-lg shadow-sm p-4">
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
                        <p className="text-sm text-muted-foreground">{game.status.long}</p>
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
