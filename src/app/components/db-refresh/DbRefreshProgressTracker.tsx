'use client';

import { CheckCircle, Loader2, RefreshCw, Database } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { IDbRefreshJob, IDbRefreshProgressTrackerProps } from '@/types';

export function DbRefreshProgressTracker({
  isVisible,
  onComplete,
}: IDbRefreshProgressTrackerProps) {
  const [jobs] = useState<IDbRefreshJob[]>([
    { id: 'leagues', name: 'Leagues', status: 'idle', progress: 0, message: 'Waiting to start' },
    { id: 'seasons', name: 'Seasons', status: 'idle', progress: 0, message: 'Waiting to start' },
    { id: 'teams', name: 'Teams', status: 'idle', progress: 0, message: 'Waiting to start' },
    { id: 'games', name: 'Games', status: 'idle', progress: 0, message: 'Waiting to start' },
    { id: 'players', name: 'Players', status: 'idle', progress: 0, message: 'Waiting to start' },
  ]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [_completionLogged, _setCompletionLogged] = useState(false);
  const [hideTimer, setHideTimer] = useState<NodeJS.Timeout | null>(null);

  // Reset completion state when visibility changes
  useEffect(() => {
    if (isVisible && isCompleted) {
      setIsCompleted(false);
      _setCompletionLogged(false);
      if (hideTimer) {
        clearTimeout(hideTimer);
        setHideTimer(null);
      }
    }
  }, [isVisible, isCompleted, hideTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, [hideTimer]);

  // Handle completion callback
  useEffect(() => {
    if (isCompleted && onComplete && !hideTimer) {
      const timer = setTimeout(() => {
        console.log('⏰ Auto-hiding DB refresh progress tracker after 5 seconds');
        onComplete();
      }, 5000);
      setHideTimer(timer);
    }
  }, [onComplete, hideTimer, isCompleted]);

  // Auto-hide when not visible
  useEffect(() => {
    if (!isVisible && hideTimer) {
      clearTimeout(hideTimer);
      setHideTimer(null);
    }
  }, [isVisible, hideTimer]);

  // Don't show during E2E tests to avoid interfering with interactions
  const isE2ETest =
    typeof window !== 'undefined' &&
    (window.__PLAYWRIGHT_TEST__ || window.location.search.includes('playwright'));

  if (!isVisible || isE2ETest) {
    return null;
  }

  const allCompleted = jobs.every(job => job.status === 'completed');
  const hasErrors = jobs.some(job => job.status === 'error');
  const isInProgress = jobs.some(job => job.status === 'running');

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800/95 backdrop-blur-sm text-white p-6 rounded-xl text-sm font-medium z-[9998] w-80 border border-gray-700/50 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <span className="font-semibold">Database Refresh</span>
        </div>
        {isInProgress && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
        {allCompleted && !hasErrors && <CheckCircle className="w-5 h-5 text-green-400" />}
        {hasErrors && <RefreshCw className="w-4 h-4 text-red-400" />}
      </div>

      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.id} className="flex items-center justify-between">
            <span className="text-gray-300">{job.name}</span>
            <div className="flex items-center gap-2">
              {job.status === 'idle' && <div className="w-3 h-3 bg-gray-500 rounded-full" />}
              {job.status === 'running' && (
                <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
              )}
              {job.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {job.status === 'error' && <div className="w-3 h-3 bg-red-500 rounded-full" />}
            </div>
          </div>
        ))}
      </div>

      {isInProgress && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            Refreshing database with latest data...
          </div>
        </div>
      )}

      {allCompleted && !hasErrors && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="text-xs text-green-400 text-center">
            Database refresh completed successfully!
          </div>
        </div>
      )}

      {hasErrors && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="text-xs text-red-400 text-center">
            Some errors occurred during refresh
          </div>
        </div>
      )}
    </div>
  );
}
