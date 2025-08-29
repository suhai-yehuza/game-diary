'use client';

import { Building2, MapPin, Star, Trophy, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { ITeamSearchResultProps } from '@/lib/types';

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
    <div
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-transparent dark:from-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start space-x-4">
        {/* Enhanced Avatar */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
            <Building2Icon className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Team Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {team.name && team.name.trim() !== '' ? team.name : 'Unknown Team'}
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5" />
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

              <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
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

            {/* Action indicator with prompt */}
            <div className="flex-shrink-0 ml-4 flex flex-col items-end">
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300" />
              <span className="text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                View Details
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
