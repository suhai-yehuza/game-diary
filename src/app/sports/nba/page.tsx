'use client';

import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { isAfter, isBefore } from 'date-fns';
import { Calendar } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';

import { GameCard } from '@/components/features/games';
import { GET_GAMES } from '@/lib/graphql/queries';
import { SearchGame } from '@/lib/types/game.types';

// Pure function to filter live games
const filterLiveGames = (games: SearchGame[]): SearchGame[] =>
  games
    .filter(game => game.status === 'In Progress')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// Pure function to filter scheduled games
const filterScheduledGames = (games: SearchGame[], now: Date): SearchGame[] =>
  games
    .filter(game => isAfter(new Date(game.date), now) && game.status !== 'In Progress')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// Pure function to filter completed games
const filterCompletedGames = (games: SearchGame[], now: Date): SearchGame[] =>
  games
    .filter(game => isBefore(new Date(game.date), now) && game.status !== 'In Progress')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Pure function to handle image errors
const handleImageError = (
  setImageErrors: React.Dispatch<React.SetStateAction<Set<string>>>,
  imageId: string
) => {
  setImageErrors(prev => new Set(prev).add(imageId));
};

// Pure function to handle load more
const handleLoadMore = async (
  dataCompleted:
    | { games: { items: SearchGame[]; hasMore: boolean; nextCursor: string | null } }
    | undefined,
  isFetchingMore: boolean,
  setIsFetchingMore: React.Dispatch<React.SetStateAction<boolean>>,
  fetchMore: (options: {
    variables: {
      filters: {
        season: string;
      };
      pagination: {
        first: number;
        after: string;
      };
    };
    updateQuery: (
      prev: { games: { items: SearchGame[]; hasMore: boolean; nextCursor: string | null } },
      {
        fetchMoreResult,
      }: {
        fetchMoreResult: {
          games: { items: SearchGame[]; hasMore: boolean; nextCursor: string | null };
        };
      }
    ) => { games: { items: SearchGame[]; hasMore: boolean; nextCursor: string | null } };
  }) => Promise<{
    data?: { games: { items: SearchGame[]; hasMore: boolean; nextCursor: string | null } };
  }>
) => {
  if (!dataCompleted?.games.hasMore || isFetchingMore) return;

  setIsFetchingMore(true);
  try {
    const result = await fetchMore({
      variables: {
        filters: {
          season: '2024',
        },
        pagination: {
          first: 200,
          after: dataCompleted.games.nextCursor || '',
        },
      },
      updateQuery: (prev: {
        games: { items: SearchGame[]; hasMore: boolean; nextCursor: string | null };
      }) => {
        if (!prev.games.hasMore) return prev;

        const combinedItems = [...prev.games.items, ...prev.games.items];
        const uniqueItems = combinedItems.reduce(
          (acc, item) => {
            if (!acc.find(i => i.id === item.id)) {
              acc.push(item);
            }
            return acc;
          },
          [] as typeof combinedItems
        );

        return {
          games: {
            ...prev.games,
            items: uniqueItems,
            hasMore: prev.games.hasMore,
            nextCursor: prev.games.nextCursor,
          },
        };
      },
    });

    if (!result.data?.games?.items?.length) {
      console.log('No more games to load');
    }
  } catch (error) {
    console.error('Error loading more games:', error);
  } finally {
    setIsFetchingMore(false);
  }
};

export default function Page() {
  const { isLoaded } = useUser();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showScheduledGames, setShowScheduledGames] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const {
    loading,
    error,
    data: dataCompleted,
    fetchMore,
  } = useQuery<{ games: { items: SearchGame[]; hasMore: boolean; nextCursor: string | null } }>(
    GET_GAMES,
    {
      variables: {
        filters: {
          season: '2024',
        },
        pagination: {
          first: 200,
        },
      },
    }
  );

  const now = new Date();
  const liveGamesList =
    dataCompleted?.games?.items
      ?.filter((game): game is SearchGame => game !== undefined)
      ?.flatMap(game => filterLiveGames([game])) || [];

  const scheduledGamesList =
    dataCompleted?.games?.items
      ?.filter((game): game is SearchGame => game !== undefined)
      ?.flatMap(game => filterScheduledGames([game], now)) || [];

  const completedGamesList =
    dataCompleted?.games?.items
      ?.filter((game): game is SearchGame => game !== undefined)
      ?.flatMap(game => filterCompletedGames([game], now)) || [];

  console.log({ now, liveGamesList, scheduledGamesList, completedGamesList });

  useEffect(() => {
    if (!loadMoreRef.current || !dataCompleted?.games.hasMore) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetchingMore) {
          handleLoadMore(dataCompleted, isFetchingMore, setIsFetchingMore, fetchMore);
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
  }, [dataCompleted, isFetchingMore, fetchMore]);

  if (!isLoaded) {
    return null;
  }

  if (loading && !completedGamesList.length) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {liveGamesList.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveGamesList.map((game, index) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    index={index}
                    imageErrors={imageErrors}
                    onImageError={(imageId: string) => handleImageError(setImageErrors, imageId)}
                  />
                ))}
              </div>
              <hr className="border-t-2 border-gray-300 mt-12 mb-8" />
            </>
          )}
          {!loading && !error && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowScheduledGames(!showScheduledGames)}
                className="flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group shadow-lg hover:shadow-xl"
              >
                <Calendar
                  className={`w-4 h-4 transition-transform duration-300 ${
                    showScheduledGames ? 'rotate-180' : ''
                  }`}
                />
                {showScheduledGames ? (
                  <>Hide Upcoming Games ({scheduledGamesList.length})</>
                ) : (
                  <>Show Upcoming Games ({scheduledGamesList.length})</>
                )}
              </button>
            </div>
          )}
          {showScheduledGames && scheduledGamesList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledGamesList.map((game, index) => (
                <GameCard
                  key={game.id}
                  game={game}
                  index={index}
                  imageErrors={imageErrors}
                  onImageError={(imageId: string) => handleImageError(setImageErrors, imageId)}
                />
              ))}
            </div>
          )}
          {showScheduledGames && <hr className="border-t-2 border-gray-300 mt-12 mb-8" />}
          {showScheduledGames && (
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-4">
              Completed Games
            </h2>
          )}
          {completedGamesList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedGamesList.map((game, index) => (
                <GameCard
                  key={game.id}
                  game={game}
                  index={index}
                  imageErrors={imageErrors}
                  onImageError={(imageId: string) => handleImageError(setImageErrors, imageId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Loading indicator and intersection observer target */}
        <div ref={loadMoreRef} className="flex justify-center items-center py-8">
          {isFetchingMore ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading more games...</span>
            </div>
          ) : dataCompleted?.games.hasMore ? (
            <button
              onClick={() =>
                handleLoadMore(dataCompleted, isFetchingMore, setIsFetchingMore, fetchMore)
              }
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
