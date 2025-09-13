'use client';

import { User, MessageCircle, Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import type { IPopularPlayer, IPopularPlayersData } from '@/types';

import { ProgressiveDataLoader } from './ProgressiveDataLoader';

const PopularPlayersSkeleton = () => (
  <div className="bg-surface-card rounded-lg shadow-sm border border-theme-primary p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-theme-muted rounded animate-pulse" />
      <div className="h-6 w-32 bg-theme-muted rounded animate-pulse" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={`skeleton-popular-players-${i}`}
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

const PopularPlayersContent = ({ data }: { data: IPopularPlayersData }) => {
  const [activeTab, setActiveTab] = useState<'mostPopular'>('mostPopular');
  const { containerRef, contentRef, handleMouseEnter, handleMouseLeave } = useScrollAnimation({
    speed: 2,
    mobileSpeed: 1,
  });

  // Safety check for data - after hooks
  if (!data?.mostPopular) {
    return (
      <div className="text-center py-8 text-theme-muted">
        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No popular players data available yet</p>
      </div>
    );
  }

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
      PG: 'bg-semantic-info/10 text-semantic-info',
      SG: 'bg-semantic-success/10 text-semantic-success',
      SF: 'bg-semantic-warning/10 text-semantic-warning',
      PF: 'bg-semantic-warning/10 text-semantic-warning',
      C: 'bg-semantic-info/10 text-semantic-info',
    };
    return colors[position as keyof typeof colors] || 'bg-bg-theme-tertiary text-theme-primary';
  };

  return (
    <div className="bg-surface-card rounded-lg shadow-sm border border-theme-primary p-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-brand-secondary" />
        <h3 className="text-lg font-semibold text-theme-primary">Popular Players</h3>
      </div>

      <p className="text-sm text-theme-secondary mb-4">
        Players generating the most buzz and engagement
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

      {/* Popular Players List with Scroll Animation */}
      <div
        ref={containerRef}
        className="h-[42rem] overflow-auto relative scroll-container animate-scroll"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={contentRef} className="space-y-3 scroll-content">
          {data.mostPopular && data.mostPopular.length > 0 ? (
            data.mostPopular.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 bg-bg-theme-secondary rounded-lg hover:bg-bg-theme-tertiary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-theme-muted w-6">#{index + 1}</span>
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
                    <h4 className="font-medium text-theme-primary truncate">{player.name}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${getPositionColor(player.position)}`}
                    >
                      {player.position}
                    </span>
                  </div>
                  <p className="text-sm text-theme-secondary truncate">
                    {player.team.name} ({player.team.code})
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-theme-secondary">
                    <MessageCircle className="w-4 h-4" />
                    <span>{formatEngagement(player.commentCount)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-theme-secondary">
                    <Heart className="w-4 h-4" />
                    <span>{formatEngagement(player.reactionCount)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-brand-secondary">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">{(player.popularityScore || 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-theme-muted">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No popular players data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* View All Players Button */}
      <div className="mt-auto pt-4">
        <Link
          href="/sports/nba/players"
          className="block w-full text-center py-3 bg-brand-secondary text-theme-inverse rounded-lg hover:bg-brand-secondary-hover transition-all duration-200 font-medium"
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
