'use client';

import { CheckCircle, Loader2, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { IDbRefreshProgress, IDbRefreshProgressTrackerProps } from '@/lib/types';

export function DbRefreshProgressTracker({
  isVisible,
  onComplete,
  progress: externalProgress,
  onTerminate,
  isTerminating,
}: IDbRefreshProgressTrackerProps) {
  const [internalProgress, _setInternalProgress] = useState<IDbRefreshProgress>({
    currentStep: 'Initializing...',
    stepNumber: 0,
    totalSteps: 5,
    progress: 0,
    status: 'idle',
    message: 'Ready to start database refresh',
    details: 'Click the refresh button to begin',
  });

  // Use external progress if provided, otherwise use internal
  const progress = externalProgress || internalProgress;

  const [isCompleted, setIsCompleted] = useState(false);
  const [hideTimer, setHideTimer] = useState<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Reset completion state when visibility changes
  useEffect(() => {
    if (isVisible && isCompleted) {
      setIsCompleted(false);
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
        console.log('⏰ Auto-hiding DB refresh progress tracker after 10 seconds');
        onComplete();
      }, 10000);
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

  // Update current time every second for real-time elapsed time
  useEffect(() => {
    if (!isVisible || progress.status !== 'running') return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, progress.status]);

  // Don't show during E2E tests to avoid interfering with interactions
  const isE2ETest =
    typeof window !== 'undefined' &&
    (window.__PLAYWRIGHT_TEST__ || window.location.search.includes('playwright'));

  if (!isVisible || isE2ETest) {
    return null;
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'running':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Database className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'running':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  const formatDuration = (startTime?: Date) => {
    if (!startTime) return '';
    const duration = currentTime - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800/95 backdrop-blur-sm text-white p-6 rounded-xl text-sm font-medium z-[9998] w-96 border border-gray-700/50 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <span className="font-semibold">Database Refresh Progress</span>
        </div>
        {getStatusIcon()}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-300 mb-2">
          <span>
            Step {progress.stepNumber} of {progress.totalSteps}
          </span>
          <span>{progress.status === 'completed' ? 100 : Math.round(progress.progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress.status === 'completed' ? 100 : progress.progress}%`,
            }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="mb-4">
        <h4 className="font-medium text-white mb-2">Current Operation</h4>
        <div className="text-gray-300 text-sm">{progress.currentStep}</div>
      </div>

      {/* Status Message */}
      <div className="mb-4">
        <h4 className="font-medium text-white mb-2">Status</h4>
        <div className="text-gray-300 text-sm">{progress.message}</div>
      </div>

      {/* Details */}
      {progress.details && (
        <div className="mb-4">
          <h4 className="font-medium text-white mb-2">Details</h4>
          <div className="text-gray-300 text-sm">{progress.details}</div>
        </div>
      )}

      {/* Timing Information */}
      {progress.startTime && (
        <div className="mb-4">
          <h4 className="font-medium text-white mb-2">Timing</h4>
          <div className="text-gray-300 text-sm">
            <div>Elapsed: {formatDuration(progress.startTime)}</div>
            {progress.estimatedTimeRemaining && (
              <div>Estimated remaining: {progress.estimatedTimeRemaining}</div>
            )}
          </div>
        </div>
      )}

      {/* Step Breakdown */}
      <div className="mb-4">
        <h4 className="font-medium text-white mb-2">Steps</h4>
        <div className="space-y-2">
          {[
            { name: 'Leagues', step: 1 },
            { name: 'Seasons', step: 2 },
            { name: 'Teams', step: 3 },
            { name: 'Games', step: 4 },
            { name: 'Players', step: 5 },
          ].map(step => (
            <div key={step.step} className="flex items-center gap-2">
              {progress.stepNumber > step.step ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : progress.stepNumber === step.step ? (
                progress.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )
              ) : (
                <div className="w-4 h-4 bg-gray-500 rounded-full" />
              )}
              <span
                className={`text-sm ${progress.stepNumber >= step.step ? 'text-white' : 'text-gray-500'}`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Footer */}
      <div className={`mt-4 pt-3 border-t border-gray-700 rounded-lg p-3 ${getStatusColor()}`}>
        <div className="text-center">
          {progress.status === 'running' && (
            <div className="text-blue-700 dark:text-blue-300 text-xs">
              Database refresh in progress...
            </div>
          )}
          {progress.status === 'completed' && (
            <div className="text-green-700 dark:text-green-300 text-xs">
              Database refresh completed successfully!
            </div>
          )}
          {progress.status === 'error' && (
            <div className="text-red-700 dark:text-red-300 text-xs">
              Error occurred during refresh
            </div>
          )}
        </div>

        {/* Terminate Button - Only visible when job is running */}
        {progress.status === 'running' && onTerminate && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <button
              onClick={onTerminate}
              disabled={isTerminating}
              className={`
                w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  isTerminating
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 hover:shadow-lg'
                }
              `}
              title="Terminate the running database refresh job"
            >
              {isTerminating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {isTerminating ? 'Terminating...' : 'Terminate Job'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
