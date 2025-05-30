'use client';

import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { isAfter } from 'date-fns';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import { GameCard } from '@/components/features/games';
import { SearchGame, Game, GameEdge, GameQueryResponse } from '@/lib/types/game.types';
import { DEFAULT_PAGE_SIZE } from '@/lib/types/shared.types';
import { getCurrentSeason } from '@/lib/utils/index.time';
import { GET_GAMES } from '@/lib/graphql/queries';

// Convert Game to SearchGame
const convertGameToSearchGame = (game: Game): SearchGame => {
  // Parse JSON fields
  const teams = typeof game.teams === 'string' ? JSON.parse(game.teams) : game.teams;
  const scores = typeof game.scores === 'string' ? JSON.parse(game.scores) : game.scores;
  const periods = typeof game.periods === 'string' ? JSON.parse(game.periods) : game.periods;
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
        id: teams?.home?.id || '',
        name: teams?.home?.name || '',
        nickname: teams?.home?.nickname || '',
        logo: teams?.home?.logo || undefined,
      },
      visitors: {
        id: teams?.visitors?.id || '',
        name: teams?.visitors?.name || '',
        nickname: teams?.visitors?.nickname || '',
        logo: teams?.visitors?.logo || undefined,
      },
    },
    scores: {
      home: {
        points: scores?.home?.points ?? 0,
      },
      visitors: {
        points: scores?.visitors?.points ?? 0,
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
      current: periods?.current ?? 0,
      total: periods?.total ?? 0,
      endOfPeriod: periods?.endOfPeriod ?? false,
    },
    officials: Array.isArray(game.officials) ? game.officials : [],
    timesTied: game.timesTied ?? 0,
    leadChanges: game.leadChanges ?? 0,
    nugget: game.nugget || '',
    created_at:
      game.created_at instanceof Date ? game.created_at.toISOString() : game.created_at || '',
    updated_at:
      game.updated_at instanceof Date ? game.updated_at.toISOString() : game.updated_at || '',
  };
};

// // Pure function to filter live games
// const filterLiveGames = (games: SearchGame[]): SearchGame[] => {
//   return games
//     .filter(
//       game =>
//         (game.status.long === 'In Play' || game.status.short === 'Live') &&
//         !game.status.short.includes('Finished') &&
//         !game.status.short.includes('Final')
//     )
//     .sort((a, b) => {
//       const dateA = new Date(a.date.start);
//       const dateB = new Date(b.date.start);
//       return dateB.getTime() - dateA.getTime(); // Most recent first
//     });
// };

// // Pure function to filter scheduled games
// const filterScheduledGames = (games: SearchGame[], now: Date): SearchGame[] => {
//   return games
//     .filter(
//       game =>
//         (game.status.short === 'Scheduled' || game.status.short === 'Not Started') &&
//         isAfter(new Date(game.date.start), now) &&
//         !game.status.short.includes('Finished') &&
//         !game.status.short.includes('Final')
//     )
//     .sort((a, b) => {
//       const dateA = new Date(a.date.start);
//       const dateB = new Date(b.date.start);
//       return dateA.getTime() - dateB.getTime(); // Chronological order for upcoming games
//     });
// };

// // Pure function to filter completed games
// const filterCompletedGames = (games: SearchGame[]): SearchGame[] => {
//   return games
//     .filter(
//       game =>
//         game.status.short === 'Finished' ||
//         game.status.short === 'Final' ||
//         game.status.long === 'Game Finished'
//     )
//     .sort((a, b) => {
//       const dateA = new Date(a.date.start);
//       const dateB = new Date(b.date.start);
//       return dateB.getTime() - dateA.getTime(); // Most recent first
//     });
// };

export default function NBAPage() {
  const { isLoaded } = useUser();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [currentSeason, setCurrentSeason] = useState<number>(getCurrentSeason());
  const [hasMoreSeasons, setHasMoreSeasons] = useState<boolean>(true);
  const [games, setGames] = useState<SearchGame[]>([]);

  const { loading, error, data, fetchMore } = useQuery<GameQueryResponse>(GET_GAMES, {
    variables: {
      filters: {
        season: currentSeason,
      },
      first: DEFAULT_PAGE_SIZE,
    },
  });

  console.log({ loading, error, data, fetchMore });

  useEffect(() => {
    if (data?.games && Array.isArray(data.games.edges)) {
      const newGames = data.games.edges.map((edge: GameEdge) => convertGameToSearchGame(edge.node));
      // Use a Set to ensure unique games by ID
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

  console.log({ data });

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
        },
      });

      if (newData?.games.edges) {
        const newGames = newData.games.edges.map((edge: GameEdge) =>
          convertGameToSearchGame(edge.node)
        );
        // Use a Set to ensure unique games by ID
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
  const uniqueGames = games || [];

  // Sort all games by date first
  const sortedGames = [...uniqueGames].sort((a, b) => {
    const dateA = new Date(a.date.start);
    const dateB = new Date(b.date.start);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  // Process games into their respective categories
  const processedGames = sortedGames.reduce(
    (acc, game) => {
      // Check if game is live
      if (
        (game.status.long === 'In Play' || game.status.short === 'Live') &&
        !game.status.short.includes('Finished') &&
        !game.status.short.includes('Final')
      ) {
        acc.live.push(game);
      }
      // Check if game is scheduled
      else if (
        (game.status.short === 'Scheduled' || game.status.short === 'Not Started') &&
        isAfter(new Date(game.date.start), now) &&
        !game.status.short.includes('Finished') &&
        !game.status.short.includes('Final')
      ) {
        acc.scheduled.push(game);
      }
      // Check if game is completed
      else if (
        game.status.short === 'Finished' ||
        game.status.short === 'Final' ||
        game.status.long === 'Game Finished'
      ) {
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

  console.log('Final sorted games:', {
    total: games?.length || 0,
    live: liveGamesList.length,
    scheduled: scheduledGamesList.length,
    completed: completedGamesList.length,
    liveGames: liveGamesList.map(g => ({
      id: g.id,
      status: g.status.short,
      date: g.date.start,
      parsed: new Date(g.date.start).toISOString(),
      timestamp: new Date(g.date.start).getTime(),
    })),
    scheduledGames: scheduledGamesList.map(g => ({
      id: g.id,
      status: g.status.short,
      date: g.date.start,
      parsed: new Date(g.date.start).toISOString(),
      timestamp: new Date(g.date.start).getTime(),
    })),
    completedGames: completedGamesList.map(g => ({
      id: g.id,
      status: g.status.short,
      date: g.date.start,
      parsed: new Date(g.date.start).toISOString(),
      timestamp: new Date(g.date.start).getTime(),
    })),
  });

  useEffect(() => {
    if (!loadMoreRef.current || !data?.games.pageInfo.hasNextPage) return;

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
  }, [games, isFetchingMore, handleLoadMore, data?.games.pageInfo.hasNextPage]);

  if (!isLoaded) {
    return null;
  }

  if (loading && !games.length) {
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground">Loading games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-500">Error loading games</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
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
            <h2 className="text-2xl font-semibold mb-4">Upcoming Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledGamesList.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {completedGamesList.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Completed Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGamesList.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
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
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              Load More Games
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
