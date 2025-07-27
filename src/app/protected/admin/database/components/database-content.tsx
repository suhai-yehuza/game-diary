'use client';

import {
  Bell,
  Database,
  Heart,
  Loader2,
  MessageSquare,
  Shield,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import { FriendshipsTableWithSearch } from '@/app/protected/admin/database/components/friendships-table';
import { GameRatingsTableWithSearch } from '@/app/protected/admin/database/components/game-ratings-table';
import { NotificationsTableWithSearch } from '@/app/protected/admin/database/components/notifications-table';
import { API_CONFIG } from '@/lib/config/app.config';
import { CommentsTableWithSearch } from '@src/app/protected/admin/database/components/comments-table';
import { GameLogsTableWithSearch } from '@src/app/protected/admin/database/components/game-logs-table';
import { ReactionsTableWithSearch } from '@src/app/protected/admin/database/components/reactions-table';
import { ErrorBoundary } from '@src/app/protected/admin/database/components/ui';
import { Badge } from '@src/app/protected/admin/database/components/ui/badge';
import { Button } from '@src/app/protected/admin/database/components/ui/button';
import { LastUpdated } from '@src/app/protected/admin/database/components/ui/last-updated';
import { UsersTableWithSearch } from '@src/app/protected/admin/database/components/users-table';
// import {
//   formatValue,
//   isRecordArray,
// } from '@src/app/protected/admin/database/components/utils/table-utils';
import type { IApiResponse } from '@src/lib/types';

// Table configurations
const tableConfigs = {
  users: {
    title: 'Users',
    description: 'User accounts and profiles',
    icon: Users,
    endpoint: '/api/admin/database/users',
    fields: ['id', 'username', 'first_name', 'last_name', 'email_address', 'created_at'],
  },
  game_logs: {
    title: 'Game Logs',
    description: 'User game activity and ratings',
    icon: Star,
    endpoint: '/api/admin/database/game_logs',
    fields: ['id', 'user_id', 'game_id', 'rating_for_game', 'classification', 'created_at'],
  },
  game_ratings: {
    title: 'Game Ratings',
    description: 'User-submitted game ratings',
    icon: Star,
    endpoint: '/api/admin/database/game_ratings',
    fields: ['id', 'user_id', 'game_id', 'rating', 'created_at'],
  },
  comments: {
    title: 'Comments',
    description: 'User comments on game logs',
    icon: MessageSquare,
    endpoint: '/api/admin/database/comments',
    fields: ['id', 'user_id', 'game_log_id', 'content', 'created_at'],
  },
  reactions: {
    title: 'Reactions',
    description: 'User reactions to game logs',
    icon: Heart,
    endpoint: '/api/admin/database/reactions',
    fields: ['id', 'user_id', 'target_type', 'target_id', 'emoji', 'created_at'],
  },
  friendships: {
    title: 'Friendships',
    description: 'User friendship connections',
    icon: UserPlus,
    endpoint: '/api/admin/database/friendships',
    fields: ['id', 'user_id', 'friend_id', 'status', 'created_at'],
  },
  notifications: {
    title: 'Notifications',
    description: 'User notification records',
    icon: Bell,
    endpoint: '/api/admin/database/notifications',
    fields: ['id', 'user_id', 'type', 'title', 'read', 'created_at'],
  },
  audit_logs: {
    title: 'Audit Logs',
    description: 'System security and activity logs',
    icon: Shield,
    endpoint: '/api/admin/database/audit_logs',
    fields: [
      'id',
      'timestamp',
      'category',
      'action',
      'severity',
      'user_id',
      'success',
      'description',
    ],
  },
} as const;

export function AdminDatabaseContent() {
  // Remove global event logging that might be interfering
  // useEffect(() => {
  //   function logEvent(e: Event) {
  //     console.log('GLOBAL EVENT:', e.type, e.target);
  //   }
  //   window.addEventListener('click', logEvent, true);
  //   window.addEventListener('submit', logEvent, true);
  //   window.addEventListener('beforeunload', logEvent, true);
  //   return () => {
  //     window.removeEventListener('click', logEvent, true);
  //     window.removeEventListener('submit', logEvent, true);
  //     window.removeEventListener('beforeunload', logEvent, true);
  //   };
  // }, []);
  const searchParams = useSearchParams();
  // const {
  //   error: componentError,
  //   setError: setComponentError,
  //   clearError,
  //   handleAsyncError,
  // } = useErrorHandler();

  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab && tab in tableConfigs ? tab : 'users';
  });

  const [tableData, setTableData] = useState<Record<string, Record<string, unknown>[]>>({});
  const [pagination, setPagination] = useState<
    Record<string, { page: number; limit: number; total: number; pages: number }>
  >({});
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const handleFetch = async (
    tableName: string,
    page = 1,
    limit = API_CONFIG.pagination.DEFAULT_PAGE_SIZE
  ) => {
    setLoading(prev => ({ ...prev, [tableName]: true }));
    setError(prev => ({ ...prev, [tableName]: '' }));

    try {
      const config = tableConfigs[tableName as keyof typeof tableConfigs];
      const response = await fetch(`${config.endpoint}?page=${page}&limit=${limit}`);
      const data = (await response.json()) as IApiResponse;

      if (data.success && data.data) {
        setTableData(prev => ({ ...prev, [tableName]: data.data as Record<string, unknown>[] }));
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            [tableName]: data.pagination as {
              page: number;
              limit: number;
              total: number;
              pages: number;
            },
          }));
        }
        setCurrentPage(prev => ({ ...prev, [tableName]: page }));
      } else {
        setError(prev => ({ ...prev, [tableName]: data.error ?? 'Failed to fetch data' }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(prev => ({ ...prev, [tableName]: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, [tableName]: false }));
    }
  };

  // Auto-fetch for reactions tab
  useEffect(() => {
    if (activeTab === 'reactions') {
      void handleFetch('reactions', 1, API_CONFIG.pagination.DEFAULT_PAGE_SIZE);
    }
  }, [activeTab]);

  const formatValue = (value: unknown, _field: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object' && value !== null) {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Object]';
      }
    }
    // At this point, value should be a primitive that can be safely converted
    if (typeof value === 'object' && value !== null) {
      return '[Object]';
    }
    // Safe to convert primitive values
    return String(value as string | number | boolean | symbol | bigint);
  };

  const renderTable = (tableName: string) => {
    const config = tableConfigs[tableName as keyof typeof tableConfigs];
    const tableDataForTable = tableData[tableName] || [];
    const tablePagination = pagination[tableName];
    const currentTablePage = currentPage[tableName] || 1;

    const handlePageChange = (newPage: number) => {
      void handleFetch(tableName, newPage, API_CONFIG.pagination.DEFAULT_PAGE_SIZE);
    };

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <config.icon className="h-5 w-5" />
              <div>
                <CardTitle>{config.title}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </div>
            </div>
            <Button
              onClick={() =>
                void handleFetch(tableName, 1, API_CONFIG.pagination.DEFAULT_PAGE_SIZE)
              }
              disabled={loading[tableName]}
              size="sm"
              className="bg-rose-100 text-rose-900 border border-rose-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-rose-200 active:shadow focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-700 dark:hover:bg-rose-800"
            >
              {loading[tableName] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Fetch Data'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error[tableName] && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error[tableName]}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {tablePagination
                    ? `${tablePagination.total} total records`
                    : `${tableDataForTable.length} records`}
                </Badge>
                <LastUpdated />
              </div>
              {tablePagination && (
                <div className="text-sm text-muted-foreground">
                  Page {currentTablePage} of {tablePagination.pages}
                </div>
              )}
            </div>

            <div className="h-96 w-full border rounded-md">
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {config.fields.map(field => (
                          <th key={field} className="text-left p-2 font-medium">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableDataForTable.length === 0 ? (
                        <tr>
                          <td
                            colSpan={config.fields.length}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>
                              No data loaded. Click &quot;Fetch Data&quot; to load{' '}
                              {config.title.toLowerCase()}.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        tableDataForTable.map((row, index) => (
                          <tr
                            key={
                              typeof row.id === 'string' || typeof row.id === 'number'
                                ? String(row.id)
                                : String(index)
                            }
                            className="border-b hover:bg-gray-50"
                          >
                            {config.fields.map(field => (
                              <td key={field} className="p-2 text-xs">
                                <div
                                  className="max-w-32 truncate"
                                  title={formatValue(row[field], field)}
                                >
                                  {formatValue(row[field], field)}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {tablePagination && tablePagination.pages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button
                      onClick={() => handlePageChange(currentTablePage - 1)}
                      disabled={currentTablePage <= 1 || loading[tableName]}
                      size="sm"
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentTablePage} of {tablePagination.pages}
                    </span>
                    <Button
                      onClick={() => handlePageChange(currentTablePage + 1)}
                      disabled={currentTablePage >= tablePagination.pages || loading[tableName]}
                      size="sm"
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ErrorBoundary componentName="AdminDatabaseContent">
      <div className="container mx-auto p-6 h-full flex flex-col">
        <div className="space-y-2 flex-shrink-0 mb-4">
          <h1 className="text-2xl font-bold">Database Management</h1>
          <p className="text-muted-foreground">
            View and manage database tables. This page allows you to fetch and display data from
            various tables in the system.
          </p>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="flex flex-col md:flex-row w-full md:space-x-3 space-y-2 md:space-y-0 bg-transparent p-0 border-0 mb-4">
            {Object.entries(tableConfigs).map(([key, config]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex-1 flex items-center gap-2 min-w-0 truncate justify-center px-5 py-2 mx-0 md:mx-1 rounded-md border transition-all duration-200
            bg-gray-200 text-gray-800 border-gray-300 shadow-sm
            dark:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-600
            hover:bg-gray-300 hover:text-blue-900 dark:hover:bg-neutral-600 dark:hover:text-blue-200
            data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900 data-[state=active]:border-blue-400 data-[state=active]:shadow-md
            dark:data-[state=active]:bg-blue-800 dark:data-[state=active]:text-blue-100 dark:data-[state=active]:border-blue-700 dark:data-[state=active]:shadow-md"
              >
                <config.icon className="h-4 w-4" />
                <span className="hidden sm:inline truncate">{config.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(tableConfigs).map(tableName => (
            <TabsContent
              key={tableName}
              value={tableName}
              className="flex-1 flex flex-col min-h-0 mt-4"
            >
              <ErrorBoundary componentName={`${tableName}Table`}>
                <div style={{ display: activeTab === 'users' ? 'block' : 'none' }}>
                  <UsersTableWithSearch />
                </div>
                <div style={{ display: activeTab === 'game_logs' ? 'block' : 'none' }}>
                  <GameLogsTableWithSearch />
                </div>
                <div style={{ display: activeTab === 'comments' ? 'block' : 'none' }}>
                  <CommentsTableWithSearch />
                </div>
                <div style={{ display: activeTab === 'reactions' ? 'block' : 'none' }}>
                  <ReactionsTableWithSearch />
                </div>
                <div style={{ display: activeTab === 'friendships' ? 'block' : 'none' }}>
                  <FriendshipsTableWithSearch />
                </div>
                <div style={{ display: activeTab === 'notifications' ? 'block' : 'none' }}>
                  <NotificationsTableWithSearch />
                </div>
                <div style={{ display: activeTab === 'game_ratings' ? 'block' : 'none' }}>
                  <GameRatingsTableWithSearch />
                </div>
                <div
                  style={{
                    display: ![
                      'users',
                      'game_logs',
                      'comments',
                      'reactions',
                      'friendships',
                      'notifications',
                      'game_ratings',
                    ].includes(activeTab)
                      ? 'block'
                      : 'none',
                  }}
                >
                  {renderTable(tableName)}
                </div>
              </ErrorBoundary>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
