'use client';

import { Bell, Database, Heart, Loader2, MessageSquare, Star, UserPlus, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

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
import { useCentralizedErrorHandler } from '@/hooks/use-centralized-error-handler';
import { API_CONFIG } from '@/lib/config/app.config';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { IApiResponse } from '@/types';
import { CommentsTableWithSearch } from '@src/app/protected/admin/database/components/comments-table';
import { GameLogsTableWithSearch } from '@src/app/protected/admin/database/components/game-logs-table';
import { PublicCommentsTableWithSearch } from '@src/app/protected/admin/database/components/public-comments-table';
import { PublicReactionsTableWithSearch } from '@src/app/protected/admin/database/components/public-reactions-table';
import { ReactionsTableWithSearch } from '@src/app/protected/admin/database/components/reactions-table';
import { ErrorBoundary } from '@src/app/protected/admin/database/components/ui';
import { Badge } from '@src/app/protected/admin/database/components/ui/badge';
import { Button } from '@src/app/protected/admin/database/components/ui/button';
import { LastUpdated } from '@src/app/protected/admin/database/components/ui/last-updated';
import { UsersTableWithSearch } from '@src/app/protected/admin/database/components/users-table';

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
  public_comments: {
    title: 'Public Comments',
    description: 'Public comments on NBA games, players, and teams',
    icon: MessageSquare,
    endpoint: '/api/admin/database/public_comments',
    fields: [
      'id',
      'user_id',
      'anonymous_name',
      'parent_id',
      'parent_type',
      'content',
      'created_at',
    ],
  },
  public_reactions: {
    title: 'Public Reactions',
    description: 'Public reactions to NBA games, players, and teams',
    icon: Heart,
    endpoint: '/api/admin/database/public_reactions',
    fields: ['id', 'user_id', 'anonymous_name', 'target_type', 'target_id', 'emoji', 'created_at'],
  },
} as const;

export function AdminDatabaseContent() {
  const searchParams = useSearchParams();
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

  const { handleAsync: _handleAsync, handleSync } = useCentralizedErrorHandler({
    context: { component: 'AdminDatabaseContent', action: 'Fetch table data' },
  });

  const handleFetch = useCallback(
    async (tableName: string, page = 1, limit = API_CONFIG.pagination.DEFAULT_PAGE_SIZE) => {
      setLoading(prev => ({ ...prev, [tableName]: true }));
      setError(prev => ({ ...prev, [tableName]: '' }));

      try {
        const config = tableConfigs[tableName as keyof typeof tableConfigs];
        const response = await fetch(`${config.endpoint}?page=${page}&limit=${limit}`);
        const data = (await response.json()) as IApiResponse;

        if (data.success && data.data) {
          setTableData(prev => ({
            ...prev,
            [tableName]: data.data as Record<string, unknown>[],
          }));
          if (data.pagination) {
            setPagination(prev => ({
              ...prev,
              [tableName]: {
                page: data.pagination?.page || 1,
                limit: data.pagination?.limit || 10,
                total: data.pagination?.total || 0,
                pages: data.pagination?.totalPages || 1,
              },
            }));
          }
          setCurrentPage(prev => ({ ...prev, [tableName]: page }));
        } else {
          throw new Error(typeof data.error === 'string' ? data.error : 'Failed to fetch data');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
        setError(prev => ({ ...prev, [tableName]: errorMessage }));

        // Use centralized error handling
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'AdminDatabaseContent',
          action: `Fetch ${tableName} data`,
        });
      } finally {
        setLoading(prev => ({ ...prev, [tableName]: false }));
      }
    },
    [] // Empty dependency array since we're not using any external dependencies
  );

  useEffect(() => {
    if (activeTab === 'reactions') {
      void handleFetch('reactions', 1, API_CONFIG.pagination.DEFAULT_PAGE_SIZE);
    }
  }, [activeTab, handleFetch]);

  const formatValue = (value: unknown, _field: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object' && value !== null) {
      return (
        handleSync(() => JSON.stringify(value, null, 2), {
          action: 'Format object value',
        }) || '[Object]'
      );
    }
    if (typeof value === 'object' && value !== null) {
      return '[Object]';
    }
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
            <div className="mb-4 p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-md">
              <p className="text-semantic-error text-sm">{error[tableName]}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {tablePagination
                    ? `${tablePagination.total} total records`
                    : `${tableDataForTable.length} records`}
                </Badge>
                <LastUpdated />
              </div>
              {tablePagination && (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Page {currentTablePage} of {tablePagination.pages}
                </div>
              )}
            </div>

            <div className="h-80 sm:h-96 w-full border rounded-md">
              <div className="p-2 sm:p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b">
                        {config.fields.map(field => (
                          <th
                            key={field}
                            className="text-left p-1 sm:p-2 font-medium whitespace-nowrap"
                          >
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
                            <Database className="mx-auto h-8 w-8 sm:h-12 sm:w-12 mb-4 opacity-50" />
                            <p className="text-xs sm:text-sm">
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
                            className="border-b hover:bg-neutral-50"
                          >
                            {config.fields.map(field => (
                              <td key={field} className="p-1 sm:p-2 text-xs">
                                <div
                                  className="max-w-20 sm:max-w-32 truncate"
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
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <Button
                      onClick={() => handlePageChange(currentTablePage - 1)}
                      disabled={currentTablePage <= 1 || loading[tableName]}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      Previous
                    </Button>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Page {currentTablePage} of {tablePagination.pages}
                    </span>
                    <Button
                      onClick={() => handlePageChange(currentTablePage + 1)}
                      disabled={currentTablePage >= tablePagination.pages || loading[tableName]}
                      size="sm"
                      variant="outline"
                      className="text-xs"
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
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-full flex flex-col">
        <div className="space-y-2 flex-shrink-0 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">Database Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage database tables. This page allows you to fetch and display data from
            various tables in the system.
          </p>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="flex flex-wrap md:flex-row w-full md:space-x-2 space-y-2 md:space-y-0 bg-transparent p-0 border-0 mb-4 overflow-x-auto">
            {Object.entries(tableConfigs).map(([key, config]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 mx-0.5 sm:mx-1 rounded-md border transition-all duration-200 text-xs sm:text-sm flex-shrink-0
            bg-neutral-100 text-neutral-700 border-neutral-200 shadow-sm
            dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600
            hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-neutral-100
            data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-md
            dark:data-[state=active]:bg-blue-500 dark:data-[state=active]:text-white dark:data-[state=active]:border-blue-500 dark:data-[state=active]:shadow-md"
              >
                <config.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{config.title}</span>
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
                <div style={{ display: activeTab === 'public_comments' ? 'block' : 'none' }}>
                  <PublicCommentsTableWithSearch />
                </div>
                <div style={{ display: activeTab === 'public_reactions' ? 'block' : 'none' }}>
                  <PublicReactionsTableWithSearch />
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
                      'public_comments',
                      'public_reactions',
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
