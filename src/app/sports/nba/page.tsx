'use client';

import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { isAfter } from 'date-fns';
import React, { useState, useEffect, useCallback } from 'react';

import { logger } from '@lib/core/logger';
import { GameCard } from '@src/app/protected/user/components/game-logs/game-card';
import { API_CONFIG } from '@src/lib/config/api.config';
import { GET_GAMES } from '@src/lib/graphql/queries';
import type { IGame, IGameEdge, IGameQueryResponse } from '@src/lib/types';
import { getCurrentSeason } from '@src/lib/utils/time';

export const dynamic = 'force-dynamic';

export default function NBAPage() {
  const { isLoaded } = useUser();
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [currentSeason, setCurrentSeason] = useState<number>(getCurrentSeason());
  const [hasMoreSeasons, setHasMoreSeasons] = useState<boolean>(true);
  const [games, setGames] = useState<IGame[]>([]);
  const [showUpcomingGames, setShowUpcomingGames] = useState<boolean>(false);

  const { loading, error, data, fetchMore } = useQuery<IGameQueryResponse>(GET_GAMES, {
    variables: {
      filters: {
        season: currentSeason,
      },
      first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
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
      const newGames = data.games.edges.map((edge: IGameEdge) => edge.node);
      setGames(prevGames => {
        const gameMap = new Map(prevGames.map(game => [game.id, game]));
        newGames.forEach((game: IGame) => {
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
        const newGames = newData.games.edges.map((edge: IGameEdge) => edge.node);
        setGames(prevGames => {
          const gameMap = new Map(prevGames.map(game => [game.id, game]));
          newGames.forEach((game: IGame) => {
            if (!gameMap.has(game.id)) {
              gameMap.set(game.id, game);
            }
          });
          return Array.from(gameMap.values());
        });
      }
    } catch (error) {
      logger.error('Error fetching more games:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [data, fetchMore, currentSeason, hasMoreSeasons]);

  const now = new Date();

  // Sort all games by date first
  const sortedGames = [...(games || [])].sort((a, b) => {
    const dateA = new Date(typeof a.date === 'string' ? a.date : a.date.start);
    const dateB = new Date(typeof b.date === 'string' ? b.date : b.date.start);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  // Process games into their respective categories
  const processedGames = sortedGames.reduce(
    (acc, game) => {
      // Check if game is live
      if (
        (typeof game.status === 'object' &&
          game.status !== null &&
          game.status.long === 'In Play') ||
        (typeof game.status === 'object' && game.status !== null && game.status.long === 'Live')
      ) {
        acc.live.push(game);
      }
      // Check if game is scheduled
      else if (
        (typeof game.status === 'object' &&
          game.status !== null &&
          game.status.long === 'Scheduled') ||
        isAfter(new Date(typeof game.date === 'string' ? game.date : game.date.start), now)
      ) {
        acc.scheduled.push(game);
      }
      // Check if game is completed
      else if (
        typeof game.status === 'object' &&
        game.status !== null &&
        game.status.long === 'Finished'
      ) {
        acc.completed.push(game);
      }
      return acc;
    },
    { live: [], scheduled: [], completed: [] } as {
      live: IGame[];
      scheduled: IGame[];
      completed: IGame[];
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
            <div className="flex flex-wrap justify-center items-start gap-4 w-full">
              {liveGamesList.map(game => (
                <div
                  key={game.id}
                  className={liveGamesList.length === 1 ? 'mx-auto max-w-md w-full' : 'w-[350px]'}
                >
                  <GameCard game={game} />
                </div>
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
