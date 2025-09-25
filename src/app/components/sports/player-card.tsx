'use client';

import { User, Calendar, GraduationCap, Ruler, Weight, Building2 } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/Card';
import type { IPlayerResponse as _IPlayerResponse, IPlayerCardProps } from '@/types';

export function PlayerCard({ player }: IPlayerCardProps) {
  const getFullName = () => {
    return `${player.firstname || ''} ${player.lastname || ''}`.trim() || 'Unknown Player';
  };

  const getPosition = () => {
    // Try to get position from leagues JSONB first, then fallback to basic position
    return player.leagues?.standard?.pos || player.position || 'X';
  };

  const getJerseyNumber = () => {
    const jersey = player.leagues?.standard?.jersey;
    return jersey ? `#${jersey}` : '0X';
  };

  const getHeight = () => {
    const height = player.height;
    if (height?.feets && height?.inches) {
      return `${height.feets}'${height.inches}"`;
    }
    if (height?.meters) {
      return `${height.meters}m`;
    }
    return 'X\'Y"';
  };

  const getWeight = () => {
    const weight = player.weight;
    if (weight?.pounds) {
      return `${weight.pounds} lbs`;
    }
    if (weight?.kilograms) {
      return `${weight.kilograms} kg`;
    }
    return 'X lbs';
  };

  const getAge = () => {
    if (!player.birth?.date) return 'X';

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
      return 'X';
    }
  };

  const getExperience = () => {
    const nbaStart = player.nba?.start;
    const proYears = player.nba?.pro;

    // If we have pro years and it's > 0, use that
    if (proYears && proYears > 0) {
      if (proYears === 1) return '1 year';
      return `${proYears} years`;
    }

    // Otherwise calculate from start year
    if (!nbaStart || nbaStart === 0) return 'Rookie';

    const currentYear = new Date().getFullYear();
    const experience = currentYear - nbaStart;

    if (experience <= 0) return 'Rookie';
    if (experience === 1) return '1 year';
    return `${experience} years`;
  };

  const getBirthplace = () => {
    return player.birth?.country || 'X';
  };

  const getCurrentTeam = () => {
    if (!player.teams || !Array.isArray(player.teams)) return 'X';

    // Get the most recent team (last in array)
    const latestSeason = player.teams[player.teams.length - 1];
    if (latestSeason?.teams && latestSeason.teams.length > 0) {
      return latestSeason.teams[0].team_name || 'X';
    }
    return 'X';
  };

  const isActive = () => {
    return player.leagues?.standard?.active !== false;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-surface-card shadow-md border border-theme-primary player-card-enhanced h-full flex flex-col">
      <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col h-full">
        <div className="flex flex-col gap-3 sm:gap-4 h-full">
          {/* Header with Avatar, Name, and Status Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Player Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-semantic-info/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-semantic-info" />
                </div>
              </div>

              {/* Player Name and Jersey */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-theme-primary truncate">{getFullName()}</h3>
                <div className="flex items-center gap-1 text-xs text-theme-muted">
                  <span className="font-medium">{getJerseyNumber()}</span>
                  <span>•</span>
                  <span className="font-medium">{getPosition()}</span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isActive()
                    ? 'bg-semantic-success text-text-inverse'
                    : 'bg-theme-muted text-text-inverse'
                }`}
              >
                {isActive() ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Player Stats */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between text-xs text-theme-muted">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{getAge()} years old</span>
              </div>
              <div className="flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                <span>{getHeight()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-theme-muted">
              <div className="flex items-center gap-1">
                <Weight className="w-3 h-3" />
                <span>{getWeight()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>{getExperience()}</span>
              </div>
            </div>
          </div>

          {/* College, Country, and Team */}
          <div className="space-y-1 mb-3 flex-1">
            {player.college && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <GraduationCap className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{player.college}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{getBirthplace()}</span>
            </div>
            {getCurrentTeam() !== 'Free Agent' && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Building2 className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{getCurrentTeam()}</span>
              </div>
            )}
          </div>

          {/* View Player Button */}
          <Button
            onClick={() => (window.location.href = `/sports/nba/players/${player.id}`)}
            variant="default"
            size="sm"
            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white border-brand-primary hover:border-brand-primary-hover shadow-md hover:shadow-lg transition-all duration-200 font-medium text-xs py-1.5"
          >
            View Player
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
