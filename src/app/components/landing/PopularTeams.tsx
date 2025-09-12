'use client';

import { Users, MessageCircle, Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import type { IPopularTeam, IPopularTeamsData } from '@/types';

import { ProgressiveDataLoader } from './ProgressiveDataLoader';

const PopularTeamsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={`skeleton-popular-teams-${i}`}
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

const PopularTeamsContent = ({ data }: { data: IPopularTeamsData }) => {
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

  const getTeamLogo = (team: IPopularTeam) => {
    if (team.logo) return team.logo;
    return '/logos/default-team-logo.svg';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Teams</h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Teams with the most engagement and activity
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

      {/* Popular Teams List with Scroll Animation */}
      <div
        ref={containerRef}
        className="h-[42rem] overflow-auto relative scroll-container animate-scroll"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={contentRef} className="space-y-3 scroll-content">
          {data.mostPopular.map((team, index) => (
            <div
              key={team.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                  #{index + 1}
                </span>
                <Image
                  src={getTeamLogo(team)}
                  alt={`${team.name} logo`}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).src = '/logos/default-team-logo.svg';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {team.name}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                    {team.code}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{team.city}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                  <span>{formatEngagement(team.commentCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Heart className="w-4 h-4" />
                  <span>{formatEngagement(team.reactionCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Star className="w-4 h-4" />
                  <span className="font-medium">{(team.popularityScore || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.mostPopular.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No popular teams data available yet</p>
        </div>
      )}

      {/* View All Teams Button */}
      <div className="mt-auto pt-4">
        <Link
          href="/sports/nba/teams"
          className="block w-full text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
        >
          View All Teams
        </Link>
      </div>
    </div>
  );
};

export const PopularTeams = () => {
  return (
    <ProgressiveDataLoader<IPopularTeamsData>
      dataKey="popularTeams"
      endpoint="/api/landing-page/data/popularTeams"
      fallback={<PopularTeamsSkeleton />}
      render={data => <PopularTeamsContent data={data} />}
    />
  );
};
