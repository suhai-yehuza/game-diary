'use client';

import { Users, MessageCircle, Heart, Star, Activity } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import type { IActiveFan, IActiveFansData } from '@/types';

import { ProgressiveDataLoader } from './ProgressiveDataLoader';

const ActiveFansSkeleton = () => (
  <div className="bg-surface-card rounded-lg shadow-sm border border-theme-primary p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-bg-theme-secondary rounded animate-pulse" />
      <div className="h-6 w-32 bg-bg-theme-secondary rounded animate-pulse" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={`skeleton-active-fans-${i}`}
          className="flex items-center gap-3 p-3 bg-bg-theme-secondary rounded-lg"
        >
          <div className="w-8 h-8 bg-bg-theme-secondary rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-bg-theme-secondary rounded animate-pulse mb-1" />
            <div className="h-3 w-16 bg-bg-theme-secondary rounded animate-pulse" />
          </div>
          <div className="h-4 w-12 bg-bg-theme-secondary rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

const ActiveFansContent = ({ data }: { data: IActiveFansData }) => {
  const [activeTab, setActiveTab] = useState<'mostActive'>('mostActive');

  const formatEngagement = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getUserAvatar = (fan: IActiveFan) => {
    if (fan.imageUrl) return fan.imageUrl;
    return '/avatars/default-user-avatar.svg';
  };

  return (
    <div className="bg-surface-card rounded-lg shadow-sm border border-theme-primary p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-semantic-warning" />
        <h3 className="text-lg font-semibold text-theme-primary">Most Active Fans</h3>
      </div>

      <p className="text-sm text-theme-muted mb-4">Community members driving the most engagement</p>

      <div className="flex gap-1 mb-4 bg-bg-theme-secondary rounded-lg p-1">
        <button
          onClick={() => setActiveTab('mostActive')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'mostActive'
              ? 'bg-surface-card text-theme-primary shadow-sm'
              : 'text-theme-muted hover:text-theme-primary'
          }`}
        >
          Most Active
        </button>
      </div>

      <div className="space-y-3">
        {data.mostActive.map((fan, index) => (
          <div
            key={fan.id}
            className="flex items-center gap-3 p-3 bg-bg-theme-secondary rounded-lg hover:bg-theme-muted transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-theme-muted w-6">#{index + 1}</span>
              <Image
                src={getUserAvatar(fan)}
                alt={`${fan.username} avatar`}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src = '/avatars/default-user-avatar.svg';
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-theme-primary truncate">{fan.username}</h4>
              <div className="flex items-center gap-3 text-xs text-theme-muted">
                <span>{fan.gameLogCount} logs</span>
                <span>•</span>
                <span>{formatEngagement(fan.receivedEngagement)} received</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-theme-muted">
                <MessageCircle className="w-4 h-4" />
                <span>{formatEngagement(fan.commentCount)}</span>
              </div>
              <div className="flex items-center gap-1 text-theme-muted">
                <Heart className="w-4 h-4" />
                <span>{formatEngagement(fan.reactionCount)}</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <Star className="w-4 h-4" />
                <span className="font-medium">{fan.activityScore.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.mostActive.length === 0 && (
        <div className="text-center py-8 text-theme-muted">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active fans data available yet</p>
        </div>
      )}
    </div>
  );
};

export const ActiveFans = () => {
  return (
    <ProgressiveDataLoader<IActiveFansData>
      dataKey="activeFans"
      endpoint="/api/landing-page/data/activeFans"
      fallback={<ActiveFansSkeleton />}
      render={data => <ActiveFansContent data={data} />}
    />
  );
};
