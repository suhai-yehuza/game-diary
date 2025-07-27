'use client';

import { Building2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { ISearchResult } from '@/lib/types';

interface ITeamSearchResultProps {
  team: ISearchResult;
}

export function TeamSearchResult({ team }: ITeamSearchResultProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/sports/nba/team/${team.id}`);
  };

  const location = [team.city, team.state].filter(Boolean).join(', ');

  return (
    <div
      className="flex items-center space-x-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <Building2 className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-foreground truncate">
            {team.name ?? 'Unknown Team'}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Team
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {team.nickname && <span className="font-medium">{team.nickname}</span>}
          {location && (
            <span className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
          {team.conference && <span>{team.conference}</span>}
          {team.division && (
            <>
              <span>•</span>
              <span>{team.division}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
