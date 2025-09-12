'use client';

import { BarChart3, Target, Zap, Clock } from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import type { IGameStatsProps } from '@/types';

export function GameStats({ gameStats, loading, error }: IGameStatsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Game Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const isNoDataError = error.includes('No game statistics available');

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Game Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {isNoDataError ? (
              <div className="text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No game statistics available for this game</p>
                <p className="text-sm text-gray-400 mt-1">
                  Statistics may not be available for this game yet
                </p>
              </div>
            ) : (
              <div className="text-red-500">
                <p>Failed to load game statistics</p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gameStats?.response || gameStats.response.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Game Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No game statistics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const teams = gameStats.response;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Game Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {teams.map((team, _index) => {
            const stats = team.statistics[0]; // Get the first (and usually only) stats object
            if (!stats) return null;

            return (
              <div key={team.team.id} className="space-y-4">
                {/* Team Header */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Image
                    src={team.team.logo}
                    alt={`${team.team.name} logo`}
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{team.team.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{team.team.nickname}</p>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Scoring */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Scoring
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Points:</span>
                        <span className="font-medium">{stats.points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FG:</span>
                        <span>
                          {stats.fgm}/{stats.fga} ({stats.fgp}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>3PT:</span>
                        <span>
                          {stats.tpm}/{stats.tpa} ({stats.tpp}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>FT:</span>
                        <span>
                          {stats.ftm}/{stats.fta} ({stats.ftp}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rebounding */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Rebounding
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">{stats.totReb}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Offensive:</span>
                        <span>{stats.offReb}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Defensive:</span>
                        <span>{stats.defReb}</span>
                      </div>
                    </div>
                  </div>

                  {/* Other Stats */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                      Other Stats
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Assists:</span>
                        <span className="font-medium">{stats.assists}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Steals:</span>
                        <span>{stats.steals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blocks:</span>
                        <span>{stats.blocks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Turnovers:</span>
                        <span>{stats.turnovers}</span>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Stats */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Advanced
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Minutes:</span>
                        <span className="font-medium">{stats.min}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>+/-:</span>
                        <span
                          className={
                            parseFloat(stats.plusMinus) >= 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {stats.plusMinus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fouls:</span>
                        <span>{stats.pFouls}</span>
                      </div>
                      {stats.fastBreakPoints !== null && (
                        <div className="flex justify-between">
                          <span>Fast Break:</span>
                          <span>{stats.fastBreakPoints}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
