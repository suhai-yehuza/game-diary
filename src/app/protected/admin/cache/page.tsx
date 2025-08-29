'use client';

import { useEffect, useState } from 'react';

import { useCacheStats } from '@/hooks/use-cache';
import { CacheNamespace } from '@/lib/types';
import { errorHandlers, ErrorHandler } from '@/lib/utils/error-handler';

export default function CacheManagementPage() {
  const { stats, loading, error, fetchStats, testConnection } = useCacheStats();
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [selectedNamespace, setSelectedNamespace] = useState<CacheNamespace>(CacheNamespace.SYSTEM);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const handleTestConnection = async () => {
    const isConnected = await testConnection();
    setConnectionStatus(isConnected);
  };

  const handleClearNamespace = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clearNamespace',
          namespace: selectedNamespace,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(`Cache namespace '${selectedNamespace}' cleared successfully`);
          void fetchStats(); // Refresh stats
        } else {
          alert(`Error: ${result.error}`);
        }
      } else {
        alert('Failed to clear cache namespace');
      }
    } catch (error) {
      const errorContext = errorHandlers.api(
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'Cache Management Page',
          action: 'Clear Namespace',
        }
      );
      const errorMessage = ErrorHandler.getInstance().createUserMessage(
        error instanceof Error ? error : new Error(String(error)),
        errorContext
      );
      alert(`Error clearing cache namespace: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all cache? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('All cache cleared successfully');
          void fetchStats(); // Refresh stats
        } else {
          alert(`Error: ${result.error}`);
        }
      } else {
        alert('Failed to clear all cache');
      }
    } catch (error) {
      const errorContext = errorHandlers.api(
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'Cache Management Page',
          action: 'Clear All Cache',
        }
      );
      const errorMessage = ErrorHandler.getInstance().createUserMessage(
        error instanceof Error ? error : new Error(String(error)),
        errorContext
      );
      alert(`Error clearing all cache: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cache Management</h1>

      {/* Cache Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Cache Statistics</h2>

        {loading ? (
          <p>Loading cache statistics...</p>
        ) : error ? (
          <p className="text-red-600">Error loading cache statistics: {error}</p>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700">Memory Cache</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.memorySize} entries</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700">Redis Status</h3>
              <p
                className={`text-2xl font-bold ${stats.redisAvailable ? 'text-green-600' : 'text-red-600'}`}
              >
                {stats.redisAvailable ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        ) : (
          <p>No cache statistics available</p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => void fetchStats()}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Refresh Stats
          </button>
          <button
            onClick={() => void handleTestConnection()}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Connection
          </button>
        </div>

        {connectionStatus !== null && (
          <div
            className={`mt-2 p-2 rounded ${connectionStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            Connection test: {connectionStatus ? 'Success' : 'Failed'}
          </div>
        )}
      </div>

      {/* Cache Management */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Cache Management</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="namespace" className="block text-sm font-medium text-gray-700 mb-2">
              Select Namespace
            </label>
            <select
              id="namespace"
              value={selectedNamespace}
              onChange={e => setSelectedNamespace(e.target.value as CacheNamespace)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(CacheNamespace).map(namespace => (
                <option key={namespace} value={namespace}>
                  {namespace}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => void handleClearNamespace()}
              disabled={actionLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
            >
              Clear {selectedNamespace} Namespace
            </button>
            <button
              onClick={() => void handleClearAll()}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Clear All Cache
            </button>
          </div>
        </div>
      </div>

      {/* Hybrid Cache Management */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Hybrid Cache Management</h2>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Hybrid Caching Strategy</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              <strong>NBA Data (Games, Teams, Players, Seasons):</strong> External API + Redis
              (30min), DB fallback (1hour)
            </p>
            <p>
              <strong>Other Data (Users, Game Logs, Comments, etc.):</strong> DB + Redis (15min)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                void (async () => {
                  const response = await fetch('/api/cache/hybrid?action=test');
                  const result = await response.json();
                  if (result.success) {
                    alert('Hybrid cache test completed successfully');
                  } else {
                    alert('Hybrid cache test failed');
                  }
                })().catch(error => {
                  const errorContext = errorHandlers.api(
                    error instanceof Error ? error : new Error(String(error)),
                    {
                      component: 'Cache Management Page',
                      action: 'Test Hybrid Cache',
                    }
                  );
                  const errorMessage = ErrorHandler.getInstance().createUserMessage(
                    error instanceof Error ? error : new Error(String(error)),
                    errorContext
                  );
                  alert(`Error testing hybrid cache: ${errorMessage}`);
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Hybrid Cache
            </button>
            <button
              onClick={() => {
                void (async () => {
                  const response = await fetch('/api/cache/hybrid?action=strategy');
                  const result = await response.json();
                  if (result.success) {
                    console.log('Hybrid cache strategy:', result.data);
                    alert('Hybrid cache strategy details logged to console');
                  } else {
                    alert('Failed to get hybrid cache strategy');
                  }
                })().catch(error => {
                  const errorContext = errorHandlers.api(
                    error instanceof Error ? error : new Error(String(error)),
                    {
                      component: 'Cache Management Page',
                      action: 'View Strategy',
                    }
                  );
                  const errorMessage = ErrorHandler.getInstance().createUserMessage(
                    error instanceof Error ? error : new Error(String(error)),
                    errorContext
                  );
                  alert(`Error getting hybrid cache strategy: ${errorMessage}`);
                });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              View Strategy
            </button>
            <button
              onClick={() => {
                void (async () => {
                  if (confirm('Are you sure you want to clear all hybrid cache?')) {
                    const response = await fetch('/api/cache/hybrid', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'clear' }),
                    });
                    const result = await response.json();
                    if (result.success) {
                      alert('Hybrid cache cleared successfully');
                    } else {
                      alert('Failed to clear hybrid cache');
                    }
                  }
                })().catch(error => {
                  const errorContext = errorHandlers.api(
                    error instanceof Error ? error : new Error(String(error)),
                    {
                      component: 'Cache Management Page',
                      action: 'Clear Hybrid Cache',
                    }
                  );
                  const errorMessage = ErrorHandler.getInstance().createUserMessage(
                    error instanceof Error ? error : new Error(String(error)),
                    errorContext
                  );
                  alert(`Error clearing hybrid cache: ${errorMessage}`);
                });
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Hybrid Cache
            </button>
          </div>
        </div>
      </div>

      {/* Database Cache Management */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Database Cache Management</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                void (async () => {
                  const response = await fetch('/api/cache/db?action=test');
                  const result = await response.json();
                  if (result.success) {
                    alert('Database cache test completed successfully');
                  } else {
                    alert('Database cache test failed');
                  }
                })().catch(error => {
                  const errorContext = errorHandlers.api(
                    error instanceof Error ? error : new Error(String(error)),
                    {
                      component: 'Cache Management Page',
                      action: 'Test Database Cache',
                    }
                  );
                  const errorMessage = ErrorHandler.getInstance().createUserMessage(
                    error instanceof Error ? error : new Error(String(error)),
                    errorContext
                  );
                  alert(`Error testing database cache: ${errorMessage}`);
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Database Cache
            </button>
            <button
              onClick={() => {
                void (async () => {
                  if (confirm('Are you sure you want to clear all database cache?')) {
                    const response = await fetch('/api/cache/db', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'clear' }),
                    });
                    const result = await response.json();
                    if (result.success) {
                      alert('Database cache cleared successfully');
                    } else {
                      alert('Failed to clear database cache');
                    }
                  }
                })().catch(error => {
                  const errorContext = errorHandlers.api(
                    error instanceof Error ? error : new Error(String(error)),
                    {
                      component: 'Cache Management Page',
                      action: 'Clear Database Cache',
                    }
                  );
                  const errorMessage = ErrorHandler.getInstance().createUserMessage(
                    error instanceof Error ? error : new Error(String(error)),
                    errorContext
                  );
                  alert(`Error clearing database cache: ${errorMessage}`);
                });
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Database Cache
            </button>
          </div>
        </div>
      </div>

      {/* Cache Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Cache Information</h2>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>API Responses:</strong> Cached for 15 minutes (Redis) / 5 minutes (Memory)
          </p>
          <p>
            <strong>User Sessions:</strong> Cached for 1 hour (Redis) / 15 minutes (Memory)
          </p>
          <p>
            <strong>Game Data:</strong> Cached for 1 hour (Redis) / 15 minutes (Memory)
          </p>
          <p>
            <strong>Team Data:</strong> Cached for 1 hour (Redis) / 15 minutes (Memory)
          </p>
          <p>
            <strong>Player Data:</strong> Cached for 1 hour (Redis) / 15 minutes (Memory)
          </p>
          <p>
            <strong>Search Results:</strong> Cached for 5 minutes (Redis) / 2 minutes (Memory)
          </p>
          <p>
            <strong>Analytics:</strong> Cached for 24 hours (Redis) / 1 hour (Memory)
          </p>
          <p>
            <strong>System:</strong> Cached for 15 minutes (Redis) / 5 minutes (Memory)
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="font-semibold text-gray-800">Hybrid Cache Strategy:</p>
            <div className="space-y-2">
              <div>
                <p className="font-medium text-blue-800">
                  NBA Data (External API + Redis, DB Fallback):
                </p>
                <p>
                  <strong>Games:</strong> 30 minutes (API), 1 hour (DB fallback)
                </p>
                <p>
                  <strong>Teams:</strong> 30 minutes (API), 1 hour (DB fallback)
                </p>
                <p>
                  <strong>Players:</strong> 30 minutes (API), 1 hour (DB fallback)
                </p>
                <p>
                  <strong>Seasons:</strong> 30 minutes (API), 1 hour (DB fallback)
                </p>
              </div>
              <div>
                <p className="font-medium text-green-800">Database Data (DB + Redis only):</p>
                <p>
                  <strong>Users:</strong> 15 minutes (High Priority)
                </p>
                <p>
                  <strong>Game Logs:</strong> 10 minutes (Medium Priority)
                </p>
                <p>
                  <strong>Comments:</strong> 10 minutes (Medium Priority)
                </p>
                <p>
                  <strong>Friendships:</strong> 15 minutes (Medium Priority)
                </p>
                <p>
                  <strong>Search:</strong> 5 minutes (Low Priority)
                </p>
                <p>
                  <strong>Analytics:</strong> 1 hour (Critical Priority)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
