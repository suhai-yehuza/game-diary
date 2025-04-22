'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_SEASONS,
  GET_LEAGUES,
  GET_GAMES,
  GET_TEAMS,
  GET_PLAYERS,
  GET_USERS,
  GET_FRIENDSHIPS,
  GET_USER,
  GET_FRIENDSHIPS_FOR_USER,
  GET_GAME_LOGS,
  GET_GAME_LOG,
  GET_GAME_RATINGS,
  GET_GAME_RATING,
  GET_REACTIONS,
  GET_GAME_LOGS_FOR_USER,
} from '../lib/graphql/queries';
import { Season, Team, Player, Game } from '../lib/types/nba';
import type { Conference, Division, Position, SortOption } from '../lib/types/types';
import Image from 'next/image';

export type TeamSort = 'WINS' | 'LOSSES' | 'WIN_PERCENTAGE' | 'POINTS_PER_GAME';
export type PlayerSort = 'POINTS' | 'REBOUNDS' | 'ASSISTS' | 'STEALS' | 'BLOCKS';

export const NbaDataClient = () => {
  const testUserId = '01c271f5-0aa3-4aa3-92b8-032b7a39b995';
  const testGameLogId = '00039a16-6ef0-47ed-abca-e1d2e633cbe6';
  const testGameId = '2c4cbc53-87fe-4e53-a210-f7ccb188ebfc';
  const DEFAULT_PAGE_SIZE = 10;
  const [selectedConference, setSelectedConference] = useState<Conference | 'all'>('all');
  const [selectedDivision, setSelectedDivision] = useState<Division | 'all'>('all');
  const [selectedPosition, setSelectedPosition] = useState<Position | 'all'>('all');
  // const [selectedStatus] = useState<string>("all");
  const [teamSort, setTeamSort] = useState<TeamSort>('WINS');
  const [playerSort, setPlayerSort] = useState<PlayerSort>('POINTS');
  const [sortBy] = useState<SortOption>('ASC');

  // Test fetching data from the API
  // GET_USER
  const { data: userData } = useQuery(GET_USER, {
    variables: {
      id: testUserId,
    },
  });
  useEffect(() => {
    console.log('userData', userData);
  }, [userData]);

  // GET_GAME_LOGS
  const { data: gameLogsData } = useQuery(GET_GAME_LOGS, {
    variables: {
      pagination: {
        first: DEFAULT_PAGE_SIZE,
      },
    },
  });
  useEffect(() => {
    console.log('gameLogsData', gameLogsData);
  }, [gameLogsData]);

  // GET_GAME_LOG
  const { data: gameLogData } = useQuery(GET_GAME_LOG, {
    variables: {
      id: testGameLogId,
    },
  });
  useEffect(() => {
    console.log('gameLogData', gameLogData);
  }, [gameLogData]);

  // GET_GAME_RATINGS
  const { data: gameRatingsData } = useQuery(GET_GAME_RATINGS);
  useEffect(() => {
    console.log('gameRatingsData', gameRatingsData);
  }, [gameRatingsData]);

  // GET_GAME_RATING
  const { data: gameRatingData } = useQuery(GET_GAME_RATING, {
    variables: {
      game_id: testGameId,
    },
  });
  useEffect(() => {
    console.log('gameRatingData', gameRatingData);
  }, [gameRatingData]);

  // GET_REACTIONS
  const { data: reactionsData } = useQuery(GET_REACTIONS, {
    variables: {
      target_id: testGameLogId,
    },
  });
  useEffect(() => {
    console.log('reactionsData', reactionsData);
  }, [reactionsData]);

  // GET_FRIENDSHIPS_FOR_USER
  const { data: friendshipsForUserData } = useQuery(GET_FRIENDSHIPS_FOR_USER, {
    variables: {
      userId: testUserId,
    },
  });
  useEffect(() => {
    console.log('friendshipsForUserData', friendshipsForUserData);
  }, [friendshipsForUserData]);

  // GET_GAME_LOGS_FOR_USER
  const { data: gameLogsForUserData } = useQuery(GET_GAME_LOGS_FOR_USER, {
    variables: {
      userId: testUserId,
    },
  });
  useEffect(() => {
    console.log('gameLogsForUserData', gameLogsForUserData);
  }, [gameLogsForUserData]);

  // ======
  const { data: seasonData } = useQuery(GET_SEASONS);
  useEffect(() => {
    console.log('seasonData', seasonData);
  }, [seasonData]);

  const { data: leagueData } = useQuery(GET_LEAGUES);
  useEffect(() => {
    console.log('leagueData', leagueData);
  }, [leagueData]);

  const { data: gamesData } = useQuery(GET_GAMES, {
    variables: {
      filters: {
        season: '2024',
      },
      pagination: {
        first: DEFAULT_PAGE_SIZE,
      },
    },
  });
  useEffect(() => {
    console.log('gamesData', gamesData);
  }, [gamesData]);

  const { data: teamsData } = useQuery(GET_TEAMS, {
    variables: {
      filters: {
        conference: 'East',
      },
    },
  });
  useEffect(() => {
    console.log('teamsData', teamsData);
  }, [teamsData]);

  const { data: playersData } = useQuery(GET_PLAYERS, {
    variables: {
      filters: {
        country: 'USA',
      },
      pagination: {
        first: DEFAULT_PAGE_SIZE,
      },
      sortBy,
    },
  });
  useEffect(() => {
    console.log('playersData', playersData);
  }, [playersData]);

  const { data: usersData } = useQuery(GET_USERS, {
    variables: {
      pagination: {
        first: DEFAULT_PAGE_SIZE,
      },
    },
  });
  useEffect(() => {
    console.log('usersData', usersData);
  }, [usersData]);

  const { data: friendshipsData } = useQuery(GET_FRIENDSHIPS, {
    variables: {
      pagination: {
        first: DEFAULT_PAGE_SIZE,
      },
    },
  });
  useEffect(() => {
    console.log('friendshipsData', friendshipsData);
  }, [friendshipsData]);

  const currentSeason: Season | undefined = seasonData?.season;
  // const todaysGames: Game[] = gamesData?.todaysGames || [];
  // const teams: Team[] = teamsData?.teams || [];
  const topPlayers: Player[] = playersData?.topPlayers || [];

  if (
    !seasonData ||
    !gamesData ||
    !teamsData ||
    !playersData ||
    !usersData ||
    !friendshipsData ||
    !gameLogsData ||
    !gameLogData ||
    !gameRatingsData ||
    !gameRatingData ||
    !reactionsData ||
    !friendshipsForUserData ||
    !gameLogsForUserData
  ) {
    return <div className="text-center py-8">Loading NBA data...</div>;
  }

  return (
    <div className="space-y-8 p-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <select
          value={selectedConference}
          onChange={e => setSelectedConference(e.target.value as Conference | 'all')}
          className="p-2 border rounded"
        >
          <option value="East">Eastern Conference</option>
          <option value="West">Western Conference</option>
          <option value="all">All Conferences</option>
        </select>

        <select
          value={selectedDivision || ''}
          onChange={e => setSelectedDivision(e.target.value as Division | 'all')}
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
          onChange={e => setSelectedPosition(e.target.value as Position | 'all')}
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
              <p>{new Date(currentSeason.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold">End Date</h3>
              <p>{new Date(currentSeason.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold">All-Star Game</h3>
              <p>{new Date(currentSeason.isCurrent ? 'Yup' : 'Nope').toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </section>

      {/* Today's Games */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Today&apos;s Games</h2>
        <div className="grid gap-4">
          {[].map((game: Game) => (
            <div key={game.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-3 items-center">
                <div className="text-right">
                  <h3 className="font-bold">{game.awayTeam.name}</h3>
                  <p className="text-gray-600">
                    {game.awayTeam.wins}-{game.awayTeam.losses}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">{game.status}</p>
                  <p className="text-2xl font-bold">
                    {game.scores.away} - {game.scores.home}
                  </p>
                  {game.period && (
                    <p className="text-sm">
                      Q{game.period} {game.time}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{game.homeTeam.name}</h3>
                  <p className="text-gray-600">
                    {game.homeTeam.wins}-{game.homeTeam.losses}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-center text-sm text-gray-500">
                {game.venue.name}, {game.venue.city}, {game.venue.state}
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
            value={teamSort}
            onChange={e => setTeamSort(e.target.value as TeamSort)}
            className="p-2 border rounded"
          >
            <option value="WINS">Sort by Wins</option>
            <option value="LOSSES">Sort by Losses</option>
            <option value="WIN_PERCENTAGE">Sort by Win %</option>
            <option value="POINTS_PER_GAME">Sort by PPG</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[].map((team: Team) => (
            <div key={team.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <Image 
                  src={team?.logo} 
                  alt={team.name} 
                  width={96} 
                  height={96}
                  className="w-24 h-24 object-contain"
                />
                <div>
                  <h3 className="font-bold">{team.name}</h3>
                  <p className="text-gray-600">
                    {team.wins}-{team.losses} ({team.winPercentage}%)
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Streak:</span> {team.streak}
                </div>
                <div>
                  <span className="font-semibold">Last 10:</span> {team.lastTen}
                </div>
                <div>
                  <span className="font-semibold">Home:</span> {team.homeRecord}
                </div>
                <div>
                  <span className="font-semibold">Away:</span> {team.awayRecord}
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
            value={playerSort}
            onChange={e => setPlayerSort(e.target.value as PlayerSort)}
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
              {topPlayers.map((player: Player) => (
                <tr key={player.id} className="border-t">
                  <td className="px-4 py-2">
                    {player.first_name} {player.last_name}
                    <div className="text-sm text-gray-500">
                      #{player.jerseyNumber} | {player.position}
                    </div>
                  </td>
                  <td className="px-4 py-2">{player.team.abbreviation}</td>
                  <td className="px-4 py-2">{player.stats.pointsPerGame}</td>
                  <td className="px-4 py-2">{player.stats.reboundsPerGame}</td>
                  <td className="px-4 py-2">{player.stats.assistsPerGame}</td>
                  <td className="px-4 py-2">{player.stats.fieldGoalPercentage}%</td>
                  <td className="px-4 py-2">{player.stats.threePointPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
