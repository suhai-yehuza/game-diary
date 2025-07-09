import dynamic from 'next/dynamic';
import React from 'react';

// Lazy loading component for LiveGamesDetail
export const LazyLiveGamesDetail = dynamic(
  () =>
    import('@/app/components/live-games-detail').then(mod => ({ default: mod.LiveGamesDetail })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    ),
    ssr: false,
  }
);
