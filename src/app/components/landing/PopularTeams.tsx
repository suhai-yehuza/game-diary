'use client';

import { Users, MessageCircle, Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import type { IPopularTeam, IPopularTeamsData } from '@/types';

import { ProgressiveDataLoader } from './ProgressiveDataLoader';

const PopularTeamsSkeleton = () => (
  <div className="bg-surface-card rounded-lg shadow-sm border border-theme-primary p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-theme-muted rounded animate-pulse" />
      <div className="h-6 w-32 bg-theme-muted rounded animate-pulse" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={`skeleton-popular-teams-${i}`}
          className="flex items-center gap-3 p-3 bg-bg-theme-secondary rounded-lg"
        >
          <div className="w-8 h-8 bg-theme-muted rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-theme-muted rounded animate-pulse mb-1" />
            <div className="h-3 w-16 bg-theme-muted rounded animate-pulse" />
          </div>
          <div className="h-4 w-12 bg-theme-muted rounded animate-pulse" />
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
    <div className="bg-surface-card rounded-lg shadow-sm border border-theme-primary p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-brand-primary" />
        <h3 className="text-lg font-semibold text-theme-primary">Popular Teams</h3>
      </div>

      <p className="text-sm text-theme-secondary mb-4">
        Teams with the most engagement and activity
      </p>

      <div className="flex gap-1 mb-4 bg-bg-theme-secondary rounded-lg p-1">
        <button
          onClick={() => setActiveTab('mostPopular')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'mostPopular'
              ? 'bg-surface-card text-theme-primary shadow-sm'
              : 'text-theme-secondary hover:text-theme-primary'
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
              className="flex items-center gap-3 p-3 bg-bg-theme-secondary rounded-lg hover:bg-bg-theme-tertiary transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-theme-muted w-6">#{index + 1}</span>
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
                  <h4 className="font-medium text-theme-primary truncate">{team.name}</h4>
                  <span className="text-xs text-theme-muted bg-bg-theme-tertiary px-2 py-0.5 rounded">
                    {team.code}
                  </span>
                </div>
                <p className="text-sm text-theme-secondary truncate">{team.city}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-theme-secondary">
                  <MessageCircle className="w-4 h-4" />
                  <span>{formatEngagement(team.commentCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-theme-secondary">
                  <Heart className="w-4 h-4" />
                  <span>{formatEngagement(team.reactionCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-brand-primary">
                  <Star className="w-4 h-4" />
                  <span className="font-medium">{(team.popularityScore || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.mostPopular.length === 0 && (
        <div className="text-center py-8 text-theme-muted">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No popular teams data available yet</p>
        </div>
      )}

      {/* View All Teams Button */}
      <div className="mt-auto pt-4">
        <Link
          href="/sports/nba/teams"
          className="block w-full text-center py-3 bg-brand-primary text-theme-inverse rounded-lg hover:bg-brand-primary-hover transition-all duration-200 font-medium"
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
