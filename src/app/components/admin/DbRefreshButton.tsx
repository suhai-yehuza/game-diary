'use client';

import { Database, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { DbRefreshProgressTracker } from '@/app/components/db-refresh/DbRefreshProgressTracker';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { IDbRefreshProgress } from '@/types';

export function DbRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, _setProgress] = useState<IDbRefreshProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setError(null);
    setShowProgress(true);

    try {
      console.log('🔄 Starting database refresh...');

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
        // Progress tracker will show completion and auto-hide
      } else {
        throw new Error(result.error || 'Database refresh failed');
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      errorHandlers.api(errorObj, {
        component: 'DbRefreshButton',
        action: 'handleRefresh',
      });

      setError(errorObj.message);
      console.error('❌ Database refresh failed:', errorObj);

      // Hide progress tracker on error
      setTimeout(() => {
        setShowProgress(false);
      }, 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleProgressComplete = () => {
    setShowProgress(false);
  };

  return (
    <>
      <button
        onClick={() => void handleRefresh()}
        disabled={isRefreshing}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
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
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Database className="w-4 h-4" />
        )}
        {isRefreshing ? 'Refreshing...' : 'Refresh DB'}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          Error: {error}
        </div>
      )}

      <DbRefreshProgressTracker
        progress={progress}
        isVisible={showProgress}
        onComplete={handleProgressComplete}
      />
    </>
  );
}
