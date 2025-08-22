'use client';

import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { ITeamSearchResultProps } from '@/lib/types';

export function TeamSearchResult({ team }: ITeamSearchResultProps) {
  const router = useRouter();
  const Building2Icon =
    Icons?.Building2 ||
    (({ className }: { className?: string }) => (
      <div data-testid="building2-icon" className={className}>
        Building2
      </div>
    ));
  const MapPinIcon =
    Icons?.MapPin ||
    (({ className }: { className?: string }) => (
      <div data-testid="mappin-icon" className={className}>
        MapPin
      </div>
    ));

  const handleClick = () => {
    router.push(`/sports/nba/team/${team.id}`);
  };

  const location = [team.city, team.state].filter(Boolean).join(', ');
  const conferenceDivision =
    team.conference && team.division
      ? `${team.conference} • ${team.division}`
      : team.conference || team.division || '';

  return (
    <div
      className="flex items-center space-x-4 p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-semantic-error/10 dark:bg-semantic-error/20 rounded-full flex items-center justify-center">
          <Building2Icon className="w-5 h-5 text-semantic-error" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {team.name && team.name.trim() !== '' ? team.name : 'Unknown Team'}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-semantic-error/10 text-semantic-error border border-semantic-error/20">
            Team
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
          {team.nickname && <span className="font-medium">{team.nickname}</span>}
          {location && (
            <span className="flex items-center space-x-1">
              <MapPinIcon className="w-3 h-3" />
              <span>{location}</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-500 mt-1">
          {conferenceDivision && <span>{conferenceDivision}</span>}
        </div>
      </div>
    </div>
  );
}
