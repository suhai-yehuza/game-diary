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
    <section className="bg-surface-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-theme-primary/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="bg-theme-muted p-4 sm:p-6 text-text-inverse">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6">📈</div>
          <h2 className="text-lg sm:text-xl font-bold">Trending Game Logs</h2>
        </div>
        <p className="text-text-inverse/90 mt-1 text-sm sm:text-base">
          See what&apos;s hot in the community
        </p>
      </div>
      <div className="p-4 sm:p-6">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-4 bg-bg-theme-secondary rounded w-full mb-2"
                />
              ))}
            </div>
          }
        >
          <ProgressiveDataLoader
            dataKey="trendingContent"
            fallback={
              <div className="text-center py-4 text-theme-muted">Loading trending content...</div>
            }
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data => <IntegratedGameLogs data={data as any} />}
          </ProgressiveDataLoader>
        </Suspense>
      </div>
    </section>
  );
}

function RecentGamesSection() {
  return (
    <section className="bg-surface-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-theme-primary/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="bg-theme-muted p-4 sm:p-6 text-text-inverse">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6">📅</div>
          <h2 className="text-lg sm:text-xl font-bold">Recent Games</h2>
        </div>
        <p className="text-text-inverse/90 mt-1 text-sm sm:text-base">Latest results and scores</p>
      </div>
      <div className="p-4 sm:p-6">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-4 bg-bg-theme-secondary rounded w-full mb-2"
                />
              ))}
            </div>
          }
        >
          <ProgressiveDataLoader
            dataKey="recentGames"
            fallback={
              <div className="text-center py-4 text-theme-muted">Loading recent games...</div>
            }
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data => <IntegratedGames data={data as any} />}
          </ProgressiveDataLoader>
        </Suspense>
      </div>
    </section>
  );
}

function PopularGamesSection() {
  return (
    <section className="bg-surface-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-theme-primary/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="bg-theme-muted p-4 sm:p-6 text-text-inverse">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6">⭐</div>
          <h2 className="text-lg sm:text-xl font-bold">Popular Games</h2>
        </div>
        <p className="text-text-inverse/90 mt-1 text-sm sm:text-base">
          Top rated and most popular games
        </p>
      </div>
      <div className="p-4 sm:p-6">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-4 bg-bg-theme-secondary rounded w-full mb-2"
                />
              ))}
            </div>
          }
        >
          <ProgressiveDataLoader
            dataKey="popularGames"
            fallback={
              <div className="text-center py-4 text-theme-muted">Loading popular games...</div>
            }
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data => <PopularGames data={data as any} />}
          </ProgressiveDataLoader>
        </Suspense>
      </div>
    </section>
  );
}

function PopularTeamsSection() {
  return (
    <section className="bg-surface-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-theme-primary/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="bg-theme-muted p-4 sm:p-6 text-text-inverse">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6">🏀</div>
          <h2 className="text-lg sm:text-xl font-bold">Popular Teams</h2>
        </div>
        <p className="text-text-inverse/90 mt-1 text-sm sm:text-base">
          Teams with the most engagement
        </p>
      </div>
      <div className="p-4 sm:p-6">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-4 bg-bg-theme-secondary rounded w-full mb-2"
                />
              ))}
            </div>
          }
        >
          <PopularTeams />
        </Suspense>
      </div>
    </section>
  );
}

function PopularPlayersSection() {
  return (
    <section className="bg-surface-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-theme-primary/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="bg-theme-muted p-4 sm:p-6 text-text-inverse">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6">👤</div>
          <h2 className="text-lg sm:text-xl font-bold">Popular Players</h2>
        </div>
        <p className="text-text-inverse/90 mt-1 text-sm sm:text-base">
          Players generating the most buzz
        </p>
      </div>
      <div className="p-4 sm:p-6">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-4 bg-bg-theme-secondary rounded w-full mb-2"
                />
              ))}
            </div>
          }
        >
          <PopularPlayers />
        </Suspense>
      </div>
    </section>
  );
}

export function LandingPageDataSection() {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* First Row: Original three sections - responsive stacking */}
      <div className="grid grid-cols-1 tablet-sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
        <TrendingContentSection />
        <RecentGamesSection />
        <PopularGamesSection />
      </div>

      {/* Second Row: Popular Teams and Players - responsive layout */}
      <div className="grid grid-cols-1 tablet-lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
        <PopularTeamsSection />
        <PopularPlayersSection />
      </div>
    </div>
  );
}
