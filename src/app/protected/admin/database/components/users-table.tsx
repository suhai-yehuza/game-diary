'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import {
  PaginationInfo,
  ErrorDisplay,
  PaginationControls,
  TableSearch,
  ErrorBoundary,
  SortableHeader,
} from '@src/app/protected/admin/database/components/ui';
import { API_CONFIG } from '@src/lib/config/api.config';
import { SEARCH_USERS_ADMIN } from '@src/lib/graphql/queries';
import type {
  IUserSummary,
  IPageInfo,
  ISearchUsersResponse,
  UserSearchField,
} from '@src/lib/types';

export function UsersTableWithSearch() {
  const [rawUsers, setRawUsers] = useState<IUserSummary[]>([]);
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
  const [searchField, setSearchField] = useState<UserSearchField>('all');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  // Handle sort without causing re-renders
  const handleSort = React.useCallback((key: string, direction: 'asc' | 'desc' | null) => {
    setSortKey(direction ? key : null);
    setSortDirection(direction);
  }, []);

  // Helper function to safely convert values to strings
  const safeToString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value instanceof Date) return value.toISOString();
    return '[Object]';
  };

  // Direct sorting without useMemo dependencies
  const users = React.useMemo(() => {
    if (!sortKey || !sortDirection || rawUsers.length === 0) {
      return rawUsers;
    }

    return [...rawUsers].sort((a, b) => {
      const aValue = a[sortKey as keyof IUserSummary];
      const bValue = b[sortKey as keyof IUserSummary];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const aStr = safeToString(aValue);
      const bStr = safeToString(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [rawUsers, sortKey, sortDirection]);

  const fetchUsers = React.useCallback(
    async (opts: { after?: string | null; searchTerm?: string; page?: number } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: SEARCH_USERS_ADMIN.loc?.source.body,
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
        const fetchedUsers = Array.isArray(data?.edges)
          ? data.edges.map(e => e.node ?? ({} as IUserSummary))
          : [];

        // Store raw data - sorting is handled by useMemo
        setRawUsers(fetchedUsers);
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
    [searchTerm, searchField]
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
        query: SEARCH_USERS_ADMIN.loc?.source.body,
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

        setRawUsers(lastPageUsers);
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
    <ErrorBoundary componentName="UsersTable">
      <div className="space-y-4">
        {/* Search Section */}
        <TableSearch
          searchTerm={searchTerm}
          searchField={searchField}
          searchFields={[
            { value: 'all', label: 'All Fields' },
            { value: 'username', label: 'Username' },
            { value: 'first_name', label: 'First Name' },
            { value: 'last_name', label: 'Last Name' },
            { value: 'email_address', label: 'Email Address' },
          ]}
          onSearchChange={(term, field) => {
            setSearchTerm(term);
            setSearchField(field as UserSearchField);
          }}
          onClear={() => setSearchTerm('')}
          placeholder="Search users..."
        />

        {/* Error Display */}
        <ErrorDisplay error={error} />

        {/* Pagination Info - Top */}
        <PaginationInfo
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={API_CONFIG.pagination.DEFAULT_PAGE_SIZE}
          itemLabel="users"
        />

        {/* Users Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full transition-all duration-200 ease-in-out">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider border-b border-border">
                    #
                  </th>
                  <SortableHeader
                    sortKey="username"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    username
                  </SortableHeader>
                  <SortableHeader
                    sortKey="id"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    user_id
                  </SortableHeader>
                  <SortableHeader
                    sortKey="email_address"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    email_address
                  </SortableHeader>
                  <SortableHeader
                    sortKey="phone_number"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    phone_number
                  </SortableHeader>
                  <SortableHeader
                    sortKey="created_at"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    created_at
                  </SortableHeader>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {(currentPage - 1) * API_CONFIG.pagination.DEFAULT_PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.image_url ? (
                              <Image
                                className="h-10 w-10 rounded-full"
                                src={user.image_url}
                                alt={`${user.first_name} ${user.last_name}`}
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                                {getInitials(user.first_name, user.last_name)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {user.email_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.phone_number ?? 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls - Bottom */}
        <PaginationControls
          totalCount={totalCount}
          currentPage={currentPage}
          pageInfo={pageInfo}
          loading={loading}
          onFirst={handleFirst}
          onPrev={handlePrev}
          onNext={handleNext}
          onLast={handleLast}
        />
      </div>
    </ErrorBoundary>
  );
}
