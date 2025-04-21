'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_GAMES } from '@/lib/graphql/queries';
import { format, isAfter, isBefore } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { Game } from '@/lib/types/types';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';

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
  const { isLoaded } = useUser();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [completedGames, setCompletedGames] = useState<Game[]>([]);
  const [scheduledGames, setScheduledGames] = useState<Game[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showScheduledGames, setShowScheduledGames] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const {
    loading,
    error,
    data: dataCompleted,
    fetchMore,
  } = useQuery<GamesData>(GET_GAMES, {
    variables: {
      filters: {
        season: '2024',
      },
      pagination: {
        last: 2000,
      },
    },
  });

  const {
    loading: loadingScheduled,
    error: errorScheduled,
    data: dataScheduled,
  } = useQuery<GamesData>(GET_GAMES, {
    variables: {
      filters: {
        season: '2024',
      },
      pagination: {
        last: 2000,
      },
    },
  });

  useEffect(() => {
    if (dataCompleted?.games?.edges) {
      const now = new Date();
      const games = dataCompleted.games.edges
        .map(edge => edge.node)
        .filter(game => isBefore(new Date(game.date.start), now) && game.status.long !== 'In Play');
      setCompletedGames(prevGames => {
        const uniqueGames = [...prevGames, ...games].reduce((acc, game) => {
          if (!acc.find(g => g.id === game.id)) {
            acc.push(game);
          }
          return acc;
        }, [] as Game[]);

        return uniqueGames.sort(
          (a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime()
        );
      });
    }
  }, [dataCompleted]);

  useEffect(() => {
    if (dataScheduled?.games?.edges) {
      const now = new Date();
      const futureGames = dataScheduled.games.edges
        .map(edge => edge.node)
        .filter(game => isAfter(new Date(game.date.start), now) || game.status.long === 'In Play');
      setScheduledGames(prevGames => {
        const uniqueFutureGames = [...prevGames, ...futureGames].reduce((acc, game) => {
          if (!acc.find(g => g.id === game.id)) {
            acc.push(game);
          }
          return acc;
        }, [] as Game[]);

        return uniqueFutureGames.sort(
          (a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime()
        );
      });
    }
  }, [dataScheduled]);

  const handleLoadMore = async () => {
    if (!dataCompleted?.games.pageInfo.hasPreviousPage || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      await fetchMore({
        variables: {
          pagination: {
            last: 2000,
            before: dataCompleted.games.pageInfo.startCursor,
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          const combinedEdges = [...fetchMoreResult.games.edges, ...prev.games.edges];
          const uniqueEdges = combinedEdges.reduce(
            (acc, edge) => {
              if (!acc.find(e => e.node.id === edge.node.id)) {
                acc.push(edge);
              }
              return acc;
            },
            [] as typeof combinedEdges
          );

          return {
            games: {
              ...fetchMoreResult.games,
              edges: uniqueEdges,
            },
          };
        },
      });
    } catch (error) {
      console.error('Error loading more games:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (!loadMoreRef.current || !dataCompleted?.games.pageInfo.hasPreviousPage) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetchingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [
    dataCompleted?.games.pageInfo.startCursor,
    dataCompleted?.games.pageInfo.hasPreviousPage,
    isFetchingMore,
  ]);

  const getWinningTeam = (game: Game) => {
    if (game.scores.visitors.points > game.scores.home.points) {
      return 'visitors';
    } else if (game.scores.home.points > game.scores.visitors.points) {
      return 'home';
    }
    return null; // Tie game
  };

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  if (!isLoaded) {
    return null;
  }

  if (loading && !completedGames.length) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const upcomingGamesSection =
    scheduledGames.length > 0 ? (
      <>
        {/* Scheduled Games Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowScheduledGames(!showScheduledGames)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <Calendar
              className={`w-4 h-4 transition-transform duration-300 ${
                showScheduledGames ? 'rotate-180' : ''
              }`}
            />
            {showScheduledGames ? (
              <>Hide Upcoming Games ({scheduledGames.length})</>
            ) : (
              <>Show Upcoming Games ({scheduledGames.length})</>
            )}
          </button>
        </div>

        {/* Upcoming Games Section */}
        {showScheduledGames && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Upcoming Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledGames.map((game, index) => {
                const isLive = game.status.long === 'In Play';
                const winningTeam =
                  game.scores.visitors.points > game.scores.home.points
                    ? 'visitors'
                    : game.scores.home.points > game.scores.visitors.points
                      ? 'home'
                      : null;
                return (
                  <Link key={game.id} href={`/sports/nba/games/${game.id}`} className="block">
                    <div
                      className={`bg-card rounded-xl shadow-lg p-6 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl cursor-pointer h-[280px] flex flex-col border ${
                        isLive
                          ? 'border-red-500/50 hover:border-red-500 animate-pulse-slow'
                          : 'border-purple-500/50 hover:border-purple-500/70'
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      {isLive && (
                        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-sm font-medium animate-pulse">
                          LIVE
                        </div>
                      )}
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
                            {format(new Date(game.date.start), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLive ? (
                            <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-xs font-medium">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />Q
                              {game.periods.current} {game.status.clock}
                            </div>
                          ) : (
                            <div className="text-sm font-medium px-2 py-1 rounded-full bg-purple-500/10 text-purple-500">
                              {game.status.long}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6 flex-grow">
                        {/* Away Team */}
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            {game.teams.visitors.logo && (
                              <Image
                                src={
                                  imageErrors[`${game.id}-visitors`]
                                    ? '/gamelog.svg'
                                    : game.teams.visitors.logo
                                }
                                alt={game.teams.visitors.name}
                                width={48}
                                height={48}
                                className="rounded-full transition-transform duration-300 group-hover:scale-110"
                                onError={() => handleImageError(`${game.id}-visitors`)}
                              />
                            )}
                            <div>
                              <div className="font-semibold text-lg transition-colors duration-300 group-hover:text-purple-500">
                                {game.teams.visitors.nickname}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {game.scores.visitors.win}-{game.scores.visitors.loss}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-2xl font-bold transition-colors duration-300 group-hover:text-purple-500 ${
                              isLive && winningTeam === 'visitors' ? 'text-green-500' : ''
                            }`}
                          >
                            {game.scores.visitors.points}
                          </div>
                        </div>

                        {/* Home Team */}
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            {game.teams.home.logo && (
                              <Image
                                src={
                                  imageErrors[`${game.id}-home`]
                                    ? '/gamelog.svg'
                                    : game.teams.home.logo
                                }
                                alt={game.teams.home.name}
                                width={48}
                                height={48}
                                className="rounded-full transition-transform duration-300 group-hover:scale-110"
                                onError={() => handleImageError(`${game.id}-home`)}
                              />
                            )}
                            <div>
                              <div className="font-semibold text-lg transition-colors duration-300 group-hover:text-purple-500">
                                {game.teams.home.nickname}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {game.scores.home.win}-{game.scores.home.loss}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-2xl font-bold transition-colors duration-300 group-hover:text-purple-500 ${
                              isLive && winningTeam === 'home' ? 'text-green-500' : ''
                            }`}
                          >
                            {game.scores.home.points}
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {game.nugget && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {game.nugget}
                          </div>
                        )}
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
                            className="text-purple-500"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {game.arena.name}, {game.arena.city}, {game.arena.state}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </>
    ) : null;

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
        {!loadingScheduled && !errorScheduled && upcomingGamesSection}

        {/* Completed Games Section */}
        {completedGames.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Completed Games
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedGames.map((game, index) => {
                const winningTeam = getWinningTeam(game);
                return (
                  <Link key={game.id} href={`/sports/nba/games/${game.id}`} className="block">
                    <div
                      className="bg-card rounded-xl shadow-lg p-6 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl cursor-pointer h-[280px] flex flex-col border border-border/50 hover:border-blue-500/50"
                      style={{
                        animationDelay: `${index * 50}ms`,
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
                                src={
                                  imageErrors[`${game.id}-visitors`]
                                    ? '/gamelog.svg'
                                    : game.teams.visitors.logo
                                }
                                alt={game.teams.visitors.name}
                                width={48}
                                height={48}
                                className="rounded-full transition-transform duration-300 group-hover:scale-110"
                                onError={() => handleImageError(`${game.id}-visitors`)}
                              />
                            )}
                            <div>
                              <div className="font-semibold text-lg transition-colors duration-300 group-hover:text-blue-500">
                                {game.teams.visitors.nickname}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {game.scores.visitors.win}-{game.scores.visitors.loss}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-2xl font-bold transition-colors duration-300 group-hover:text-blue-500 ${
                              winningTeam === 'visitors' ? 'text-green-500' : ''
                            }`}
                          >
                            {game.scores.visitors.points}
                          </div>
                        </div>

                        {/* Home Team */}
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            {game.teams.home.logo && (
                              <Image
                                src={
                                  imageErrors[`${game.id}-home`]
                                    ? '/gamelog.svg'
                                    : game.teams.home.logo
                                }
                                alt={game.teams.home.name}
                                width={48}
                                height={48}
                                className="rounded-full transition-transform duration-300 group-hover:scale-110"
                                onError={() => handleImageError(`${game.id}-home`)}
                              />
                            )}
                            <div>
                              <div className="font-semibold text-lg transition-colors duration-300 group-hover:text-blue-500">
                                {game.teams.home.nickname}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {game.scores.home.win}-{game.scores.home.loss}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-2xl font-bold transition-colors duration-300 group-hover:text-blue-500 ${
                              winningTeam === 'home' ? 'text-green-500' : ''
                            }`}
                          >
                            {game.scores.home.points}
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {game.nugget && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {game.nugget}
                          </div>
                        )}
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
                );
              })}
            </div>
          </div>
        )}

        {/* Loading indicator and intersection observer target */}
        <div ref={loadMoreRef} className="flex justify-center items-center py-8">
          {isFetchingMore ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading more games...</span>
            </div>
          ) : dataCompleted?.games.pageInfo.hasPreviousPage ? (
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              Load More Games
            </button>
          ) : (
            <div className="text-sm text-muted-foreground">No more games to load</div>
          )}
        </div>
      </main>
    </div>
  );
}
