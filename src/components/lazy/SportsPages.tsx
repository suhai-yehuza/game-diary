import dynamic from 'next/dynamic';
import React from 'react';

// Lazy loading components for sports pages
export const LazyNBAPage = dynamic(() => import('@/app/sports/nba/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading NBA page...</p>
      </div>
    </div>
  ),
  ssr: true,
});

export const LazyNFLPage = dynamic(() => import('@/app/sports/nfl/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading NFL page...</p>
      </div>
    </div>
  ),
  ssr: true,
});

export const LazyMLBPage = dynamic(() => import('@/app/sports/mlb/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading MLB page...</p>
      </div>
    </div>
  ),
  ssr: true,
});

export const LazyNHLPage = dynamic(() => import('@/app/sports/nhl/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading NHL page...</p>
      </div>
    </div>
  ),
  ssr: true,
});

export const LazyMLSPage = dynamic(() => import('@/app/sports/mls/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading MLS page...</p>
      </div>
    </div>
  ),
  ssr: true,
});

export const LazyLivePage = dynamic(() => import('@/app/sports/live/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading live games...</p>
      </div>
    </div>
  ),
  ssr: true,
});

export const LazyAllSportsPage = dynamic(() => import('@/app/sports/all-sports/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading all sports...</p>
      </div>
    </div>
  ),
  ssr: true,
});
