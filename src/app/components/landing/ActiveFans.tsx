'use client';

import { Users, MessageCircle, Heart, Star, Activity } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import type { IActiveFan, IActiveFansData } from '@/types';

import { ProgressiveDataLoader } from './ProgressiveDataLoader';

const ActiveFansSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={`skeleton-active-fans-${i}`}
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Active Fans</h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Community members driving the most engagement
      </p>

      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('mostActive')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'mostActive'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Most Active
        </button>
      </div>

      <div className="space-y-3">
        {data.mostActive.map((fan, index) => (
          <div
            key={fan.id}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                #{index + 1}
              </span>
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
              <h4 className="font-medium text-gray-900 dark:text-white truncate">{fan.username}</h4>
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <span>{fan.gameLogCount} logs</span>
                <span>•</span>
                <span>{formatEngagement(fan.receivedEngagement)} received</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <MessageCircle className="w-4 h-4" />
                <span>{formatEngagement(fan.commentCount)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
