'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_GAMES } from '@/lib/graphql/queries';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

interface Game {
  id: string;
  date: {
    start: string;
  };
  status: {
    long: string;
  };
  teams: {
    visitors: {
      name: string;
      nickname: string;
      logo: string;
    };
    home: {
      name: string;
      nickname: string;
      logo: string;
    };
  };
  scores: {
    visitors: {
      points: number;
    };
    home: {
      points: number;
    };
  };
  arena: {
    name: string;
    city: string;
    state: string;
  };
}

interface GamesData {
  games: {
    edges: {
      node: Game;
    }[];
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  const { loading, error, data } = useQuery<GamesData>(GET_GAMES, {
    variables: {
      filters: {
        season: '2024',
      },
      pagination: {
        first: 2000,
      },
    },
  });

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">Error: {error.message}</div>;

  const games = data?.games?.edges.map(edge => edge.node) || [];

  const filteredGames = games.filter(game => {
    if (!searchQuery) return true;

    const searchTerms = searchQuery.split(' ');
    return searchTerms.every(term => {
      const termLower = term.toLowerCase();

      // Helper function to safely check if a string contains the search term
      const containsTerm = (str: string | null | undefined) =>
        str ? str.toLowerCase().includes(termLower) : false;

      return (
        containsTerm(game.teams.visitors.name) ||
        containsTerm(game.teams.visitors.nickname) ||
        containsTerm(game.teams.home.name) ||
        containsTerm(game.teams.home.nickname) ||
        containsTerm(game.arena.name) ||
        containsTerm(game.arena.city) ||
        containsTerm(game.arena.state) ||
        containsTerm(game.status.long) ||
        containsTerm(format(new Date(game.date.start), 'MMMM d, yyyy'))
      );
    });
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {searchQuery ? `Search results for "${searchQuery}"` : 'All Games'}
      </h1>

      {filteredGames.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">No games found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map(game => (
            <Link key={game.id} href={`/sports/nba/games/${game.id}`} className="block">
              <div className="bg-card rounded-xl shadow-lg p-6 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl cursor-pointer h-[280px] flex flex-col border border-border/50 hover:border-blue-500/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(game.date.start), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="text-sm font-medium bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">
                    {game.status.long}
                  </div>
                </div>

                <div className="space-y-6 flex-grow">
                  {/* Away Team */}
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      {game.teams.visitors.logo && (
                        <Image
                          src={game.teams.visitors.logo}
                          alt={game.teams.visitors.name || 'Away team'}
                          width={48}
                          height={48}
                          className="rounded-full transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-lg transition-colors duration-300 group-hover:text-blue-500">
                          {game.teams.visitors.nickname}
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-blue-500">
                      {game.scores.visitors.points}
                    </div>
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      {game.teams.home.logo && (
                        <Image
                          src={game.teams.home.logo}
                          alt={game.teams.home.name || 'Home team'}
                          width={48}
                          height={48}
                          className="rounded-full transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-lg transition-colors duration-300 group-hover:text-blue-500">
                          {game.teams.home.nickname}
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-blue-500">
                      {game.scores.home.points}
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {game.arena.name}, {game.arena.city}, {game.arena.state}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
