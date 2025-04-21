"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_GAMES } from "@/lib/graphql/queries";
import { format, isAfter, isBefore } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { Game } from "@/lib/types/types";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [scheduledGames1, setScheduledGames1] = useState<Game[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showScheduledGames, setShowScheduledGames] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const { loading, error, data, fetchMore } = useQuery<GamesData>(GET_GAMES, {
    variables: {
      filters: {
        season: "2024",
      },
      pagination: {
        last: 2000,
      },
    },
  });

  useEffect(() => {
    if (data?.games?.edges) {
      const games = data.games.edges.map(edge => edge.node);
      setAllGames(prevGames => {
        const uniqueGames = [...prevGames, ...games].reduce((acc, game) => {
          if (!acc.find(g => g.id === game.id)) {
            acc.push(game);
          }
          return acc;
        }, [] as Game[]);
        
        return uniqueGames.sort((a, b) => 
          new Date(b.date.start).getTime() - new Date(a.date.start).getTime()
        );
      });

      setScheduledGames1(games.filter(game => isAfter(new Date(game.date.start), now)));
    }
  }, [data]);

  const handleLoadMore = async () => {
    if (!data?.games.pageInfo.hasPreviousPage || isFetchingMore) return;
    
    setIsFetchingMore(true);
    try {
      await fetchMore({
        variables: {
          pagination: {
            last: 2000,
            before: data.games.pageInfo.startCursor,
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          const combinedEdges = [...fetchMoreResult.games.edges, ...prev.games.edges];
          const uniqueEdges = combinedEdges.reduce((acc, edge) => {
            if (!acc.find(e => e.node.id === edge.node.id)) {
              acc.push(edge);
            }
            return acc;
          }, [] as typeof combinedEdges);
          
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
    if (!loadMoreRef.current || !data?.games.pageInfo.hasPreviousPage) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
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
  }, [data?.games.pageInfo.startCursor, data?.games.pageInfo.hasPreviousPage, isFetchingMore]);

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

  if (loading && !allGames.length) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const now = new Date();
  // const scheduledGames = allGames.filter(game => isAfter(new Date(game.date.start), now));
  const completedGames = allGames.filter(game => isBefore(new Date(game.date.start), now));

  const upcomingGamesSection = scheduledGames1.length > 0 ? (
    <>
      {/* Scheduled Games Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowScheduledGames(!showScheduledGames)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {showScheduledGames ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Upcoming Games ({scheduledGames1.length})
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show Upcoming Games ({scheduledGames1.length})
            </>
          )}
        </button>
      </div>

      {/* Upcoming Games Section */}
      {showScheduledGames && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Upcoming Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduledGames1.map((game, index) => (
              <Link 
                key={game.id} 
                href={`/sports/nba/games/${game.id}`}
                className="block"
              >
                <div 
                  className="bg-card rounded-lg shadow-sm p-4 transform transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-md animate-fadeInUp cursor-pointer h-[240px] flex flex-col"
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
                        {format(new Date(game.date.start), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      {game.status.long}
                    </div>
                  </div>

                  <div className="space-y-4 flex-grow">
                    {/* Away Team */}
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        {game.teams.visitors.logo && (
                          <Image
                            src={imageErrors[`${game.id}-visitors`] ? "/gamelog.svg" : game.teams.visitors.logo}
                            alt={game.teams.visitors.name}
                            width={40}
                            height={40}
                            className="rounded-full transition-transform duration-300 group-hover:scale-110"
                            onError={() => handleImageError(`${game.id}-visitors`)}
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
                            src={imageErrors[`${game.id}-home`] ? "/gamelog.svg" : game.teams.home.logo}
                            alt={game.teams.home.name}
                            width={40}
                            height={40}
                            className="rounded-full transition-transform duration-300 group-hover:scale-110"
                            onError={() => handleImageError(`${game.id}-home`)}
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

                  <div className="mt-auto">
                    {game.nugget && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {game.nugget}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mt-2">
                      {game.arena.name}, {game.arena.city}, {game.arena.state}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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
        {upcomingGamesSection}

        {/* Completed Games Section */}
        {completedGames.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Completed Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedGames.map((game, index) => {
                const winningTeam = getWinningTeam(game);
                return (
                  <Link 
                    key={game.id} 
                    href={`/sports/nba/games/${game.id}`}
                    className="block"
                  >
                    <div 
                      className="bg-card rounded-lg shadow-sm p-4 transform transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-md animate-fadeInUp cursor-pointer h-[240px] flex flex-col"
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
                            {format(new Date(game.date.start), "MMM d, yyyy h:mm a")}
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          {game.status.long}
                        </div>
                      </div>

                      <div className="space-y-4 flex-grow">
                        {/* Away Team */}
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            {game.teams.visitors.logo && (
                              <Image
                                src={imageErrors[`${game.id}-visitors`] ? "/gamelog.svg" : game.teams.visitors.logo}
                                alt={game.teams.visitors.name}
                                width={40}
                                height={40}
                                className="rounded-full transition-transform duration-300 group-hover:scale-110"
                                onError={() => handleImageError(`${game.id}-visitors`)}
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
                          <div className={`text-xl font-bold transition-colors duration-300 group-hover:text-blue-500 ${
                            winningTeam === 'visitors' ? 'text-green-500' : ''
                          }`}>
                            {game.scores.visitors.points}
                          </div>
                        </div>

                        {/* Home Team */}
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            {game.teams.home.logo && (
                              <Image
                                src={imageErrors[`${game.id}-home`] ? "/gamelog.svg" : game.teams.home.logo}
                                alt={game.teams.home.name}
                                width={40}
                                height={40}
                                className="rounded-full transition-transform duration-300 group-hover:scale-110"
                                onError={() => handleImageError(`${game.id}-home`)}
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
                          <div className={`text-xl font-bold transition-colors duration-300 group-hover:text-blue-500 ${
                            winningTeam === 'home' ? 'text-green-500' : ''
                          }`}>
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
                        <div className="text-sm text-muted-foreground mt-2">
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
        <div 
          ref={loadMoreRef}
          className="flex justify-center items-center py-8"
        >
          {isFetchingMore ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading more games...</span>
            </div>
          ) : data?.games.pageInfo.hasPreviousPage ? (
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 ease-in-out"
            >
              Load More Games
            </button>
          ) : (
            <div className="text-sm text-muted-foreground">
              No more games to load
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
