'use client';

import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { IPlayerSearchResultProps } from '@/lib/types';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function PlayerSearchResult({ player }: IPlayerSearchResultProps) {
  const router = useRouter();
  const UserIcon =
    Icons?.User ||
    (({ className }: { className?: string }) => (
      <div data-testid="user-icon" className={className}>
        User
      </div>
    ));
  const MapPinIcon =
    Icons?.MapPin ||
    (({ className }: { className?: string }) => (
      <div data-testid="mappin-icon" className={className}>
        MapPin
      </div>
    ));
  const GraduationCapIcon =
    Icons?.GraduationCap ||
    (({ className }: { className?: string }) => (
      <div data-testid="graduationcap-icon" className={className}>
        GraduationCap
      </div>
    ));
  const CalendarIcon =
    Icons?.Calendar ||
    (({ className }: { className?: string }) => (
      <div data-testid="calendar-icon" className={className}>
        Calendar
      </div>
    ));

  const handleClick = () => {
    router.push(`/sports/nba/player/${player.id}`);
  };

  const fullName = [player.first_name, player.last_name].filter(Boolean).join(' ');
  const heightWeight = [player.height, player.weight].filter(Boolean).join(' • ');

  return (
    <div
      className="flex items-center space-x-4 p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-accent-blue/10 dark:bg-accent-blue/20 rounded-full flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-accent-blue" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {fullName || 'Unknown Player'}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
            Player
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
          {player.teams && (
            <span className="flex items-center space-x-1">
              <MapPinIcon className="w-3 h-3" />
              <span>{player.teams}</span>
            </span>
          )}
          {player.college && (
            <span className="flex items-center space-x-1">
              <GraduationCapIcon className="w-3 h-3" />
              <span>{player.college}</span>
            </span>
          )}
          {player.birth && (
            <span className="flex items-center space-x-1">
              <CalendarIcon className="w-3 h-3" />
              <span>{formatDate(player.birth)}</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-500 mt-1">
          {heightWeight && <span>{heightWeight}</span>}
          {player.nba && (
            <span className="flex items-center space-x-1">
              <span>•</span>
              <span>NBA: {player.nba}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
