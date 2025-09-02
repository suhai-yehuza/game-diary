'use client';

import { Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import type { IDbRefreshProgress, IDbRefreshButtonSimpleProps } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

export function DbRefreshButtonSimple({ onProgressChange }: IDbRefreshButtonSimpleProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [_showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState<IDbRefreshProgress>({
    currentStep: 'Initializing...',
    stepNumber: 0,
    totalSteps: 5,
    progress: 0,
    status: 'idle',
    message: 'Ready to start database refresh',
    details: 'Click the refresh button to begin',
  });
  const [isTerminating, setIsTerminating] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setStatus('idle');
    setMessage('');
    setShowProgress(true);

    // Initialize progress
    setProgress({
      currentStep: 'Initializing...',
      stepNumber: 0,
      totalSteps: 5,
      progress: 0,
      status: 'running',
      message: 'Starting database refresh process',
      details: 'Initializing database connection and API client',
      startTime: new Date(),
    });

    try {
      console.log('🔄 Starting database refresh...');

      // Simulate progress updates for each step
      const simulateProgress = async () => {
        // Step 1: Leagues
        setProgress(prev => ({
          ...prev,
          currentStep: 'Processing Leagues',
          stepNumber: 1,
          progress: 20,
          message: 'Fetching and processing leagues data',
          details: 'Retrieving leagues from external API and checking for new entries',
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Seasons
        setProgress(prev => ({
          ...prev,
          currentStep: 'Processing Seasons',
          stepNumber: 2,
          progress: 40,
          message: 'Fetching and processing seasons data',
          details: 'Retrieving seasons from external API and checking for new entries',
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Teams
        setProgress(prev => ({
          ...prev,
          currentStep: 'Processing Teams',
          stepNumber: 3,
          progress: 60,
          message: 'Fetching and processing teams data',
          details: 'Retrieving teams from external API and checking for new entries',
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 4: Games
        setProgress(prev => ({
          ...prev,
          currentStep: 'Processing Games',
          stepNumber: 4,
          progress: 80,
          message: 'Fetching and processing games data',
          details: 'Retrieving games from external API and checking for new entries',
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 5: Players
        setProgress(prev => ({
          ...prev,
          currentStep: 'Processing Players',
          stepNumber: 5,
          progress: 80, // Keep at 80% until actually complete
          message: 'Fetching and processing players data',
          details: 'Retrieving players from external API and checking for new entries',
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      };

      // Start progress simulation
      void simulateProgress();

      const response = await fetch('/api/admin/db-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to refresh database');
      }

      if (result.success) {
        console.log('✅ Database refresh completed:', result.summary);
        setStatus('success');
        setMessage(`Database refresh completed successfully in ${result.duration}!`);

        // Update progress to completed
        setProgress(prev => ({
          ...prev,
          status: 'completed',
          progress: 100, // Set to 100% only when actually completed
          message: 'Database refresh completed successfully!',
          details: `Processed ${result.summary?.newGamesInserted || 0} new games and ${result.summary?.newPlayersInserted || 0} new players`,
        }));

        // Auto-clear success message after 10 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 10000);
      } else {
        throw new Error(result.error || 'Database refresh failed');
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      errorHandlers.api(errorObj, {
        component: 'DbRefreshButtonSimple',
        action: 'handleRefresh',
      });

      setStatus('error');
      setMessage(errorObj.message);
      console.error('❌ Database refresh failed:', errorObj);

      // Update progress to error
      setProgress(prev => ({
        ...prev,
        status: 'error',
        message: 'Database refresh failed',
        details: errorObj.message,
      }));

      // Auto-clear error message after 10 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 10000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTerminate = useCallback(async () => {
    if (!isRefreshing || isTerminating) return;

    setIsTerminating(true);

    try {
      console.log('🛑 Terminating database refresh...');

      const response = await fetch('/api/admin/db-refresh/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to terminate job');
      }

      if (result.success) {
        console.log('✅ Job termination requested successfully');
        setProgress(prev => ({
          ...prev,
          status: 'error',
          message: 'Job termination requested',
          details: 'The database refresh job has been cancelled',
        }));

        // Reset states
        setIsRefreshing(false);
        setStatus('idle');
        setMessage('Job was terminated by user request');

        // Auto-clear message after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        throw new Error(result.error || 'Job termination failed');
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      errorHandlers.api(errorObj, {
        component: 'DbRefreshButtonSimple',
        action: 'handleTerminate',
      });

      console.error('❌ Job termination failed:', errorObj);
      setMessage(`Failed to terminate job: ${errorObj.message}`);
    } finally {
      setIsTerminating(false);
    }
  }, [isRefreshing, isTerminating]);

  // Notify parent component of progress changes
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange({
        isRefreshing,
        progress,
        status,
        message,
        onTerminate: () => void handleTerminate(),
      });
    }
  }, [isRefreshing, progress, status, message, onProgressChange, handleTerminate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Database className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-start">
        <button
          onClick={() => void handleRefresh()}
          disabled={isRefreshing}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              isRefreshing
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 hover:shadow-lg'
            }
          `}
          title="Refresh database with latest external API data (admin only)"
        >
          {isRefreshing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Database className="w-5 h-5" />
          )}
          {isRefreshing ? 'Refreshing...' : 'Refresh Database'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium mb-2">What this does:</h4>
        <ul className="space-y-1 text-sm">
          <li>• Fetches latest data from external APIs (NBA seasons, teams, games, players)</li>
          <li>• Only inserts new data - never overwrites existing entries</li>
          <li>• Updates player team associations for new seasons</li>
          <li>• Safe to run multiple times without data loss</li>
        </ul>
        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This operation may take several minutes depending on the amount of
          new data to fetch and process.
        </div>
      </div>
    </div>
  );
}
