'use client';

import { ArrowRight, Calendar, Trophy, RefreshCw, Newspaper, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useCallback } from 'react';

import { SportsPageLayout } from '@/app/components/sports';
import { NBANews } from '@/app/components/sports/nba-news';
import { Standings } from '@/app/components/sports/standings';
import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';
import { useLatestGames } from '@/hooks/use-latest-games';
import { useLiveGames } from '@/hooks/use-live-games';
import { useOptimizedNBAHubCounts } from '@/hooks/use-nba-hub-counts';
import { useNBAPlayers } from '@/hooks/use-nba-players';
import { useNBATeams } from '@/hooks/use-nba-teams';
import { API_LIMITS } from '@/lib/constants';
import { TAILWIND_CLASSES } from '@/lib/constants/colors';

// Skeleton components for better loading states
const NavigationCardSkeleton = () => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg" />
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded" />
    </div>
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3" />
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
  </div>
);

export default function NBAPage() {
  // Use the optimized NBA Hub counts hook with GraphQL
  const {
    counts: totalCounts,
    loading: countsLoading,
    error: _countsError,
    refresh: refreshCounts,
    lastUpdated: _countsLastUpdated,
    source: countsSource,
  } = useOptimizedNBAHubCounts();

  // Fetch data for navigation cards
  const {
    latestGames: _latestGames,
    loading: gamesLoading,
    error: gamesError,
  } = useLatestGames({
    limit: API_LIMITS.GAMES.DEFAULT,
    forceRealData: false, // Use mock data instead of external API
  });

  const {
    teams: _teams,
    loading: teamsLoading,
    error: teamsError,
  } = useNBATeams({
    forceRealData: false, // Use mock data instead of external API
  });

  const {
    players: _players,
    loading: playersLoading,
    error: playersError,
  } = useNBAPlayers({
    forceRealData: false, // Use mock data instead of external API
  });

  // Fetch live games data
  const { games: liveGames, loading: liveGamesLoading } = useLiveGames();

  // Handle refresh button click
  const handleRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh requested for NBA Hub counts');
    await refreshCounts?.();
  }, [refreshCounts]);

  // Define loading states before using them in useEffect
  const isLoading = gamesLoading || teamsLoading || playersLoading;
  const countsAreLoading = countsLoading;

  // Log cache performance
  useEffect(() => {
    if (totalCounts && countsSource) {
      console.log(`📊 NBA Hub counts loaded from ${countsSource}:`, totalCounts);
      if (countsSource === 'optimized-graphql') {
        console.log('⚡ Optimized GraphQL query - fast response!');
      } else {
        console.log('🐌 Standard query - database query executed');
      }
    }
  }, [totalCounts, countsSource]);

  // Debug loading states
  useEffect(() => {
    console.log('🔍 Loading states:', {
      countsLoading,
      gamesLoading,
      teamsLoading,
      playersLoading,
      isLoading,
      countsAreLoading,
      hasCounts: !!totalCounts,
    });
  }, [
    countsLoading,
    gamesLoading,
    teamsLoading,
    playersLoading,
    isLoading,
    countsAreLoading,
    totalCounts,
  ]);

  const navigationCards = [
    {
      icon: Calendar,
      title: 'Games',
      description: 'Browse and filter NBA games',
      count: totalCounts?.totalGames || 0,
      href: '/sports/nba/games',
      color: TAILWIND_CLASSES.sports.nba,
      formattedCount: countsLoading
        ? 'Loading...'
        : `${formatNumberShort(totalCounts?.totalGames || 0)} games`,
      loading: countsLoading,
    },
    {
      icon: Trophy,
      title: 'Teams',
      description: 'Explore all NBA teams',
      count: totalCounts?.totalTeams || 0,
      href: '/sports/nba/teams',
      color: TAILWIND_CLASSES.sports.nfl, // Using NFL blue for Teams
      formattedCount: countsAreLoading
        ? 'Loading...'
        : `${formatNumberShort(totalCounts?.totalTeams || 0)} teams`,
      loading: countsAreLoading,
    },
    {
      icon: Users,
      title: 'Players',
      description: 'Discover NBA players',
      count: totalCounts?.totalPlayers || 0,
      href: '/sports/nba/players',
      color: TAILWIND_CLASSES.sports.mls, // Using MLS green for Players
      formattedCount: countsAreLoading
        ? 'Loading...'
        : `${formatNumberShort(totalCounts?.totalPlayers || 0)} players`,
      loading: countsAreLoading,
    },
    {
      icon: BarChart3,
      title: 'Standings',
      description: 'View team standings and rankings',
      count: 30, // NBA has 30 teams
      href: '#standings', // Scroll to standings section
      color: TAILWIND_CLASSES.sports.nba, // Using NBA orange for Standings
      formattedCount: '30 teams',
      loading: false,
    },
  ];

  const hasErrors = gamesError || teamsError || playersError;

  // Check if there are active live games
  const hasLiveGames = liveGames && liveGames.length > 0;
  const isLiveGamesReady = !liveGamesLoading;

  return (
    <SportsPageLayout title="" description="" showLiveGamesButton={false}>
      {/* Hero Section */}
      <div className="mb-6 sm:mb-8">
        {/* Title, Refresh Button, and Live Games Button - Horizontally Aligned */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold nba-hub-title">NBA Hub</h1>

            {/* Refresh Counts Button */}
            <button
              onClick={() => void handleRefresh()}
              disabled={countsLoading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh database counts"
            >
              <RefreshCw className={`w-4 h-4 ${countsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Live Games Button */}
          <Link
            href="/sports/live"
            className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 flex-shrink-0 text-sm sm:text-base ${
              isLiveGamesReady && hasLiveGames
                ? 'bg-semantic-error text-white hover:bg-semantic-error/90'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
            }`}
            {...(!hasLiveGames &&
              isLiveGamesReady && {
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                },
                'aria-disabled': true,
              })}
          >
            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-2 ${
                isLiveGamesReady && hasLiveGames
                  ? 'bg-white animate-pulse'
                  : 'bg-gray-300 dark:bg-gray-500'
              }`}
            />
            Live Games
          </Link>
        </div>

        <p className="text-lg sm:text-xl nba-page-description mb-6 sm:mb-8">
          Your complete destination for NBA games, teams, and players. Stay updated with live
          scores, explore team rosters, and discover player statistics.
        </p>
      </div>

      {/* Error Banner */}
      {hasErrors && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-xs sm:text-sm">
            Some data may not be loading correctly. Please refresh the page to try again.
          </p>
        </div>
      )}

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {countsAreLoading ? (
          // Show skeleton loading for navigation cards - only when counts are loading
          <>
            <NavigationCardSkeleton />
            <NavigationCardSkeleton />
            <NavigationCardSkeleton />
          </>
        ) : (
          navigationCards.map(card => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group block p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 nba-nav-card"
                aria-label={`Navigate to ${card.title} page`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-lg ${card.color} text-white`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                  </div>
                  <ArrowRight
                    className="w-4 h-4 sm:w-5 sm:h-5 nav-card-arrow group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-300 mb-3">
                  {card.description}
                </p>
                <div className="text-xs sm:text-sm nav-card-count">
                  {card.loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    card.formattedCount
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* NBA Standings Section */}
      <section id="standings" aria-labelledby="nba-standings-heading" className="mt-8 sm:mt-12">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h2
            id="nba-standings-heading"
            className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
          >
            NBA Standings
          </h2>
        </div>

        <Standings />
      </section>

      {/* NBA News Section */}
      <section aria-labelledby="nba-news-heading" className="mt-8 sm:mt-12">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2
            id="nba-news-heading"
            className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
          >
            Latest NBA News
          </h2>
        </div>

        <NBANews news={[]} limit={6} />
      </section>
    </SportsPageLayout>
  );
}
