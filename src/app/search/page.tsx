'use client';

import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';

import { filterGames, processGameData } from '@/app/search/utils/game-search';
import { useDebounce } from '@/hooks/use-debounce';
import { GET_GAMES } from '@src/lib/graphql/queries';
import type { SearchGame } from '@src/lib/types/consolidated.types';

export const dynamic = 'force-dynamic';

// Helper function to validate state values
const isValidState = (state: string | undefined | null): boolean => {
  if (!state) return false;

  // Common invalid values
  if (state.length === 1 || state === 'O' || state === '0') return false;

  // Valid US state codes (2 letters) or reasonable length for full state names
  if (state.length === 2 || (state.length > 3 && state.length < 20)) {
    return /^[A-Za-z\s]+$/.test(state);
  }

  return false;
};

// Helper function to format arena location
const formatArenaLocation = (arena: { name?: string; city?: string; state?: string }): string => {
  const parts = [];

  if (arena.name) parts.push(arena.name);
  if (arena.city) parts.push(arena.city);
  if (arena.state && isValidState(arena.state)) parts.push(arena.state);

  return parts.join(', ');
};

function GameCard({ game }: { game: SearchGame }) {
  return (
    <Link href={`/sports/nba/games/${game.id}`} className="block">
      <div className="bg-card rounded-xl shadow-lg p-6 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl cursor-pointer h-[280px] flex flex-col border border-border/50 hover:border-blue-500/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {format(
                new Date(typeof game.date === 'string' ? game.date : game.date.start),
                'MMM d, yyyy h:mm a'
              )}
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
                  priority
                  className="rounded-full w-12 h-12 transition-transform duration-300 group-hover:scale-110"
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
                  priority
                  className="rounded-full w-12 h-12 transition-transform duration-300 group-hover:scale-110"
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
            {game.arena && formatArenaLocation(game.arena)}
          </div>
        </div>
      </div>
    </Link>
  );
}

function GameList({ games }: { games: SearchGame[] }) {
  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">No games found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('q') || '';
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const query2024 = useQuery<{ games: { edges: { node: SearchGame }[] } }>(GET_GAMES, {
    variables: {
      filters: { season: 2024 },
      first: 2000,
    },
  });

  const query2023 = useQuery<{ games: { edges: { node: SearchGame }[] } }>(GET_GAMES, {
    variables: {
      filters: { season: 2023 },
      first: 2000,
    },
  });

  const {
    isLoading,
    hasError,
    games: allGames,
  } = processGameData([
    query2024 as unknown as Parameters<typeof processGameData>[0][0],
    query2023 as unknown as Parameters<typeof processGameData>[0][0],
  ]);
  const filteredGames = filterGames(allGames, debouncedSearchQuery);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (hasError) return <div className="p-4">Error loading games</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {debouncedSearchQuery ? `Search results for "${debouncedSearchQuery}"` : 'All Games'}
      </h1>
      <GameList games={filteredGames} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
