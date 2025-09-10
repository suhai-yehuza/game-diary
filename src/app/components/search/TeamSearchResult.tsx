'use client';

import { Building2, MapPin, Star, Trophy, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BaseSearchResult } from '@/app/components/search/BaseSearchResult';
import { SEARCH_STYLES } from '@/app/components/search/utils/searchStyles';
import type { ITeamSearchResultProps } from '@/types';

export function TeamSearchResult({ team }: ITeamSearchResultProps) {
  const router = useRouter();
  const Building2Icon = Building2;
  const MapPinIcon = MapPin;

  const handleClick = () => {
    // Navigate to the specific team details page using its ID
    router.push(`/sports/nba/teams/${team.id}`);
  };

  const location = [team.city, team.state].filter(Boolean).join(', ');
  const conferenceDivision =
    team.conference && team.division
      ? `${team.conference} • ${team.division}`
      : team.conference || team.division || '';

  return (
    <BaseSearchResult
      onClick={handleClick}
      gradient={SEARCH_STYLES.gradients.team}
      badgeColor={SEARCH_STYLES.badge.team}
      badgeText="View Details"
      badgeIcon={<ArrowRight className={SEARCH_STYLES.actionIndicator.icon} />}
    >
      {/* Enhanced Avatar */}
      <div className="flex-shrink-0">
        <div className={`${SEARCH_STYLES.avatar.base} ${SEARCH_STYLES.avatar.team}`}>
          <Building2Icon className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Team Information */}
      <div className={SEARCH_STYLES.content.info}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className={`${SEARCH_STYLES.content.title} truncate`}>
                {team.name && team.name.trim() !== '' ? team.name : 'Unknown Team'}
              </h3>
              <span className={`${SEARCH_STYLES.badge.base} ${SEARCH_STYLES.badge.team}`}>
                <span
                  className={`w-1.5 h-1.5 ${SEARCH_STYLES.badgeDot.team} rounded-full mr-1.5`}
                />
                Team
              </span>
            </div>

            {/* Team Nickname */}
            {team.nickname && (
              <div className="flex items-center space-x-1 mb-3">
                <Star className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {team.nickname}
                </span>
              </div>
            )}

            <div className={SEARCH_STYLES.content.meta}>
              {location && (
                <div className="flex items-center space-x-1.5">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{location}</span>
                </div>
              )}

              {conferenceDivision && (
                <div className="flex items-center space-x-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>{conferenceDivision}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseSearchResult>
  );
}
