'use client';

import { useUser } from '@clerk/nextjs';
import { Database, Shield } from 'lucide-react';

import { DbRefreshButton } from './DbRefreshButton';

// Hook to check if user is admin
function useIsAdmin() {
  const userData = useUser();

  // Handle case where Clerk is not configured (e.g., in test environment)
  if (!userData.isLoaded) {
    return false;
  }

  if (!userData.isSignedIn || !userData.user) {
    return false;
  }

  // Check if user has admin role in their public metadata
  const userRoles = (userData.user.publicMetadata?.role as string[]) || [];
  return userRoles.includes('admin') || userRoles.includes('Admin');
}

export function AdminDbRefreshSection() {
  const isAdmin = useIsAdmin();

  // Don't render if user is not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-lg font-semibold text-purple-800 dark:text-purple-200">
            Admin Panel
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-md font-medium text-purple-700 dark:text-purple-300 mb-2">
            Database Management
          </h3>
          <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
            Refresh the database with the latest data from external APIs. This operation only adds
            new data without overwriting existing entries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <DbRefreshButton />
        </div>

        <div className="text-xs text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded px-3 py-2">
          <strong>Note:</strong> This operation may take several minutes depending on the amount of
          new data to fetch and process.
        </div>
      </div>
    </div>
  );
}
