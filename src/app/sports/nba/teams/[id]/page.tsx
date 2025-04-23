'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { fetchNbaTeamById, fetchNbaTeamStats } from '@/lib/external-apis';
import { useQuery } from '@apollo/client';
import { GET_TEAM_STATS } from '@/lib/graphql/queries';
import { TeamStatistics } from '@/lib/types/types';

interface Team {
  id: string;
  name: string;
  nickname: string;
  code: string;
  logo: string;
  conference: string;
  division: string;
  city: string;
  arena: string;
  founded: number;
}

export default function TeamPage() {
  const params = useParams();
  const teamId = params.id as string;
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [teamStats, setTeamStats] = useState<TeamStatistics | null>(null);

  const {
    loading: statsLoading,
    error: statsError,
    data: statsData,
  } = useQuery(GET_TEAM_STATS, {
    variables: {
      team: teamId,
      season: 2023, // Current NBA season
    },
    skip: !teamId,
  });

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        const [teamResponse, statsResponse] = await Promise.all([
          fetchNbaTeamById(teamId),
          fetchNbaTeamStats(`id=${teamId}&season=2024`),
        ]);

        if (!teamResponse.response || teamResponse.response.length === 0) {
          throw new Error('Team not found');
        }
        const apiTeam = teamResponse.response[0];
        const team: Team = {
          id: apiTeam.id.toString(),
          name: apiTeam.name,
          nickname: apiTeam.nickname,
          code: apiTeam.code,
          logo: apiTeam.logo,
          conference: apiTeam.leagues.standard?.conference || 'Unknown',
          division: apiTeam.leagues.standard?.division || 'Unknown',
          city: apiTeam.city,
          arena: apiTeam.arena?.name || 'Unknown',
          founded: apiTeam.nbaFranchise ? 1946 : 0,
        };
        setTeamData(team);
        const stats = statsResponse.response?.[0] as unknown as TeamStatistics | undefined;
        setTeamStats(stats || null);
        setLoading(false);
      } catch (error) {
        console.error('Error loading team data:', error);
        setError('Failed to load team data');
        setLoading(false);
      }
    };

    loadTeamData();
  }, [teamId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!teamData) return <div>Team not found</div>;

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
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <Image
                src={imageError ? '/gamelog.svg' : teamData.logo}
                alt={teamData.name}
                fill
                sizes="(max-width: 128px) 100vw, 128px"
                className="object-contain"
                onError={() => setImageError(true)}
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{teamData.nickname}</h1>
              <p className="text-xl text-muted-foreground">{teamData.name}</p>
              <div className="mt-4 flex gap-4 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {teamData.conference}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  {teamData.division}
                </span>
              </div>
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
                  <p className="text-sm text-muted-foreground">Arena</p>
                  <p className="font-medium">{teamData.arena}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Founded</p>
                  <p className="font-medium">{teamData.founded}</p>
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
                      <p className="text-2xl font-bold">{teamStats.pointsPerGame}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Field Goal %</p>
                      <p className="text-2xl font-bold">{teamStats.fieldGoalPercentage}%</p>
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
