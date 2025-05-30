'use client';

import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { isAfter } from 'date-fns';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import { GameCard } from '@/components/features/games';
import { GET_GAMES } from '@/lib/graphql/queries';
import { SearchGame, Game, GameEdge, GameQueryResponse } from '@/lib/types/game.types';
import { DEFAULT_PAGE_SIZE } from '@/lib/types/shared.types';
import { getCurrentSeason } from '@/lib/utils/index.time';

// Convert Game to SearchGame
const convertGameToSearchGame = (game: Game): SearchGame => {
  const arena =
    typeof game.arena === 'string'
      ? { name: game.arena, city: '', state: '', country: '' }
      : game.arena;

  return {
    id: game.id,
    date: {
      start: game.date.start instanceof Date ? game.date.start.toISOString() : game.date.start,
      end: game.date.end instanceof Date ? game.date.end?.toISOString() || '' : game.date.end || '',
      duration: game.date.duration || '',
    },
    status: {
      clock: game.status.clock || '',
      halftime: game.status.halftime ?? false,
      long: game.status.long || '',
      short: game.status.short || '',
    },
    teams: {
      home: {
        id: game.teams?.home?.id || '',
        name: game.teams?.home?.name || '',
        nickname: game.teams?.home?.nickname || '',
        logo: game.teams?.home?.logo || undefined,
      },
      visitors: {
        id: game.teams?.visitors?.id || '',
        name: game.teams?.visitors?.name || '',
        nickname: game.teams?.visitors?.nickname || '',
        logo: game.teams?.visitors?.logo || undefined,
      },
    },
    scores: {
      home: {
        points: game.scores?.home?.points ?? 0,
      },
      visitors: {
        points: game.scores?.visitors?.points ?? 0,
      },
    },
    arena: {
      name: arena?.name || '',
      city: arena?.city || '',
      state: arena?.state || '',
      country: arena?.country || '',
    },
    league: game.league || '',
    season: game.season,
    stage: game.stage,
    periods: {
      current: game.periods?.current ?? 0,
      total: game.periods?.total ?? 0,
      endOfPeriod: game.periods?.endOfPeriod ?? false,
    },
    officials: Array.isArray(game.officials) ? game.officials : [],
    timesTied: game.timesTied ?? 0,
    leadChanges: game.leadChanges ?? 0,
    nugget: game.nugget || '',
    createdAt: game.createdAt instanceof Date ? game.createdAt.toISOString() : game.createdAt || '',
    updatedAt: game.updatedAt instanceof Date ? game.updatedAt.toISOString() : game.updatedAt || '',
  };
};

export default function NBAPage() {
  const { isLoaded } = useUser();
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [currentSeason, setCurrentSeason] = useState<number>(getCurrentSeason());
  const [hasMoreSeasons, setHasMoreSeasons] = useState<boolean>(true);
  const [games, setGames] = useState<SearchGame[]>([]);
  const [showUpcomingGames, setShowUpcomingGames] = useState<boolean>(false);

  const { loading, error, data, fetchMore } = useQuery<GameQueryResponse>(GET_GAMES, {
    variables: {
      filters: {
        season: currentSeason,
      },
      first: DEFAULT_PAGE_SIZE,
    },
    notifyOnNetworkStatusChange: true,
  });

  const [hasShownInitialLoad, setHasShownInitialLoad] = useState(false);

  useEffect(() => {
    if (data?.games && !hasShownInitialLoad) {
      setHasShownInitialLoad(true);
    }
  }, [data, hasShownInitialLoad]);

  useEffect(() => {
    if (data?.games && Array.isArray(data.games.edges)) {
      const newGames = data.games.edges.map((edge: GameEdge) => convertGameToSearchGame(edge.node));
      setGames(prevGames => {
        const gameMap = new Map(prevGames.map(game => [game.id, game]));
        newGames.forEach(game => {
          if (!gameMap.has(game.id)) {
            gameMap.set(game.id, game);
          }
        });
        return Array.from(gameMap.values());
      });
    }
  }, [data]);

  const handleLoadMore = useCallback(async () => {
    if (!data?.games.pageInfo.hasNextPage) {
      if (hasMoreSeasons) {
        const nextSeason = currentSeason - 1;
        setCurrentSeason(nextSeason);
        setHasMoreSeasons(nextSeason >= 2020); // Assuming we want to go back to 2020
        setGames([]); // Clear games when changing seasons
        return;
      }
      return;
    }

    setIsFetchingMore(true);
    try {
      const { data: newData } = await fetchMore({
        variables: {
          after: data.games.pageInfo.endCursor,
          filters: {
            season: currentSeason,
          },
        },
      });

      if (newData?.games.edges) {
        const newGames = newData.games.edges.map((edge: GameEdge) =>
          convertGameToSearchGame(edge.node)
        );
        setGames(prevGames => {
          const gameMap = new Map(prevGames.map(game => [game.id, game]));
          newGames.forEach(game => {
            if (!gameMap.has(game.id)) {
              gameMap.set(game.id, game);
            }
          });
          return Array.from(gameMap.values());
        });
      }
    } catch (error) {
      console.error('Error fetching more games:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [data, fetchMore, currentSeason, hasMoreSeasons]);

  const now = new Date();

  // Sort all games by date first
  const sortedGames = [...(games || [])].sort((a, b) => {
    const dateA = new Date(a.date.start);
    const dateB = new Date(b.date.start);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  // Process games into their respective categories
  const processedGames = sortedGames.reduce(
    (acc, game) => {
      // Check if game is live
      if (game.status.long === 'In Play' || game.status.long === 'Live') {
        acc.live.push(game);
      }
      // Check if game is scheduled
      else if (game.status.long === 'Scheduled' || isAfter(new Date(game.date.start), now)) {
        acc.scheduled.push(game);
      }
      // Check if game is completed
      else if (game.status.long === 'Finished') {
        acc.completed.push(game);
      }
      return acc;
    },
    { live: [], scheduled: [], completed: [] } as {
      live: SearchGame[];
      scheduled: SearchGame[];
      completed: SearchGame[];
    }
  );

  const liveGamesList = processedGames.live;
  const scheduledGamesList = processedGames.scheduled;
  const completedGamesList = processedGames.completed;

  if (!isLoaded || (!hasShownInitialLoad && loading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-muted-foreground">Loading games...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error loading games</div>
          <div className="text-sm text-muted-foreground mb-4">{error.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">NBA Games</h1>
      <div className="space-y-8">
        {liveGamesList.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Live Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveGamesList.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {scheduledGamesList.length > 0 && (
          <div>
            {showUpcomingGames && (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowUpcomingGames(prev => !prev)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                  >
                    Hide Upcoming Games
                  </button>
                </div>
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scheduledGamesList.map(game => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center mb-4">
          {(!scheduledGamesList.length || showUpcomingGames) && (
            <h2 className="text-2xl font-semibold">Completed Games</h2>
          )}
          {scheduledGamesList.length > 0 && !showUpcomingGames && (
            <button
              onClick={() => setShowUpcomingGames(prev => !prev)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition ml-auto"
            >
              Show Upcoming Games
            </button>
          )}
        </div>

        {completedGamesList.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGamesList.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        <div className="flex justify-center items-center py-8">
          {isFetchingMore || loading ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-muted-foreground">
                Loading more games...
              </span>
            </div>
          ) : data?.games.pageInfo.hasNextPage || hasMoreSeasons ? (
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
      </div>
    </div>
  );
}
