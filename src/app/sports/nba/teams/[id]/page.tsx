'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { fetchNbaTeamById, fetchNbaTeamStats } from '@/lib/external-apis';
import { type Team, type TeamDisplayStats } from '@/lib/types';

export default function TeamPage() {
  const params = useParams();
  const teamId = params?.id as string;
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<TeamDisplayStats | null>(null);

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
          logo_url: apiTeam.logo,
          primary_color: apiTeam.primary_color,
          secondary_color: apiTeam.secondary_color,
          created_at: new Date(),
          updated_at: new Date(),
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
              offReb: statsResponse.offReb || 0,
              defReb: statsResponse.defReb || 0,
              totReb: statsResponse.totReb || 0,
              assists: statsResponse.assists || 0,
              pFouls: statsResponse.pFouls || 0,
              steals: statsResponse.steals || 0,
              turnovers: statsResponse.turnovers || 0,
              blocks: statsResponse.blocks || 0,
              plusMinus: statsResponse.plus_minus || 0,
              // The following are not present in TeamStats, so set to 0
              fastBreakPoints: 0,
              pointsInPaint: 0,
              biggestLead: 0,
              secondChancePoints: 0,
              pointsOffTurnovers: 0,
              longestRun: 0,
            }
          : undefined;
        setTeamStats(stats || null);
      } catch (error) {
        console.error('Error loading team stats:', error);
        setError('Failed to load team stats');
      }
    };

    loadTeamStats();
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
            {teamData.logo_url && (
              <Image
                src={teamData.logo_url}
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
                      <p className="text-2xl font-bold">{teamStats.points / teamStats.games}</p>
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

          {/* Recent Games */}
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Recent Games</h3>
            {/* Add recent games list here */}
            <p className="text-muted-foreground">Recent games will be displayed here</p>
          </div>
        </div>
      </main>
    </div>
  );
}
