import { formatDistanceToNow, isWithinInterval, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useMemo } from 'react';

import { ActivityTimelineProps, TimeFilter, ActivityType } from '@/lib/types/activity.types';

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ gameLogs }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [activityType, setActivityType] = useState<ActivityType>('all');
  const [teamFilter, setTeamFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const getActivityType = (log: ActivityTimelineProps['gameLogs'][0]): ActivityType => {
    if (log.watchedSetting === 'replay') {
      return 'replay';
    }
    if (log.rating && log.rating >= 4) {
      return 'favorite';
    }
    if (log.notes) {
      return 'note';
    }
    return 'watch';
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'replay':
        return '🔄';
      case 'favorite':
        return '⭐';
      case 'note':
        return '📝';
      default:
        return '👀';
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'replay':
        return 'bg-purple-100 text-purple-800';
      case 'favorite':
        return 'bg-yellow-100 text-yellow-800';
      case 'note':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getTimeInterval = (filter: TimeFilter) => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return { start: subDays(now, 1), end: now };
      case 'week':
        return { start: subDays(now, 7), end: now };
      case 'month':
        return { start: subDays(now, 30), end: now };
      default:
        return null;
    }
  };

  const filteredLogs = useMemo(() => {
    let filtered = [...gameLogs];

    // Apply time filter
    if (timeFilter !== 'all') {
      const interval = getTimeInterval(timeFilter);
      if (interval) {
        filtered = filtered.filter(log => isWithinInterval(new Date(log.created_at), interval));
      }
    }

    // Apply activity type filter
    if (activityType !== 'all') {
      filtered = filtered.filter(log => getActivityType(log) === activityType);
    }

    // Apply team filter
    if (teamFilter) {
      filtered = filtered.filter(
        log =>
          log.game.teams.visitors.name.toLowerCase().includes(teamFilter.toLowerCase()) ||
          log.game.teams.home.name.toLowerCase().includes(teamFilter.toLowerCase())
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [gameLogs, timeFilter, activityType, teamFilter]);

  const uniqueTeams = useMemo(() => {
    const teams = new Set<string>();
    gameLogs.forEach((log: ActivityTimelineProps['gameLogs'][0]) => {
      teams.add(log.game.teams.visitors.name);
      teams.add(log.game.teams.home.name);
    });
    return Array.from(teams).sort();
  }, [gameLogs]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white rounded-lg p-4 shadow mb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                <select
                  value={timeFilter}
                  onChange={e => setTimeFilter(e.target.value as TimeFilter)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type
                </label>
                <select
                  value={activityType}
                  onChange={e => setActivityType(e.target.value as ActivityType)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Activities</option>
                  <option value="replay">Replays</option>
                  <option value="favorite">Favorites</option>
                  <option value="note">Notes</option>
                  <option value="watch">Watches</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Filter</label>
                <select
                  value={teamFilter}
                  onChange={e => setTeamFilter(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Teams</option>
                  {uniqueTeams.map(team => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-6">
          <AnimatePresence>
            {filteredLogs.map((log, index) => {
              const activityType = getActivityType(log);
              const icon = getActivityIcon(activityType);
              const colorClass = getActivityColor(activityType);

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    <span className="text-lg">{icon}</span>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-sm ${colorClass}`}>
                          {activityType.charAt(0).toUpperCase() + activityType.slice(1)}
                        </span>
                        <h4 className="mt-2 font-medium">
                          {log.game.teams.visitors.name} vs {log.game.teams.home.name}
                        </h4>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Season: {log.game.season}</span>
                        {log.rating && <span>Rating: {log.rating}/5</span>}
                        {log.watchedSetting === 'replay' && <span>Replayed</span>}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{log.notes}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No activities found matching the current filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
