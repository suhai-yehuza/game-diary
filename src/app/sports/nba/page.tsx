'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@apollo/client';
import { GET_GAMES } from '@/lib/graphql/queries';
import { isAfter, isBefore } from 'date-fns';
import { GamesData } from '@/lib/types/types';
import { Calendar } from 'lucide-react';
import { GameCard } from '@/components/game-card';

export default function Page() {
  const { isLoaded } = useUser();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
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
        first: 200,
      },
    },
  });

  const now = new Date();
  const liveGamesList =
    dataCompleted?.games?.edges
      ?.map(edge => edge.node)
      .filter(game => game.status.long === 'In Play')
      .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime()) || [];

  const scheduledGamesList =
    dataCompleted?.games?.edges
      ?.map(edge => edge.node)
      .filter(game => isAfter(new Date(game.date.start), now) && game.status.long !== 'In Play')
      .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime()) || [];

  const completedGamesList =
    dataCompleted?.games?.edges
      ?.map(edge => edge.node)
      .filter(game => isBefore(new Date(game.date.start), now) && game.status.long !== 'In Play')
      .sort((a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime()) || [];

  const handleLoadMore = async () => {
    if (!dataCompleted?.games.pageInfo.hasNextPage || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      const result = await fetchMore({
        variables: {
          filters: {
            season: '2024',
          },
          pagination: {
            first: 200,
            after: dataCompleted.games.pageInfo.endCursor,
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          const combinedEdges = [...prev.games.edges, ...fetchMoreResult.games.edges];
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
              pageInfo: fetchMoreResult.games.pageInfo,
            },
          };
        },
      });

      if (!result.data?.games?.edges?.length) {
        console.log('No more games to load');
      }
    } catch (error) {
      console.error('Error loading more games:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (!loadMoreRef.current || !dataCompleted?.games.pageInfo.hasNextPage) return;

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
    dataCompleted?.games.pageInfo.endCursor,
    dataCompleted?.games.pageInfo.hasNextPage,
    isFetchingMore,
  ]);

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

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
                    onImageError={handleImageError}
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
                  onImageError={handleImageError}
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
                  onImageError={handleImageError}
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
          ) : dataCompleted?.games.pageInfo.hasNextPage ? (
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
