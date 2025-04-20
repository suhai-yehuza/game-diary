"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_GAMES } from "@/lib/graphql/queries";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

interface Team {
  id: string;
  name: string;
  nickname: string;
  code: string;
  logo: string;
}

interface Score {
  win: number;
  loss: number;
  series: {
    win: number;
    loss: number;
  };
  linescore: string[];
  points: number;
}

interface Game {
  id: string;
  league: {
    id: string;
    name: string;
    type: string;
    logo: string;
  };
  season: number;
  date: {
    start: string;
    end: string;
    duration: string;
  };
  stage: number;
  status: {
    clock: string;
    halftime: boolean;
    short: number;
    long: string;
  };
  periods: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  arena: {
    name: string;
    city: string;
    state: string;
    country: string;
  };
  teams: {
    visitors: Team;
    home: Team;
  };
  scores: {
    visitors: Score;
    home: Score;
  };
  officials: string[];
  timesTied: number;
  leadChanges: number;
  nugget: string;
}

interface GamesData {
  games: {
    edges: {
      node: Game;
      cursor: string;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    totalCount: number;
  };
}

export default function Page() {
  const { isLoaded, user } = useUser();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { loading, error, data, fetchMore } = useQuery<GamesData>(GET_GAMES, {
    variables: {
      filters: {
        season: "2024",
      },
      pagination: {
        first: 100,
      },
    },
  });

  useEffect(() => {
    if (!loadMoreRef.current || !data?.games.pageInfo.hasNextPage) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore({
            variables: {
              pagination: {
                first: 100,
                after: data.games.pageInfo.endCursor,
              },
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev;
              return {
                games: {
                  ...fetchMoreResult.games,
                  edges: [...prev.games.edges, ...fetchMoreResult.games.edges],
                },
              };
            },
          });
        }
      },
      { threshold: 1.0 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [data?.games.pageInfo.endCursor, data?.games.pageInfo.hasNextPage, fetchMore]);

  if (!isLoaded) {
    return null;
  }

  if (loading && !data) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Sort games by date in descending order (newest first)
  const games = data?.games?.edges
    ?.map(edge => edge.node)
    .sort((a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime()) || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">NBA Games</h1>
            <div className="flex items-center gap-4">
              <Link 
                href="/sports/nba/log"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 ease-in-out"
              >
                Log a Game
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <div 
              key={game.id} 
              className="bg-card rounded-lg shadow-sm p-4 transform transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-md animate-fadeInUp"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {game.league.logo && (
                    <Image
                      src={game.league.logo}
                      alt={game.league.name}
                      width={24}
                      height={24}
                      className="rounded-full transition-transform duration-300 hover:scale-110"
                    />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(game.date.start), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="text-sm font-medium">
                  {game.status.long}
                </div>
              </div>

              <div className="space-y-4">
                {/* Away Team */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    {game.teams.visitors.logo && (
                      <Image
                        src={game.teams.visitors.logo}
                        alt={game.teams.visitors.name}
                        width={40}
                        height={40}
                        className="rounded-full transition-transform duration-300 group-hover:scale-110"
                      />
                    )}
                    <div>
                      <div className="font-medium transition-colors duration-300 group-hover:text-blue-500">
                        {game.teams.visitors.nickname}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {game.scores.visitors.win}-{game.scores.visitors.loss}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold transition-colors duration-300 group-hover:text-blue-500">
                    {game.scores.visitors.points}
                  </div>
                </div>

                {/* Home Team */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    {game.teams.home.logo && (
                      <Image
                        src={game.teams.home.logo}
                        alt={game.teams.home.name}
                        width={40}
                        height={40}
                        className="rounded-full transition-transform duration-300 group-hover:scale-110"
                      />
                    )}
                    <div>
                      <div className="font-medium transition-colors duration-300 group-hover:text-blue-500">
                        {game.teams.home.nickname}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {game.scores.home.win}-{game.scores.home.loss}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold transition-colors duration-300 group-hover:text-blue-500">
                    {game.scores.home.points}
                  </div>
                </div>
              </div>

              {game.nugget && (
                <div className="mt-4 text-sm text-muted-foreground">
                  {game.nugget}
                </div>
              )}

              <div className="mt-4 text-xs text-muted-foreground">
                {game.arena.name}, {game.arena.city}, {game.arena.state}
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator and intersection observer target */}
        <div 
          ref={loadMoreRef}
          className="flex justify-center items-center py-8"
        >
          {loading && <div>Loading more games...</div>}
        </div>
      </main>
    </div>
  );
}
