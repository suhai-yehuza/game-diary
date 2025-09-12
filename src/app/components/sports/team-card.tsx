'use client';

import { Building2, Trophy, MapPin } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/Card';
import type { ITeamResponse as _ITeamResponse, ITeamCardProps } from '@/types';

export function TeamCard({ team }: ITeamCardProps) {
  const getConferenceInfo = () => {
    const conference = team.leagues?.standard?.conference;
    const division = team.leagues?.standard?.division;

    if (conference && division) {
      return `${conference} Conference • ${division} Division`;
    }
    if (conference) {
      return `${conference} Conference`;
    }
    return 'NBA Team';
  };

  const getTeamLocation = () => {
    return team.city;
  };

  const getTeamGroup = () => {
    // Check if team is an All Star team first
    if (team.allStar) {
      return 'All Star';
    } else if (team.nbaFranchise) {
      // Check if team is an NBA franchise (but not All Star)
      const conference = team.leagues?.standard?.conference;
      if (conference === 'East' || conference === 'Eastern') {
        return 'East';
      } else if (conference === 'West' || conference === 'Western') {
        return 'West';
      }
      // If NBA franchise but conference doesn't match East/West, it goes to Exhibition
      return 'Exhibition';
    } else {
      // Not an NBA franchise - check if conference contains "int" (case insensitive)
      const conference = team.leagues?.standard?.conference;
      if (conference?.toLowerCase().includes('int')) {
        return 'International';
      }
      // If not NBA franchise and conference doesn't contain "int", it goes to Exhibition
      return 'Exhibition';
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 team-card-enhanced h-full flex flex-col"
      data-testid="team-card"
    >
      <CardContent className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6 h-full">
          {/* Team Info */}
          <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Team Logo */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {team.logo ? (
                    <Image
                      src={team.logo}
                      alt={`${team.name} logo`}
                      width={48}
                      height={48}
                      className="object-contain w-full h-full"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                  ) : (
                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Team Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {team.name}
                  </h3>
                  <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {team.code}
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 truncate">
                  {team.nickname}
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate font-medium">{getTeamLocation()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate font-medium">{getConferenceInfo()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex flex-col gap-3 sm:gap-4">
            {/* Team Badge */}
            <div className="flex items-center justify-end gap-2">
              <div
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-sm border ${(() => {
                  const group = getTeamGroup();
                  switch (group) {
                    case 'All Star':
                      return 'bg-pink-500 text-white border-gray-200';
                    case 'East':
                      return 'bg-orange-500 text-white border-gray-200';
                    case 'West':
                      return 'bg-blue-500 text-white border-gray-200';
                    case 'International':
                      return 'bg-green-500 text-white border-gray-200';
                    case 'Exhibition':
                      return 'bg-purple-500 text-white border-gray-200';
                    default:
                      return 'bg-gray-500 text-white border-gray-200';
                  }
                })()}`}
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const group = getTeamGroup();
                    switch (group) {
                      case 'All Star':
                        return (
                          <>
                            <span>⭐</span>
                            All Star
                          </>
                        );
                      case 'East':
                        return (
                          <>
                            <span>🏀</span>
                            East
                          </>
                        );
                      case 'West':
                        return (
                          <>
                            <span>🏀</span>
                            West
                          </>
                        );
                      case 'International':
                        return (
                          <>
                            <span>🌍</span>
                            International
                          </>
                        );
                      case 'Exhibition':
                        return (
                          <>
                            <span>🎪</span>
                            Exhibition
                          </>
                        );
                      default:
                        return 'Unknown';
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <Button
                onClick={() => (window.location.href = `/sports/nba/teams/${team.id}`)}
                variant="default"
                size="default"
                className="bg-slate-700 hover:bg-slate-800 text-white border-slate-700 hover:border-slate-800 shadow-sm transition-all duration-200 font-medium px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base team-card-button"
              >
                View Team
              </Button>
              <Button
                onClick={() => (window.location.href = `/sports/nba/teams/${team.id}#players`)}
                variant="outline"
                size="default"
                className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 shadow-sm transition-all duration-200 font-medium px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base team-card-button"
              >
                View Players
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
