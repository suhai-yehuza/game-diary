'use client';

import { ArrowRight, Calendar, Users, Trophy, RefreshCw, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { SportsPageLayout } from '@/app/components/sports';
import { NBANews } from '@/app/components/sports/nba-news';
import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';
import { useLatestGames } from '@/hooks/use-latest-games';
import { useLiveGames } from '@/hooks/use-live-games';
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
  // State for total counts
  const [totalGames, setTotalGames] = useState<number>(0);
  const [totalTeams, setTotalTeams] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [countsLoading, setCountsLoading] = useState(true);

  // Fetch data for navigation cards
  const {
    latestGames,
    loading: gamesLoading,
    error: gamesError,
  } = useLatestGames({
    limit: API_LIMITS.GAMES.DEFAULT,
    forceRealData: false, // Use mock data instead of external API
  });

  const {
    teams,
    loading: teamsLoading,
    error: teamsError,
  } = useNBATeams({
    forceRealData: false, // Use mock data instead of external API
  });

  const {
    players,
    loading: playersLoading,
    error: playersError,
  } = useNBAPlayers({
    forceRealData: false, // Use mock data instead of external API
  });

  // Fetch live games data
  const { games: liveGames, loading: liveGamesLoading } = useLiveGames();

  // Fetch total counts from database
  const fetchTotalCounts = useCallback(async () => {
    try {
      // Get counts directly from database
      const response = await fetch('/api/nba-hub/counts');
      const data = await response.json();

      if (data.success) {
        setTotalGames(data.counts.games);
        setTotalTeams(data.counts.teams);
        setTotalPlayers(data.counts.players);

        console.log(
          `📊 NBA Hub counts from database: ${data.counts.games} games, ${data.counts.teams} teams, ${data.counts.players} players`
        );

        setCountsLoading(false);
      } else {
        // Fallback to using the length of fetched data
        setTotalGames(latestGames.length);
        setTotalTeams(teams.length);
        setTotalPlayers(players.length);
        setCountsLoading(false);
        console.log('📊 NBA Hub using fallback counts from fetched data');
      }
    } catch (error) {
      console.error('Error fetching database counts:', error);
      // Fallback to using the length of fetched data
      setTotalGames(latestGames.length);
      setTotalTeams(teams.length);
      setTotalPlayers(players.length);
      setCountsLoading(false);
    }
  }, [latestGames.length, teams.length, players.length]);

  useEffect(() => {
    // Fetch immediately on page load
    void fetchTotalCounts();
  }, [fetchTotalCounts]); // Now depends on fetchTotalCounts

  const navigationCards = [
    {
      title: 'Games',
      description: 'Browse and filter NBA games',
      href: '/sports/nba/games',
      icon: Calendar,
      color: TAILWIND_CLASSES.sports.nba,
      count: countsLoading ? latestGames.length : totalGames,
      formattedCount: countsLoading
        ? `${latestGames.length} games`
        : `${formatNumberShort(totalGames)} games`,
      loading: gamesLoading || countsLoading,
    },
    {
      title: 'Teams',
      description: 'Explore all NBA teams',
      href: '/sports/nba/teams',
      icon: Trophy,
      color: TAILWIND_CLASSES.sports.nfl, // Using NFL blue for Teams
      count: countsLoading ? teams.length : totalTeams,
      formattedCount: countsLoading
        ? `${teams.length} teams`
        : `${formatNumberShort(totalTeams)} teams`,
      loading: teamsLoading || countsLoading,
    },
    {
      title: 'Players',
      description: 'Discover NBA players',
      href: '/sports/nba/players',
      icon: Users,
      color: TAILWIND_CLASSES.sports.mls, // Using MLS green for Players
      count: countsLoading ? players.length : totalPlayers,
      formattedCount: countsLoading
        ? `${players.length} players`
        : `${formatNumberShort(totalPlayers)} players`,
      loading: playersLoading || countsLoading,
    },
  ];

  const isLoading = gamesLoading || teamsLoading || playersLoading;
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
              onClick={() => {
                setCountsLoading(true);
                void fetchTotalCounts();
              }}
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
                onClick: e => e.preventDefault(),
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {isLoading ? (
          // Show skeleton loading for navigation cards
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

        <NBANews limit={6} />
      </section>
    </SportsPageLayout>
  );
}
