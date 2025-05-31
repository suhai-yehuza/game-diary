'use client';

import React, { useState, useEffect } from 'react';

import { GamesList, GameStats } from '@/components/features/games';
import { MobileNav } from '@/components/layout';
import { GAME_STATUS_VALUES } from '@/lib/types/config.types';

export default function NBAPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);
    // Update width on resize
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'games', label: 'Games', icon: '🏀' },
    { id: 'players', label: 'Players', icon: '👥' },
    { id: 'teams', label: 'Teams', icon: '🏆' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Mobile Tabs */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold">NBA Analytics Dashboard</h1>
          <div className="hidden lg:flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Export All Data
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Overview Section */}
          {(activeTab === 'overview' || (windowWidth !== null && windowWidth >= 1024)) && (
            <>
              {/* Standings Section */}
              <section className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl lg:text-2xl font-semibold">Conference Standings</h2>
                  <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                    Export
                  </button>
                </div>
              </section>

              {/* Recent Games Section */}
              <section className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl lg:text-2xl font-semibold">Recent Games</h2>
                  <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                    Export
                  </button>
                </div>
                <GamesList
                  games={[]}
                  initialFilters={{
                    season: 2024,
                    status: GAME_STATUS_VALUES.FINISHED,
                  }}
                />
              </section>
            </>
          )}

          {/* Games Section */}
          {(activeTab === 'games' || (windowWidth !== null && windowWidth >= 1024)) && (
            <section className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold">Game Statistics</h2>
                <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                  Export
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GameStats
                  game={{
                    id: '123',
                    league: 'NBA',
                    season: 2024,
                    date: {
                      start: new Date('2024-03-20'),
                      end: new Date('2024-03-20'),
                      duration: '2:00',
                    },
                    stage: 1,
                    status: {
                      long: 'Final',
                      short: GAME_STATUS_VALUES.FINISHED,
                      clock: null,
                      halftime: false,
                    },
                    periods: { current: 4, total: 4, endOfPeriod: true },
                    arena: {
                      name: 'Test Arena, Test City, TS, USA',
                      city: 'Test City',
                      state: 'TS',
                      country: 'USA',
                    },
                    teams: {
                      visitors: {
                        id: '1',
                        name: 'Los Angeles Lakers',
                        nickname: 'Lakers',
                        code: 'LAL',
                        logo: '/logos/lakers.svg',
                      },
                      home: {
                        id: '2',
                        name: 'Boston Celtics',
                        nickname: 'Celtics',
                        code: 'BOS',
                        logo: '/logos/celtics.svg',
                      },
                    },
                    scores: {
                      visitors: {
                        linescore: ['25', '30', '25', '20'],
                        points: 100,
                        win: 45,
                        loss: 20,
                        series: { win: 2, loss: 1 },
                      },
                      home: {
                        linescore: ['28', '22', '25', '20'],
                        points: 95,
                        win: 42,
                        loss: 23,
                        series: { win: 1, loss: 2 },
                      },
                    },
                    officials: [],
                    timesTied: 5,
                    leadChanges: 8,
                    nugget: '',
                    statistics: [],
                    awayTeamId: '1',
                    homeTeamId: '2',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isCompleted: true,
                    awayScore: 100,
                    homeScore: 95,
                    gameType: 'Regular Season',
                    nbaGameId: '123',
                  }}
                />
              </div>
            </section>
          )}

          {/* Players Section */}
          {(activeTab === 'players' || (windowWidth !== null && windowWidth >= 1024)) && (
            <section className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold">Top Players</h2>
                <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                  Export
                </button>
              </div>
            </section>
          )}

          {/* Teams Section */}
          {(activeTab === 'teams' || (windowWidth !== null && windowWidth >= 1024)) && (
            <section className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold">Teams</h2>
                <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                  Export
                </button>
              </div>
            </section>
          )}

          {/* Analytics Section */}
          {(activeTab === 'analytics' || (windowWidth !== null && windowWidth >= 1024)) && (
            <>
              {/* Player Trends Section */}
              <section className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl lg:text-2xl font-semibold">Player Performance Trends</h2>
                  <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                    Export
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </>
  );
}
