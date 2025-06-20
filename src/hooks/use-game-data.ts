import { useQuery } from '@apollo/client';
import { isAfter } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';

import { seedLogger } from '@lib/core/logger';
import { API_CONFIG } from '@src/lib/config/api.config';
import { GET_GAMES } from '@src/lib/graphql/queries';
import type {
  IGame,
  IGameEdge,
  IGameQueryResponse,
  IUseGameDataReturn,
  IUseGameDataProps,
} from '@src/lib/types';
import { getCurrentSeason } from '@src/lib/utils/time';

export function useGameData({
  initialSeason,
  initialFilters,
}: IUseGameDataProps = {}): IUseGameDataReturn {
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [currentSeason, setCurrentSeason] = useState<number>(initialSeason || getCurrentSeason());
  const [hasMoreSeasons, setHasMoreSeasons] = useState<boolean>(true);
  const [games, setGames] = useState<IGame[]>([]);
  const [showUpcomingGames, setShowUpcomingGames] = useState<boolean>(false);
  const [hasShownInitialLoad, setHasShownInitialLoad] = useState(false);

  const { loading, error, data, fetchMore, refetch } = useQuery<IGameQueryResponse>(GET_GAMES, {
    variables: {
      filters: {
        season: currentSeason,
        ...initialFilters,
      },
      first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.games && !hasShownInitialLoad) {
      setHasShownInitialLoad(true);
    }
  }, [data, hasShownInitialLoad]);

  useEffect(() => {
    if (data?.games && Array.isArray(data.games.edges)) {
      const newGames = data.games.edges.map((edge: IGameEdge) => edge.node as IGame);
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
            ...initialFilters,
          },
        },
      });

      if (newData?.games.edges) {
        const newGames = newData.games.edges.map((edge: IGameEdge) => edge.node as IGame);
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
      seedLogger.error('Error fetching more games:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [data, fetchMore, currentSeason, hasMoreSeasons, initialFilters]);

  // Process games into their respective categories
  const processedGames = games.reduce(
    (acc: { live: IGame[]; scheduled: IGame[]; completed: IGame[] }, game: IGame) => {
      const now = new Date();
      if (game.status.long === 'In Play' || game.status.long === 'Live') {
        acc.live.push(game);
      } else if (
        game.status.long === 'Scheduled' ||
        isAfter(new Date(typeof game.date === 'string' ? game.date : game.date.start), now)
      ) {
        acc.scheduled.push(game);
      } else if (game.status.long === 'Finished') {
        acc.completed.push(game);
      }
      return acc;
    },
    { live: [], scheduled: [], completed: [] }
  );

  // Sort all games by date first
  const sortedGames = [...games].sort((a, b) => {
    const dateA = new Date(typeof a.date === 'string' ? a.date : a.date.start);
    const dateB = new Date(typeof b.date === 'string' ? b.date : b.date.start);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  const canLoadMore = data?.games.pageInfo.hasNextPage || hasMoreSeasons;

  return {
    games: sortedGames,
    processedGames,
    loading,
    error: error || null,
    refetch: () => refetch().then(() => {}),
    hasShownInitialLoad,
    isFetchingMore,
    currentSeason,
    hasMoreSeasons,
    showUpcomingGames,
    setShowUpcomingGames,
    handleLoadMore,
    canLoadMore,
  };
}
