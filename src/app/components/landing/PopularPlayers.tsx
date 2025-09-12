'use client';

import { User, MessageCircle, Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import type { IPopularPlayer, IPopularPlayersData } from '@/types';

import { ProgressiveDataLoader } from './ProgressiveDataLoader';

const PopularPlayersSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={`skeleton-popular-players-${i}`}
          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-1" />
            <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          </div>
          <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

const PopularPlayersContent = ({ data }: { data: IPopularPlayersData }) => {
  const [activeTab, setActiveTab] = useState<'mostPopular'>('mostPopular');
  const { containerRef, contentRef, handleMouseEnter, handleMouseLeave } = useScrollAnimation({
    speed: 2,
    mobileSpeed: 1,
  });

  const formatEngagement = (count: number | undefined | null) => {
    if (count === undefined || count === null || isNaN(count)) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getTeamLogo = (team: IPopularPlayer['team']) => {
    if (team.logo) return team.logo;
    return '/logos/default-team-logo.svg';
  };

  const getPositionColor = (position: string) => {
    const colors = {
      PG: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      SG: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      SF: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      PF: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      C: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return (
      colors[position as keyof typeof colors] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-green-600 dark:text-green-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Players</h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Players generating the most buzz and engagement
      </p>

      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('mostPopular')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'mostPopular'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Most Popular
        </button>
      </div>

      {/* Popular Players List with Scroll Animation */}
      <div
        ref={containerRef}
        className="h-[42rem] overflow-auto relative scroll-container animate-scroll"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={contentRef} className="space-y-3 scroll-content">
          {data.mostPopular.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                  #{index + 1}
                </span>
                <Image
                  src={getTeamLogo(player.team)}
                  alt={`${player.team.name} logo`}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).src = '/logos/default-team-logo.svg';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {player.name}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${getPositionColor(player.position)}`}
                  >
                    {player.position}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {player.team.name} ({player.team.code})
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                  <span>{formatEngagement(player.commentCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Heart className="w-4 h-4" />
                  <span>{formatEngagement(player.reactionCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Star className="w-4 h-4" />
                  <span className="font-medium">{(player.popularityScore || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.mostPopular.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No popular players data available yet</p>
        </div>
      )}

      {/* View All Players Button */}
      <div className="mt-auto pt-4">
        <Link
          href="/sports/nba/players"
          className="block w-full text-center py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
        >
          View All Players
        </Link>
      </div>
    </div>
  );
};

export const PopularPlayers = () => {
  return (
    <ProgressiveDataLoader<IPopularPlayersData>
      dataKey="popularPlayers"
      endpoint="/api/landing-page/data/popularPlayers"
      fallback={<PopularPlayersSkeleton />}
      render={data => <PopularPlayersContent data={data} />}
    />
  );
};
