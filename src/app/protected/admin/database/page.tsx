'use client';

import { Bell, Database, Heart, Loader2, MessageSquare, Star, UserPlus, Users } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@src/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/app/components/ui/tabs';
import { API_CONFIG } from '@src/lib/config/api.config';
import type { IApiResponse, IBadgeProps, IAdminButtonProps } from '@src/lib/types/uiTypes';

// Constants

// Add GraphQL query for users
const SEARCH_USERS_QUERY = `
  query SearchUsers($first: Int, $after: String, $searchTerm: String, $searchField: String) {
    searchUsers(first: $first, after: $after, searchTerm: $searchTerm, searchField: $searchField) {
      edges {
        node {
          id
          username
          first_name
          last_name
          email_address
          phone_number
          image_url
          created_at
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

interface IUserSummary {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number?: string;
  image_url?: string;
  created_at?: string;
}
interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}
interface ISearchUsersResponse {
  data?: {
    searchUsers?: {
      edges?: { node?: IUserSummary; cursor: string }[];
      pageInfo?: IPageInfo;
      totalCount?: number;
    };
  };
  errors?: { message: string }[];
}

function UsersTableWithSearch() {
  const [users, setUsers] = useState<IUserSummary[]>([]);
  const [pageInfo, setPageInfo] = useState<IPageInfo>({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchField, setSearchField] = useState<
    'all' | 'username' | 'first_name' | 'last_name' | 'email_address'
  >('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(
    async (opts: { after?: string | null; searchTerm?: string; page?: number } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: SEARCH_USERS_QUERY,
            variables: {
              first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
              after: opts.after ?? null,
              searchTerm: opts.searchTerm ?? searchTerm,
              searchField: searchField,
            },
          }),
        });
        const json = (await res.json()) as unknown as ISearchUsersResponse;
        if (json.errors && json.errors.length > 0) throw new Error(json.errors[0].message);
        const data = json.data?.searchUsers;
        setUsers(
          Array.isArray(data?.edges) ? data.edges.map(e => e.node ?? ({} as IUserSummary)) : []
        );
        setPageInfo(
          data?.pageInfo ?? {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          }
        );
        // Set total count if available
        if (data?.totalCount) {
          setTotalCount(data.totalCount);
        }
      } catch (err: unknown) {
        let message = 'Failed to fetch users';
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  useEffect(() => {
    if (after === null) void fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        setAfter(null);
        setCurrentPage(1);
        void fetchUsers({ searchTerm: searchTerm.trim() });
      } else if (searchTerm === '') {
        setAfter(null);
        setCurrentPage(1);
        void fetchUsers({ searchTerm: '' });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchField, fetchUsers]);

  // Click outside handler for advanced search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAdvancedSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNext = () => {
    setAfter(pageInfo.endCursor);
    setCurrentPage(prev => prev + 1);
    void fetchUsers({ after: pageInfo.endCursor });
  };

  const handlePrev = () => {
    setAfter(null);
    setCurrentPage(1);
    void fetchUsers({ after: null });
  };

  const handleFirst = () => {
    setAfter(null);
    setCurrentPage(1);
    void fetchUsers({ after: null });
  };

  const handleLast = () => {
    // Calculate the last page number
    const totalPages = Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE);
    setCurrentPage(totalPages);

    // For cursor-based pagination, we'll fetch all users and get the last page worth
    // This is not the most efficient for large datasets, but it works for the current use case
    setLoading(true);
    setError(null);

    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SEARCH_USERS_QUERY,
        variables: {
          first: totalCount, // Fetch all users
          after: null,
          searchTerm: searchTerm,
        },
      }),
    })
      .then(res => res.json())
      .then((json: ISearchUsersResponse) => {
        if (json.errors && json.errors.length > 0) throw new Error(json.errors[0].message);
        const data = json.data?.searchUsers;
        const allUsers = Array.isArray(data?.edges)
          ? data.edges.map(e => e.node ?? ({} as IUserSummary))
          : [];

        // Get the last page worth of users
        const lastPageStart = (totalPages - 1) * API_CONFIG.pagination.DEFAULT_PAGE_SIZE;
        const lastPageUsers = allUsers.slice(lastPageStart);

        setUsers(lastPageUsers);
        setPageInfo({
          hasNextPage: false,
          hasPreviousPage: totalPages > 1,
          startCursor: lastPageUsers[0]?.id ?? null,
          endCursor: lastPageUsers[lastPageUsers.length - 1]?.id ?? null,
        });
      })
      .catch((err: unknown) => {
        let message = 'Failed to fetch last page';
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getInitials = (
    firstName: string | null | undefined,
    lastName: string | null | undefined
  ) => {
    const first = firstName?.charAt(0) ?? '';
    const last = lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || '?';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Users Search</CardTitle>
            <CardDescription>Search and browse user accounts</CardDescription>
          </div>
          <div className="flex gap-2" ref={searchRef}>
            <div className="flex gap-2 relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="bg-gray-100 text-gray-700 border border-gray-300 shadow px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-200 active:shadow focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Filters
              </button>
              {showAdvancedSearch && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-4 z-50 min-w-48">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Search Field
                      </label>
                      <select
                        value={searchField}
                        onChange={e =>
                          setSearchField(
                            e.target.value as
                              | 'all'
                              | 'username'
                              | 'first_name'
                              | 'last_name'
                              | 'email_address'
                          )
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value="all">All Fields</option>
                        <option value="username">Username</option>
                        <option value="first_name">First Name</option>
                        <option value="last_name">Last Name</option>
                        <option value="email_address">Email Address</option>
                      </select>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Search will update automatically as you type
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col h-full space-y-2">
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {totalCount > 0 ? `${totalCount} total users` : `${users.length} users`}
              </Badge>
              <LastUpdated />
            </div>
            {totalCount > 0 && (
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of{' '}
                {Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE)}
              </div>
            )}
          </div>

          <div className="w-full border rounded-md flex-1 min-h-0">
            <div className="p-4 h-full flex flex-col">
              <div className="overflow-x-auto flex-1 min-h-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">#</th>
                      <th className="text-left p-2 font-medium">avatar</th>
                      <th className="text-left p-2 font-medium">id</th>
                      <th className="text-left p-2 font-medium">username</th>
                      <th className="text-left p-2 font-medium">first_name</th>
                      <th className="text-left p-2 font-medium">last_name</th>
                      <th className="text-left p-2 font-medium">email_address</th>
                      <th className="text-left p-2 font-medium">phone_number</th>
                      <th className="text-left p-2 font-medium">created_at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-muted-foreground">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
                          <p>Loading users...</p>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-muted-foreground">
                          <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>
                            {searchTerm
                              ? 'No users found matching your search.'
                              : 'No users loaded. Use the search to find users.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <tr
                          key={user.id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <td className="p-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {(currentPage - 1) * API_CONFIG.pagination.DEFAULT_PAGE_SIZE +
                                index +
                                1}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-center">
                              {user.image_url ? (
                                <Image
                                  src={user.image_url}
                                  alt={`${user.first_name || 'User'} avatar`}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                  {getInitials(user.first_name, user.last_name)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                              {user.id}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {user.username ?? 'N/A'}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {user.first_name ?? 'N/A'}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {user.last_name ?? 'N/A'}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="max-w-48 truncate" title={user.email_address ?? 'N/A'}>
                              {user.email_address ?? 'N/A'}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="max-w-32 truncate" title={user.phone_number ?? 'N/A'}>
                              {user.phone_number ?? 'N/A'}
                            </div>
                          </td>
                          <td className="p-2">
                            <div
                              className="text-sm text-gray-600 dark:text-gray-400"
                              title={user.created_at ?? 'N/A'}
                            >
                              {formatDate(user.created_at)}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalCount > API_CONFIG.pagination.DEFAULT_PAGE_SIZE && (
                <div className="mt-2 flex items-center justify-center gap-2 flex-shrink-0">
                  <Button
                    onClick={handleFirst}
                    disabled={currentPage === 1 || loading}
                    size="sm"
                    variant="outline"
                  >
                    First
                  </Button>
                  <Button
                    onClick={handlePrev}
                    disabled={!pageInfo.hasPreviousPage || loading}
                    size="sm"
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of{' '}
                    {Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE)}
                  </span>
                  <Button
                    onClick={handleNext}
                    disabled={!pageInfo.hasNextPage || loading}
                    size="sm"
                    variant="outline"
                  >
                    Next
                  </Button>
                  <Button
                    onClick={handleLast}
                    disabled={
                      currentPage ===
                        Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE) || loading
                    }
                    size="sm"
                    variant="outline"
                  >
                    Last
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

function LastUpdated() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
  }, []);
  if (!time) return null;
  return <span className="text-sm text-muted-foreground">Last updated: {time}</span>;
}

function AdminDatabaseContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, Record<string, unknown>[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<
    Record<string, { page: number; limit: number; total: number; pages: number }>
  >({});
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});

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

  const handleFetch = useCallback(async (tableName: string, page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(`/api/admin/database/${tableName}`, window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', limit.toString());

      const response = await fetch(url.toString());
      const result = (await response.json()) as IApiResponse;

      if (result.data && isRecordArray(result.data)) {
        setData(prev => ({ ...prev, [tableName]: result.data as Record<string, unknown>[] }));
        if (result.pagination) {
          setPagination(prev => ({
            ...prev,
            [tableName]: result.pagination as {
              page: number;
              limit: number;
              total: number;
              pages: number;
            },
          }));
          setCurrentPage(prev => ({ ...prev, [tableName]: page }));
        }
      } else {
        setData(prev => ({ ...prev, [tableName]: [] }));
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
              disabled={loading}
              size="sm"
              className="bg-rose-100 text-rose-900 border border-rose-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-rose-200 active:shadow focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-700 dark:hover:bg-rose-800"
            >
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {tablePagination
                    ? `${tablePagination.total} total records`
                    : `${tableData.length} records`}
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
                        tableData.map((row, index) => (
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
                      disabled={currentTablePage <= 1 || loading}
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
                      disabled={currentTablePage >= tablePagination.pages || loading}
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
    <div className="container mx-auto p-6 h-full flex flex-col">
      <div className="space-y-2 flex-shrink-0">
        <h1 className="text-2xl font-bold">Database Management</h1>
        <p className="text-muted-foreground">
          View and manage database tables. This page allows you to fetch and display data from
          various tables in the system.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="flex flex-col md:flex-row w-full md:space-x-3 space-y-2 md:space-y-0 bg-transparent p-0 border-0">
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
          <TabsContent key={tableName} value={tableName} className="flex-1 flex flex-col min-h-0">
            {activeTab === 'users' ? <UsersTableWithSearch /> : renderTable(tableName)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function AdminDatabasePage() {
  return (
    <div className="bg-background h-screen flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <AdminDatabaseContent />
      </div>
    </div>
  );
}
