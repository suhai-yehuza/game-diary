'use client';

import { useOptimizedLandingPageData } from '@/hooks/use-landing-page-data';
import type { ILandingPageClientFallbackProps } from '@/types';

import { IntegratedGameLogs } from './IntegratedGameLogs';
import { IntegratedGames } from './IntegratedGames';
import { PopularGames } from './PopularGames';

export function LandingPageClientFallback({ serverData }: ILandingPageClientFallbackProps) {
  // Only use client-side data if server data is not available
  const {
    data: clientData,
    loading,
    error,
  } = useOptimizedLandingPageData({
    limit: 10,
    skip: !!serverData, // Skip if we have server data
  });

  // Use server data if available, otherwise fall back to client data
  const data = serverData || clientData;

  if (loading && !serverData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="bg-gray-700 dark:bg-gray-600 p-4 sm:p-6 text-white">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-600 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-600 rounded w-1/2" />
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="bg-gray-700 dark:bg-gray-600 p-4 sm:p-6 text-white">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-600 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-600 rounded w-1/2" />
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="bg-gray-700 dark:bg-gray-600 p-4 sm:p-6 text-white">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-600 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-600 rounded w-1/2" />
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !serverData) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 dark:text-red-400 mb-4">
          Failed to load landing page data. Please try refreshing the page.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
      {/* Trending Game Logs Section */}
      <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
        <div className="bg-gray-700 dark:bg-gray-600 p-4 sm:p-6 text-white flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6">📈</div>
            <h2 className="text-lg sm:text-xl font-bold">Trending Game Logs</h2>
          </div>
          <p className="text-white/90 mt-1 text-sm sm:text-base">
            See what&apos;s hot in the community
          </p>
        </div>
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="flex-1">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <IntegratedGameLogs data={data?.trendingContent as any} />
          </div>
        </div>
      </section>

      {/* Recent Games Section */}
      <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
        <div className="bg-gray-700 dark:bg-gray-600 p-4 sm:p-6 text-white flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6">📅</div>
            <h2 className="text-lg sm:text-xl font-bold">Recent Games</h2>
          </div>
          <p className="text-white/90 mt-1 text-sm sm:text-base">Latest results and scores</p>
        </div>
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <IntegratedGames data={data?.recentGames} />
          </div>
        </div>
      </section>

      {/* Popular Games Section */}
      <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
        <div className="bg-gray-700 dark:bg-gray-600 p-4 sm:p-6 text-white flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6">⭐</div>
            <h2 className="text-lg sm:text-xl font-bold">Popular Games</h2>
          </div>
          <p className="text-white/90 mt-1 text-sm sm:text-base">
            Top rated and most popular games
          </p>
        </div>
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <PopularGames data={data?.popularGames} />
          </div>
        </div>
      </section>
    </div>
  );
}
