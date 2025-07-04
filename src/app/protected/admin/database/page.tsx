'use client';

import { Bell, Database, Heart, Loader2, MessageSquare, Star, UserPlus, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@src/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/app/components/ui/tabs';
import type { IApiResponse, IBadgeProps, IAdminButtonProps } from '@src/lib/types/uiTypes';

// Constants
const TABLE_DISPLAY_LIMIT = 50;

// Simple Badge component
const Badge = ({ children, variant = 'default', className = '' }: IBadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
    } ${className}`}
  >
    {children}
  </span>
);

// Simple Button component
const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: IAdminButtonProps) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      variant === 'outline'
        ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
        : 'bg-primary text-primary-foreground hover:bg-primary/90'
    } ${size === 'sm' ? 'h-9 px-3' : 'h-10 px-4 py-2'} ${className}`}
    {...props}
  >
    {children}
  </button>
);

function isRecordArray(data: unknown): data is Record<string, unknown>[] {
  return Array.isArray(data) && data.every(item => typeof item === 'object' && item !== null);
}

function AdminDatabaseContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, Record<string, unknown>[]>>({});
  const [error, setError] = useState<string | null>(null);

  const tableConfigs = useMemo(
    () => ({
      users: {
        title: 'Users',
        icon: Users,
        description: 'User accounts and profiles',
        fields: ['id', 'username', 'first_name', 'last_name', 'email_address', 'created_at'],
      },
      game_logs: {
        title: 'Game Logs',
        icon: Database,
        description: 'User game watching history and ratings',
        fields: [
          'id',
          'user_id',
          'game_id',
          'rating_for_game',
          'watched_setting',
          'watched_date',
          'created_at',
        ],
      },
      comments: {
        title: 'Comments',
        icon: MessageSquare,
        description: 'User comments on game logs and other content',
        fields: ['id', 'user_id', 'parent_id', 'parent_type', 'content', 'created_at'],
      },
      reactions: {
        title: 'Reactions',
        icon: Heart,
        description: 'User reactions (emojis) on content',
        fields: ['id', 'user_id', 'target_id', 'target_type', 'emoji', 'created_at'],
      },
      friendships: {
        title: 'Friendships',
        icon: UserPlus,
        description: 'User friendship relationships and status',
        fields: ['id', 'user_id', 'friend_id', 'status', 'created_at'],
      },
      game_ratings: {
        title: 'Game Ratings',
        icon: Star,
        description: 'Aggregated game ratings and statistics',
        fields: ['game_id', 'average_rating', 'total_ratings', 'created_at'],
      },
      notifications: {
        title: 'Notifications',
        icon: Bell,
        description: 'User notifications and alerts',
        fields: ['id', 'user_id', 'type', 'title', 'message', 'created_at'],
      },
      nba_games: {
        title: 'NBA Games',
        icon: Database,
        description: 'NBA game data and schedules',
        fields: [
          'id',
          'league',
          'season',
          'date',
          'home_team_id',
          'away_team_id',
          'status',
          'created_at',
        ],
      },
      nba_players: {
        title: 'Players',
        icon: Users,
        description: 'NBA player data and profiles',
        fields: [
          'id',
          'first_name',
          'last_name',
          'birth',
          'nba',
          'height',
          'weight',
          'college',
          'affiliation',
          'teams',
          'leagues',
          'image_url',
          'created_at',
          'updated_at',
          'deleted_at',
        ],
      },
      teams: {
        title: 'Teams',
        icon: Users,
        description: 'NBA teams data and info',
        fields: [
          'id',
          'name',
          'nickname',
          'code',
          'city',
          'logo',
          'all_star',
          'nba_franchise',
          'leagues',
          'created_at',
          'updated_at',
          'deleted_at',
        ],
      },
    }),
    []
  );

  const handleFetch = useCallback(async (tableName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/database/${tableName}`);
      const result = (await response.json()) as IApiResponse;

      if (result.success && isRecordArray(result.data)) {
        setData({ [tableName]: result.data });
      } else {
        setData({ [tableName]: [] });
        setError(result.error ?? `Failed to fetch ${tableName} data`);
      }
    } catch (err) {
      setError(
        `Error fetching ${tableName} data: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle URL parameters for tab selection
  useEffect(() => {
    const tabParam = searchParams.get('tab');

    if (tabParam && Object.keys(tableConfigs).includes(tabParam)) {
      setActiveTab(tabParam);
      // Auto-fetch data for the specified tab
      void handleFetch(tabParam);
    }
  }, [searchParams, handleFetch, tableConfigs]);

  const formatValue = (value: unknown, _field: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'symbol') return value.toString();
    return '[Unknown]';
  };

  const renderTable = (tableName: string) => {
    const config = tableConfigs[tableName as keyof typeof tableConfigs];
    const tableData = data[tableName] ?? [];
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
            <Button onClick={() => void handleFetch(tableName)} disabled={loading} size="sm">
              {loading ? (
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{tableData.length} records</Badge>
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="h-96 w-full border rounded-md">
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {config.fields.map(field => (
                          <th key={field} className="text-left p-2 font-medium">
                            {field
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase())}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.length === 0 ? (
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
                        tableData.slice(0, TABLE_DISPLAY_LIMIT).map((row, index) => (
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
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing first {TABLE_DISPLAY_LIMIT} of {tableData.length} records
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Database Management</h1>
        <p className="text-muted-foreground">
          View and manage database tables. This page allows you to fetch and display data from
          various tables in the system.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-col md:flex-row w-full md:space-x-2 space-y-2 md:space-y-0">
          {Object.entries(tableConfigs).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex-1 flex items-center gap-2 min-w-0 truncate justify-center"
            >
              <config.icon className="h-4 w-4" />
              <span className="hidden sm:inline truncate">{config.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(tableConfigs).map(tableName => (
          <TabsContent key={tableName} value={tableName}>
            {renderTable(tableName)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function AdminDatabasePage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminDatabaseContent />
    </div>
  );
}
