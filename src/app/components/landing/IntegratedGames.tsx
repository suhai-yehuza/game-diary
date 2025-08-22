'use client';

import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useLatestGames } from '@/hooks/use-latest-games';

export function IntegratedGames() {
  const { latestGames, loading, error } = useLatestGames({
    limit: 100,
    forceRealData: true,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter to only show finished games
  const finishedGames = latestGames.filter(
    game => game.status?.short === 'FT' || game.status?.long === 'Finished'
  );

  // Auto-cycle through games every 4 seconds
  useEffect(() => {
    if (finishedGames.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % finishedGames.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [finishedGames.length, isPaused]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => `game-skeleton-${i}-${Date.now()}`).map(uniqueId => (
          <div key={uniqueId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-8" />
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">vs</div>
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-8" />
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20" />
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full" />
              </div>
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !finishedGames.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 mb-4">No recent games available</div>
        <Link
          href="/sports/all-sports"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse All Sports
        </Link>
      </div>
    );
  }

  const currentGame = finishedGames[currentIndex];

  const formatGameDate = (game: typeof currentGame) => {
    const dateString = typeof game.date === 'string' ? game.date : game.date.start;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatGameTime = (game: typeof currentGame) => {
    const dateString = typeof game.date === 'string' ? game.date : game.date.start;
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Featured Game */}
      <div
        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Controls */}
        {finishedGames.length > 1 && (
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={() =>
                setCurrentIndex(prev => (prev - 1 + finishedGames.length) % finishedGames.length)
              }
              className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              aria-label="Previous game"
            >
              <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % finishedGames.length)}
              className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              aria-label="Next game"
            >
              <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}

        {/* Arena Info */}
        {currentGame.arena && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">🏟️</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {currentGame.arena.name}
                </span>
              </div>
              {currentGame.arena.city && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentGame.arena.city}
                  {currentGame.arena.state && `, ${currentGame.arena.state}`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Team Logos and Scores */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              {currentGame.teams?.home?.logo ? (
                <Image
                  src={currentGame.teams.home.logo}
                  alt={currentGame.teams.home.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {currentGame.teams?.home?.name?.charAt(0) || 'H'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {currentGame.teams?.home?.name || 'Home Team'}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {currentGame.scores?.home?.points || '-'}
              </div>
            </div>
          </div>

          <div className="text-center mx-3 flex-shrink-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">VS</div>
            <div className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Final</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
            <div className="flex-1 text-right min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {currentGame.teams?.visitors?.name || 'Away Team'}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {currentGame.scores?.visitors?.points || '-'}
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              {currentGame.teams?.visitors?.logo ? (
                <Image
                  src={currentGame.teams.visitors.logo}
                  alt={currentGame.teams.visitors.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {currentGame.teams?.visitors?.name?.charAt(0) || 'A'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatGameDate(currentGame)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatGameTime(currentGame)}
          </div>
        </div>

        {/* Progress Indicators */}
        {finishedGames.length > 1 && (
          <div className="flex gap-1 justify-center mt-3">
            {finishedGames.slice(0, 5).map((game, index) => (
              <button
                key={`game-${game.id}`}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to game ${index + 1}`}
              />
            ))}
            {finishedGames.length > 5 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                +{finishedGames.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* View All Button */}
      <Link
        href="/sports/all-sports"
        className="block w-full text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
      >
        View All Games
      </Link>
    </div>
  );
}
