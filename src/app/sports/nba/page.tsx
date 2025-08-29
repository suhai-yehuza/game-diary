'use client';

import { ArrowRight, Calendar, Users, Trophy, RefreshCw, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { SportsPageLayout } from '@/app/components/sports';
import { NBANews } from '@/app/components/sports/nba-news';
import { useLatestGames } from '@/hooks/use-latest-games';
import { useLiveGames } from '@/hooks/use-live-games';
import { useNBAPlayers } from '@/hooks/use-nba-players';
import { useNBATeams } from '@/hooks/use-nba-teams';

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
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [countsLoading, setCountsLoading] = useState(true);

  // Fetch data for navigation cards
  const {
    latestGames,
    loading: gamesLoading,
    error: gamesError,
  } = useLatestGames({
    limit: 6,
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

  // Fetch total counts
  useEffect(() => {
    const fetchTotalCounts = async () => {
      try {
        setCountsLoading(true);

        // Check if we're in mock mode
        const useMockData =
          (typeof window !== 'undefined' && window.__API_MOCK_MODE__) ||
          (process.env.NODE_ENV === 'development' && process.env.API_MOCK_MODE === 'true');

        if (useMockData) {
          // For mock data, fetch the full responses to get the results count
          const [gamesResponse, playersResponse] = await Promise.all([
            fetch('/api/mock-server?action=mock-data&type=nba-games'),
            fetch('/api/mock-server?action=mock-data&type=nba-players'),
          ]);

          if (gamesResponse.ok) {
            const gamesData = await gamesResponse.json();
            if (
              gamesData.data &&
              typeof gamesData.data === 'object' &&
              'results' in gamesData.data
            ) {
              setTotalGames(gamesData.data.results);
            }
          }

          if (playersResponse.ok) {
            const playersData = await playersResponse.json();
            if (
              playersData.data &&
              typeof playersData.data === 'object' &&
              'results' in playersData.data
            ) {
              setTotalPlayers(playersData.data.results);
            }
          }
        } else {
          // For real data, make API calls to get total counts
          const [gamesResponse, playersResponse] = await Promise.all([
            fetch('/api/proxy/games?season=2024&league=standard'),
            fetch('/api/players?limit=1000'), // Get a large number to get total count
          ]);

          if (gamesResponse.ok) {
            const gamesData = await gamesResponse.json();
            if (gamesData && typeof gamesData === 'object' && 'results' in gamesData) {
              setTotalGames(gamesData.results);
            }
          }

          if (playersResponse.ok) {
            const playersData = await playersResponse.json();
            if (playersData && typeof playersData === 'object' && 'results' in playersData) {
              setTotalPlayers(playersData.results);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching total counts:', error);
        // Fallback to using the length of fetched data
        setTotalGames(latestGames.length);
        setTotalPlayers(players.length);
      } finally {
        setCountsLoading(false);
      }
    };

    void fetchTotalCounts();
  }, [latestGames.length, players.length]);

  const navigationCards = [
    {
      title: 'Games',
      description: 'Browse and filter NBA games',
      href: '/sports/nba/games',
      icon: Calendar,
      color: 'bg-orange-500 hover:bg-orange-600',
      count: countsLoading ? latestGames.length : totalGames,
      loading: gamesLoading || countsLoading,
    },
    {
      title: 'Teams',
      description: 'Explore all NBA teams',
      href: '/sports/nba/teams',
      icon: Trophy,
      color: 'bg-blue-500 hover:bg-blue-600',
      count: teams.length,
      loading: teamsLoading,
    },
    {
      title: 'Players',
      description: 'Discover NBA players',
      href: '/sports/nba/players',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      count: countsLoading ? players.length : totalPlayers,
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
        {/* Title and Live Games Button - Horizontally Aligned */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold nba-hub-title">NBA Hub</h1>

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
                    `${card.count} ${card.title.toLowerCase()}`
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
