'use client';

import { User, Calendar, GraduationCap, Ruler, Weight, Building2 } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/Card';
import type { IPlayerResponse as _IPlayerResponse, IPlayerCardProps } from '@/lib/types';

// Interface moved to src/lib/types/components.types.ts

export function PlayerCard({ player }: IPlayerCardProps) {
  const getFullName = () => {
    return `${player.firstname || ''} ${player.lastname || ''}`.trim() || 'Unknown Player';
  };

  const getPosition = () => {
    return player.leagues?.standard?.pos || 'N/A';
  };

  const getJerseyNumber = () => {
    const jersey = player.leagues?.standard?.jersey;
    return jersey ? `#${jersey}` : 'N/A';
  };

  const getHeight = () => {
    const height = player.height;
    if (height?.feets && height?.inches) {
      return `${height.feets}'${height.inches}"`;
    }
    if (height?.meters) {
      return `${height.meters}m`;
    }
    return 'N/A';
  };

  const getWeight = () => {
    const weight = player.weight;
    if (weight?.pounds) {
      return `${weight.pounds} lbs`;
    }
    if (weight?.kilograms) {
      return `${weight.kilograms} kg`;
    }
    return 'N/A';
  };

  const getAge = () => {
    if (!player.birth?.date) return 'N/A';

    try {
      const birthDate = new Date(player.birth.date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
      }
      return age;
    } catch {
      return 'N/A';
    }
  };

  const getExperience = () => {
    const nbaStart = player.nba?.start;
    if (!nbaStart) return 'Rookie';

    const currentYear = new Date().getFullYear();
    const experience = currentYear - nbaStart;

    if (experience <= 0) return 'Rookie';
    if (experience === 1) return '1 year';
    return `${experience} years`;
  };

  const getBirthplace = () => {
    return player.birth?.country || 'N/A';
  };

  const isActive = () => {
    return player.leagues?.standard?.active !== false;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 player-card-enhanced">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Player Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              {/* Player Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Player Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {getFullName()}
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {getJerseyNumber()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">{getPosition()}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{getAge()} years old</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{getExperience()}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Ruler className="w-3 h-3 sm:w-4 sm:h-4" />
                    {getHeight()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Weight className="w-3 h-3 sm:w-4 sm:h-4" />
                    {getWeight()}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-400">
              {player.college && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{player.college}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{getBirthplace()}</span>
              </div>
              {player.nba?.start && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">NBA since {player.nba.start}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status and Action Buttons */}
          <div className="flex-shrink-0 flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                  isActive()
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-500 text-white shadow-sm'
                }`}
              >
                {isActive() ? 'Active' : 'Inactive'}
              </div>
            </div>
            <Button
              onClick={() => (window.location.href = `/sports/nba/players/${player.id}`)}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 shadow-sm transition-all duration-200 font-medium px-3 sm:px-4 py-2 text-xs sm:text-sm"
            >
              View Player
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
