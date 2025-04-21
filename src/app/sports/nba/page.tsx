'use client';

import React, { useRef, useState, useEffect, memo } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_GAMES } from '@/lib/graphql/queries';
import { format, isAfter, isBefore } from 'date-fns';
import { Game } from '@/lib/types/types';
import { Calendar } from 'lucide-react';

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

interface GameCardProps {
  game: Game;
  index: number;
  imageErrors: Record<string, boolean>;
  onImageError: (id: string) => void;
}

const GameCard = memo(({ game, index, imageErrors, onImageError }: GameCardProps) => {
  const isLive = game.status.long === 'In Play';
  const winningTeam = game.scores.visitors.points > game.scores.home.points
    ? 'visitors'
    : game.scores.home.points > game.scores.visitors.points
      ? 'home'
      : null;

  return (
    <Link href={`/sports/nba/games/${game.id}`} className="block">
      <div
        className={`bg-card rounded-xl shadow-lg p-6 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl cursor-pointer h-[280px] flex flex-col border ${
          isLive
            ? 'border-red-500/50 hover:border-red-500 animate-pulse-slow overflow-hidden'
            : 'border-border/50 hover:border-blue-500/50'
        }`}
        style={{
          animationDelay: `${index * 50}ms`,
          animationFillMode: 'both',
        }}
      >
        {isLive && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-sm font-medium animate-pulse rounded-t-xl">
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
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-500 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm" />
                <span className="text-red-600">Q{game.periods.current}</span>
                <span className="font-bold">{game.status.clock}</span>
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
                  src={imageErrors[`${game.id}-visitors`] ? '/gamelog.svg' : game.teams.visitors.logo}
                  alt={game.teams.visitors.name}
                  width={48}
                  height={48}
                  className="rounded-full transition-transform duration-300 group-hover:scale-110"
                  onError={() => onImageError(`${game.id}-visitors`)}
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
                  src={imageErrors[`${game.id}-home`] ? '/gamelog.svg' : game.teams.home.logo}
                  alt={game.teams.home.name}
                  width={48}
                  height={48}
                  className="rounded-full transition-transform duration-300 group-hover:scale-110"
                  onError={() => onImageError(`${game.id}-home`)}
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
});

GameCard.displayName = 'GameCard';

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
  const scheduledGamesList = dataCompleted?.games?.edges
    ?.map(edge => edge.node)
    .filter(game => isAfter(new Date(game.date.start), now) || game.status.long === 'In Play')
    .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime()) || [];

  const completedGamesList = dataCompleted?.games?.edges
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
