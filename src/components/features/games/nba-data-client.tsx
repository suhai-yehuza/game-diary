'use client';

import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Image from 'next/image';
import React, { useState, useCallback } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { API_CONFIG } from '@/lib/config/api.config';
import { GET_SEASONS, GET_EXTERNAL_GAMES, GET_TEAMS, GET_PLAYERS } from '@/lib/graphql/queries';
import { ConferenceType, DivisionType } from '@/lib/types/config.types';
import { Game, GameStatus, Season, Team, Player } from '@/lib/types/generated/graphql';
import { SortDirection } from '@/lib/types/shared.types';
import { formatDateTime } from '@/lib/utils/index.time';

export const NbaDataClient = () => {
  const [selectedConference, setSelectedConference] = useState<ConferenceType | 'all'>('all');
  const [selectedDivision, setSelectedDivision] = useState<DivisionType | 'all'>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [sortBy] = useState<SortDirection>(API_CONFIG.pagination.DEFAULT_SORT_DIRECTION);
  const [searchTerm] = useState('');

  const {
    data: seasonData,
    loading: loadingSeasons,
    error: seasonsError,
  } = useQuery<{ seasons: Season[] }>(GET_SEASONS);
  const {
    data,
    loading: gamesLoading,
    error: gamesError,
  } = useQuery<{
    games: {
      items: Game[];
      total: number;
      hasMore: boolean;
      nextCursor?: string;
    };
  }>(GET_EXTERNAL_GAMES, {
    variables: {
      filters: {
        dateRange: {
          start: format(new Date(), 'yyyy-MM-dd'),
        },
      },
      pagination: { first: 10 },
    },
  });
  const {
    data: teamsData,
    loading: loadingTeams,
    error: teamsError,
  } = useQuery<{ teams: Team[] }>(GET_TEAMS, {
    variables: {
      filters: {
        conference: selectedConference !== 'all' ? selectedConference : undefined,
        division: selectedDivision !== 'all' ? selectedDivision : undefined,
      },
    },
  });
  const {
    data: playersData,
    loading: loadingPlayers,
    error: playersError,
  } = useQuery<{ players: { items: Player[] } }>(GET_PLAYERS, {
    variables: {
      filters: {
        position: selectedPosition !== 'all' ? selectedPosition : undefined,
      },
      pagination: {
        first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
      },
      sortBy,
    },
  });

  const handleConferenceChange = useCallback((conference: ConferenceType | 'all') => {
    setSelectedConference(conference);
  }, []);

  const handleDivisionChange = useCallback((division: DivisionType | 'all') => {
    setSelectedDivision(division);
  }, []);

  const handlePositionChange = useCallback((position: string) => {
    setSelectedPosition(position);
  }, []);

  const currentSeason = seasonData?.seasons.find(season => season.isCurrent);

  const isLoading = loadingSeasons || gamesLoading || loadingTeams || loadingPlayers;
  const hasError = seasonsError || gamesError || teamsError || playersError;

  const filteredTeams =
    teamsData?.teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
      const teamConference = team.conference;
      const teamDivision = team.division;
      const matchesConference =
        selectedConference === 'all' || teamConference === selectedConference;
      const matchesDivision = selectedDivision === 'all' || teamDivision === selectedDivision;
      return matchesSearch && matchesConference && matchesDivision;
    }) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        <p className="font-semibold">Error loading NBA data</p>
        <p className="text-sm">
          {seasonsError?.message ||
            gamesError?.message ||
            teamsError?.message ||
            playersError?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <select
          value={selectedConference}
          onChange={e => handleConferenceChange(e.target.value as ConferenceType | 'all')}
          className="p-2 border rounded"
        >
          <option value="East">Eastern Conference</option>
          <option value="West">Western Conference</option>
          <option value="all">All Conferences</option>
        </select>

        <select
          value={selectedDivision || ''}
          onChange={e => handleDivisionChange(e.target.value as DivisionType | 'all')}
          className="p-2 border rounded"
        >
          <option value="Atlantic">Atlantic</option>
          <option value="Central">Central</option>
          <option value="Southeast">Southeast</option>
          <option value="Northwest">Northwest</option>
          <option value="Pacific">Pacific</option>
          <option value="Southwest">Southwest</option>
          <option value="all">All Divisions</option>
        </select>

        <select
          value={selectedPosition}
          onChange={e => handlePositionChange(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="PG">Point Guard</option>
          <option value="SG">Shooting Guard</option>
          <option value="SF">Small Forward</option>
          <option value="PF">Power Forward</option>
          <option value="C">Center</option>
          <option value="all">All Positions</option>
        </select>
      </div>

      {/* Current Season */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Current Season</h2>
        {currentSeason && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-semibold">Season</h3>
              <p>{currentSeason.year}</p>
            </div>
            <div>
              <h3 className="font-semibold">Start Date</h3>
              <p>{formatDateTime(currentSeason.startDate.toString())}</p>
            </div>
            <div>
              <h3 className="font-semibold">End Date</h3>
              <p>{formatDateTime(currentSeason.endDate.toString())}</p>
            </div>
            <div>
              <h3 className="font-semibold">Current Season</h3>
              <p>{currentSeason.isCurrent ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </section>

      {/* Today's Games */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Today&apos;s Games</h2>
        <div className="grid gap-4">
          {data?.games.items.map((game: Game) => (
            <div key={game.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-3 items-center">
                <div className="text-right">
                  <h3 className="font-bold">{game.teams.visitors.name}</h3>
                  <p className="text-gray-600">
                    {game.scores.visitors.win}-{game.scores.visitors.loss}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    {typeof game.status === 'string'
                      ? game.status
                      : (game.status as GameStatus).long?.toString() || game.status.toString()}
                  </p>
                  <p className="text-2xl font-bold">
                    {game.scores.visitors.points} - {game.scores.home.points}
                  </p>

                  {game.periods && (
                    <p className="text-sm">
                      Q{game.periods.current}{' '}
                      {typeof game.status === 'string'
                        ? ''
                        : (game.status as { clock?: string }).clock}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{game.teams.home.name}</h3>
                  <p className="text-gray-600">
                    {game.scores.home.win}-{game.scores.home.loss}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-center text-sm text-gray-500">
                {typeof game.arena === 'string'
                  ? game.arena
                  : `${(game.arena as { name: string; city: string; state: string }).name}, ${(game.arena as { name: string; city: string; state: string }).city}, ${(game.arena as { name: string; city: string; state: string }).state}`}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Teams */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team: Team) => (
            <div key={team.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-4">
                {team.logoUrl && (
                  <Image
                    src={team.logoUrl}
                    alt={team.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-bold">{team.name}</h3>
                  <p className="text-sm text-gray-600">
                    {team.conference} Conference - {team.division} Division
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Players */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Players</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Position</th>
              <th className="text-left px-4 py-2">Team</th>
            </tr>
          </thead>
          <tbody>
            {playersData?.players.items.map((player: Player) => (
              <tr key={player.id} className="border-t">
                <td className="px-4 py-2">
                  {player.firstName} {player.lastName}
                </td>
                <td className="px-4 py-2">{player.leagues?.standard?.pos || 'N/A'}</td>
                <td className="px-4 py-2">
                  {player.leagues?.standard?.active ? 'Active' : 'Inactive'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
