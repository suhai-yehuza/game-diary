'use client';

import { Suspense } from 'react';

import { CardSkeleton as _CardSkeleton } from '@/app/components/common/LoadingSpinner';
import { LandingPageDataService as _LandingPageDataService } from '@/lib/services/landing-page-data.service';
import type { ILandingPageData as _ILandingPageData } from '@/types';

import { IntegratedGameLogs } from './IntegratedGameLogs';
import { IntegratedGames } from './IntegratedGames';
import { PopularGames } from './PopularGames';
import { PopularPlayers } from './PopularPlayers';
import { PopularTeams } from './PopularTeams';
import { ProgressiveDataLoader } from './ProgressiveDataLoader';

// Individual section components for progressive loading
function TrendingContentSection() {
  return (
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
          <Suspense
            fallback={
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"
                  />
                ))}
              </div>
            }
          >
            <ProgressiveDataLoader
              dataKey="trendingContent"
              fallback={
                <div className="text-center py-4 text-gray-500">Loading trending content...</div>
              }
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data => <IntegratedGameLogs data={data as any} />}
            </ProgressiveDataLoader>
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function RecentGamesSection() {
  return (
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
          <Suspense
            fallback={
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"
                  />
                ))}
              </div>
            }
          >
            <ProgressiveDataLoader
              dataKey="recentGames"
              fallback={
                <div className="text-center py-4 text-gray-500">Loading recent games...</div>
              }
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data => <IntegratedGames data={data as any} />}
            </ProgressiveDataLoader>
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function PopularGamesSection() {
  return (
    <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
      <div className="bg-gray-700 dark:bg-gray-600 p-4 sm:p-6 text-white flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6">⭐</div>
          <h2 className="text-lg sm:text-xl font-bold">Popular Games</h2>
        </div>
        <p className="text-white/90 mt-1 text-sm sm:text-base">Top rated and most popular games</p>
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"
                  />
                ))}
              </div>
            }
          >
            <ProgressiveDataLoader
              dataKey="popularGames"
              fallback={
                <div className="text-center py-4 text-gray-500">Loading popular games...</div>
              }
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data => <PopularGames data={data as any} />}
            </ProgressiveDataLoader>
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function PopularTeamsSection() {
  return (
    <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
      <div className="bg-blue-600 dark:bg-blue-700 p-4 sm:p-6 text-white flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6">🏀</div>
          <h2 className="text-lg sm:text-xl font-bold">Popular Teams</h2>
        </div>
        <p className="text-white/90 mt-1 text-sm sm:text-base">Teams with the most engagement</p>
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"
                  />
                ))}
              </div>
            }
          >
            <PopularTeams />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function PopularPlayersSection() {
  return (
    <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
      <div className="bg-green-600 dark:bg-green-700 p-4 sm:p-6 text-white flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6">👤</div>
          <h2 className="text-lg sm:text-xl font-bold">Popular Players</h2>
        </div>
        <p className="text-white/90 mt-1 text-sm sm:text-base">Players generating the most buzz</p>
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"
                  />
                ))}
              </div>
            }
          >
            <PopularPlayers />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

export function LandingPageDataSection() {
  return (
    <div className="space-y-8">
      {/* First Row: Original three sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        <TrendingContentSection />
        <RecentGamesSection />
        <PopularGamesSection />
      </div>

      {/* Second Row: Popular Teams and Players - taking up more space */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        <PopularTeamsSection />
        <PopularPlayersSection />
      </div>
    </div>
  );
}
