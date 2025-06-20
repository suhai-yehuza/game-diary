'use client';

import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Image from 'next/image';
import React, { useState, useCallback } from 'react';

import { Skeleton } from '@src/app/components/ui/skeleton';
import { GET_EXTERNAL_GAMES, GET_TEAMS, GET_PLAYERS } from '@src/lib/graphql/queries';
import type { Team, Game, IDBPlayer, IConferenceType, IDivisionType } from '@src/lib/types';

export const NbaDataClient = () => {
  const [selectedConference, setSelectedConference] = useState<IConferenceType | 'all'>('all');
  const [selectedDivision, setSelectedDivision] = useState<IDivisionType | 'all'>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');

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
  } = useQuery<{ players: IDBPlayer[] }>(GET_PLAYERS, {
    variables: {
      filters: {
        position: selectedPosition !== 'all' ? selectedPosition : undefined,
      },
    },
  });

  const handleConferenceChange = useCallback((value: IConferenceType | 'all') => {
    setSelectedConference(value);
  }, []);

  const handleDivisionChange = useCallback((value: IDivisionType | 'all') => {
    setSelectedDivision(value);
  }, []);

  const handlePositionChange = useCallback((value: string) => {
    setSelectedPosition(value);
  }, []);

  const hasError = Boolean(gamesError || teamsError || playersError);
  const isLoading = gamesLoading || loadingTeams || loadingPlayers;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        <p className="font-semibold">Error loading NBA data</p>
        <p className="text-sm">
          {gamesError?.message || teamsError?.message || playersError?.message}
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
          onChange={e => handleConferenceChange(e.target.value as IConferenceType | 'all')}
          className="p-2 border rounded"
        >
          <option value="East">Eastern Conference</option>
          <option value="West">Western Conference</option>
          <option value="all">All Conferences</option>
        </select>

        <select
          value={selectedDivision}
          onChange={e => handleDivisionChange(e.target.value as IDivisionType | 'all')}
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

      {/* Games List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Today's Games</h2>
        {data?.games.items.map(game => (
          <div key={game.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {game.teams.home.logo && (
                  <Image
                    src={game.teams.home.logo}
                    alt={game.teams.home.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <span>{game.teams.home.name}</span>
              </div>
              <div className="text-lg font-bold">
                {game.scores.home.points} - {game.scores.visitors.points}
              </div>
              <div className="flex items-center space-x-4">
                <span>{game.teams.visitors.name}</span>
                {game.teams.visitors.logo && (
                  <Image
                    src={game.teams.visitors.logo}
                    alt={game.teams.visitors.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {game.status.long} - {game.date.start}
            </div>
          </div>
        ))}
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamsData?.teams.map(team => (
            <div key={team.id} className="p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                {team.logo && (
                  <Image
                    src={team.logo}
                    alt={team.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-sm text-gray-500">
                    {team.conference} - {team.division}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Players</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playersData?.players.map(player => (
            <div key={player.id} className="p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Image
                  src={player.jersey || '/images/default-player.png'}
                  alt={`${player.firstName} ${player.lastName}`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{`${player.firstName} ${player.lastName}`}</h3>
                  <p className="text-sm text-gray-500">{player.leagues?.standard?.pos || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
