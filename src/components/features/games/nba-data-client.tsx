'use client';

import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Image from 'next/image';
import React, { useState, useCallback } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { GET_SEASONS, GET_EXTERNAL_GAMES, GET_TEAMS, GET_PLAYERS } from '@/lib/graphql/queries';
import {
  SortDirection,
  ConferenceType,
  DivisionType,
  SeasonData,
  TeamData,
  PlayerData,
  GameTeamSortInput,
  GamePlayerSortInput,
  DEFAULT_PAGE_SIZE,
  Game,
  GameStatus,
} from '@/lib/types';

export const NbaDataClient = () => {
  const [selectedConference, setSelectedConference] = useState<ConferenceType | 'all'>('all');
  const [selectedDivision, setSelectedDivision] = useState<DivisionType | 'all'>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [teamSort, setTeamSort] = useState<GameTeamSortInput>({ field: 'WINS', direction: 'desc' });
  const [playerSort, setPlayerSort] = useState<GamePlayerSortInput>({
    field: 'POINTS',
    direction: 'desc',
  });
  const [sortBy] = useState<SortDirection>('asc');
  const [searchTerm, _setSearchTerm] = useState('');

  const {
    data: seasonData,
    loading: loadingSeasons,
    error: seasonsError,
  } = useQuery<{ seasons: SeasonData[] }>(GET_SEASONS);
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
  } = useQuery<{ teams: TeamData[] }>(GET_TEAMS, {
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
  } = useQuery<{ players: { items: PlayerData[] } }>(GET_PLAYERS, {
    variables: {
      filters: {
        position: selectedPosition !== 'all' ? selectedPosition : undefined,
      },
      pagination: {
        first: DEFAULT_PAGE_SIZE,
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

  const handleTeamSortChange = useCallback((field: string) => {
    setTeamSort(prev => ({ ...prev, field }));
  }, []);

  const handlePlayerSortChange = useCallback((field: string) => {
    setPlayerSort(prev => ({ ...prev, field }));
  }, []);

  const currentSeason = seasonData?.seasons.find(season => season.is_current);

  const isLoading = loadingSeasons || gamesLoading || loadingTeams || loadingPlayers;
  const hasError = seasonsError || gamesError || teamsError || playersError;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const filteredTeams =
    teamsData?.teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
      const teamConference = team.leagues?.standard?.conference;
      const teamDivision = team.leagues?.standard?.division;
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
              <p>{formatDate(currentSeason.start_date)}</p>
            </div>
            <div>
              <h3 className="font-semibold">End Date</h3>
              <p>{formatDate(currentSeason.end_date)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Current Season</h3>
              <p>{currentSeason.is_current ? 'Yes' : 'No'}</p>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Teams</h2>
          <select
            value={teamSort.field}
            onChange={e => handleTeamSortChange(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="WINS">Sort by Wins</option>
            <option value="LOSSES">Sort by Losses</option>
            <option value="WIN_PERCENTAGE">Sort by Win %</option>
            <option value="POINTS_PER_GAME">Sort by PPG</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team: TeamData) => (
            <div key={team.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <Image src={team.logo} alt={team.name} width={48} height={48} />
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-sm text-gray-500">{team.nickname}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Players */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Top Players</h2>
          <select
            value={playerSort.field}
            onChange={e => handlePlayerSortChange(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="POINTS">Sort by Points</option>
            <option value="REBOUNDS">Sort by Rebounds</option>
            <option value="ASSISTS">Sort by Assists</option>
            <option value="STEALS">Sort by Steals</option>
            <option value="BLOCKS">Sort by Blocks</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Player</th>
                <th className="px-4 py-2">Team</th>
                <th className="px-4 py-2">PPG</th>
                <th className="px-4 py-2">RPG</th>
                <th className="px-4 py-2">APG</th>
                <th className="px-4 py-2">FG%</th>
                <th className="px-4 py-2">3P%</th>
              </tr>
            </thead>
            <tbody>
              {playersData?.players.items.map((player: PlayerData) => (
                <tr key={player.id} className="border-t">
                  <td className="px-4 py-2">
                    {player.first_name} {player.last_name}
                  </td>
                  <td className="px-4 py-2">{player.leagues.standard?.pos || '-'}</td>
                  <td className="px-4 py-2">{player.leagues.standard?.jersey || '-'}</td>
                  <td className="px-4 py-2">{player.leagues.standard?.active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
