'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { useCentralizedErrorHandler } from '@/hooks/use-centralized-error-handler';
import { API_CONFIG } from '@/lib/config/app.config';
import type { IAuditLog, IFilters, AuditLogSearchField } from '@/types';
import { ErrorBoundary } from '@src/app/protected/admin/database/components/ui/error-boundary';
import { PaginationControls } from '@src/app/protected/admin/database/components/ui/pagination-controls';

export function AdminAuditLogsContent() {
  const { resolvedTheme } = useTheme();
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<AuditLogSearchField>('all');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const { handleAsync, handleSync } = useCentralizedErrorHandler({
    context: { component: 'AdminAuditLogsContent', action: 'Fetch audit logs' },
  });

  // Calculate pagination range
  const pageSize = API_CONFIG.pagination.DEFAULT_PAGE_SIZE; // Use consistent page size
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Pagination handlers
  const handleFirst = () => {
    setCurrentPage(1);
    void fetchLogs(filters, 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      void fetchLogs(filters, currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      void fetchLogs(filters, currentPage + 1);
    }
  };

  const handleLast = () => {
    setCurrentPage(totalPages);
    void fetchLogs(filters, totalPages);
  };

  // Handle sort without causing re-renders
  const handleSort = useCallback((key: string, direction: 'asc' | 'desc' | null) => {
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
  const sortedLogs = useMemo(() => {
    if (!sortKey || !sortDirection || logs.length === 0) {
      return logs;
    }

    return [...logs].sort((a, b) => {
      const aValue = a[sortKey as keyof IAuditLog];
      const bValue = b[sortKey as keyof IAuditLog];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const aStr = safeToString(aValue);
      const bStr = safeToString(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [logs, sortKey, sortDirection]);

  // Filter logs based on search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return sortedLogs;

    const term = searchTerm.toLowerCase();
    return sortedLogs.filter(log => {
      switch (searchField) {
        case 'category':
          return log.category?.toLowerCase().includes(term) ?? false;
        case 'action':
          return log.action.toLowerCase().includes(term);
        case 'severity':
          return log.severity?.toLowerCase().includes(term) ?? false;
        case 'user_id':
          return log.userId?.toLowerCase().includes(term) ?? false;
        case 'description':
          return log.description?.toLowerCase().includes(term) ?? false;
        case 'all':
        default:
          return (
            (log.category?.toLowerCase().includes(term) ?? false) ||
            log.action.toLowerCase().includes(term) ||
            (log.severity?.toLowerCase().includes(term) ?? false) ||
            (log.userId?.toLowerCase().includes(term) ?? false) ||
            (log.description?.toLowerCase().includes(term) ?? false)
          );
      }
    });
  }, [sortedLogs, searchTerm, searchField]);

  const fetchLogs = useCallback(
    async (pageFilters?: IFilters, page = 1) => {
      setLoading(true);
      setError(null);

      const result = await handleAsync(
        async () => {
          const params = new URLSearchParams({
            limit: API_CONFIG.pagination.DEFAULT_PAGE_SIZE.toString(),
            offset: ((page - 1) * API_CONFIG.pagination.DEFAULT_PAGE_SIZE).toString(),
            ...pageFilters,
          });

          const response = await fetch(`/api/admin/audit-logs?${params}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = (await response.json()) as { logs: IAuditLog[]; total?: number };
          setLogs(data.logs ?? []);
          setTotalCount(data.total ?? 0);
          setTotalPages(
            Math.ceil((data.total ?? data.logs.length) / API_CONFIG.pagination.DEFAULT_PAGE_SIZE)
          );
          return data;
        },
        {
          action: 'Fetch audit logs',
        }
      );

      if (!result) {
        setError('Failed to fetch logs');
      }
      setLoading(false);
    },
    [handleAsync]
  );

  const handleFilterChange = (key: keyof IFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    setCurrentPage(1);
    void fetchLogs(newFilters, 1);
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    const result = await handleAsync(
      async () => {
        const response = await fetch('/api/admin/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters),
        });

        if (!response.ok) {
          throw new Error(`Export failed: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return true;
      },
      {
        action: 'Export audit logs',
      }
    );

    if (!result) {
      setError('Export failed');
    }
    setExporting(false);
  };

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]); // Include fetchLogs in dependencies

  const getCategoryColor = (category: string | undefined) => {
    if (!category) {
      const isDark = resolvedTheme === 'dark';
      return isDark
        ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
        : 'bg-neutral-600 text-white border-neutral-700';
    }
    const isDark = resolvedTheme === 'dark';

    switch (category.toLowerCase()) {
      case 'authentication':
        return isDark
          ? 'bg-emerald-900/60 text-emerald-100 border-emerald-700'
          : 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'authorization':
        return isDark
          ? 'bg-emerald-900/60 text-emerald-100 border-emerald-700'
          : 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'data_access':
        return isDark
          ? 'bg-indigo-900/20 text-indigo-300 border-indigo-700'
          : 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'encryption':
        return isDark
          ? 'bg-teal-900/20 text-teal-300 border-teal-700'
          : 'bg-teal-100 text-teal-800 border-teal-300';
      case 'key_management':
        return isDark
          ? 'bg-cyan-900/20 text-cyan-300 border-cyan-700'
          : 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'rls_access':
        return isDark
          ? 'bg-sky-900/20 text-sky-300 border-sky-700'
          : 'bg-sky-100 text-sky-800 border-sky-300';
      case 'security':
        return isDark
          ? 'bg-rose-900/20 text-rose-300 border-rose-700'
          : 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return isDark
          ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
          : 'bg-neutral-600 text-white border-neutral-700';
    }
  };

  const getSeverityColor = (severity: string | undefined) => {
    if (!severity) {
      const isDark = resolvedTheme === 'dark';
      return isDark
        ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
        : 'bg-neutral-600 text-white border-neutral-700';
    }
    const isDark = resolvedTheme === 'dark';

    switch (severity.toLowerCase()) {
      case 'critical':
        return isDark
          ? 'bg-red-900/20 text-red-300 border-red-700'
          : 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return isDark
          ? 'bg-orange-900/20 text-orange-300 border-orange-700'
          : 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return isDark
          ? 'bg-yellow-900/20 text-yellow-300 border-yellow-700'
          : 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return isDark
          ? 'bg-green-900/20 text-green-300 border-green-700'
          : 'bg-green-100 text-green-800 border-green-300';
      default:
        return isDark
          ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
          : 'bg-neutral-600 text-white border-neutral-700';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return (
      handleSync(
        () => {
          const date = new Date(timestamp);
          return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        },
        {
          action: 'Format timestamp',
        }
      ) || 'Invalid Date'
    );
  };

  const truncateUserId = (userId: string | undefined) => {
    if (!userId) return 'N/A';
    if (userId === 'unknown' || userId === 'system') return userId;
    return userId.length > 20 ? `${userId.substring(0, 20)}...` : userId;
  };

  // Search component
  const TableSearch = () => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
      setLocalSearchTerm(searchTerm);
    }, []);

    const handleSearchChange = (value: string) => {
      setLocalSearchTerm(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        setSearchTerm(value);
      }, 300);
    };

    const handleFieldChange = (field: string) => {
      setSearchField(field as AuditLogSearchField);
    };

    const handleClear = () => {
      setLocalSearchTerm('');
      setSearchTerm('');
    };

    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={localSearchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full pl-10 pr-10 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {localSearchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={searchField}
            onChange={e => handleFieldChange(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
          >
            <option value="all">All Fields</option>
            <option value="category">Category</option>
            <option value="action">Action</option>
            <option value="severity">Severity</option>
            <option value="user_id">User ID</option>
            <option value="description">Description</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {localSearchTerm && (
          <button
            onClick={handleClear}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground hover:bg-muted transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    );
  };

  // Sortable header component
  const SortableHeader = ({
    children,
    sortKey,
    currentSortKey,
    currentSortDirection,
    onSort,
  }: {
    children: React.ReactNode;
    sortKey: string;
    currentSortKey: string | null;
    currentSortDirection: 'asc' | 'desc' | null;
    onSort: (key: string, direction: 'asc' | 'desc' | null) => void;
  }) => {
    const isActive = currentSortKey === sortKey;
    const isAsc = isActive && currentSortDirection === 'asc';
    const isDesc = isActive && currentSortDirection === 'desc';

    const handleClick = () => {
      let newDirection: 'asc' | 'desc' | null;
      if (!isActive) {
        newDirection = 'asc';
      } else if (isAsc) {
        newDirection = 'desc';
      } else {
        newDirection = null;
      }
      onSort(sortKey, newDirection);
    };

    const getSortIcon = () => {
      if (isAsc) {
        return <ArrowUp data-testid="arrow-up" className="h-4 w-4 text-white" />;
      } else if (isDesc) {
        return <ArrowDown data-testid="arrow-down" className="h-4 w-4 text-white" />;
      } else {
        return (
          <ArrowUpDown
            data-testid="arrow-up-down"
            className="h-4 w-4 text-white/70 hover:text-white transition-colors"
          />
        );
      }
    };

    return (
      <th
        className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wide border-r border-emerald-500/30 cursor-pointer hover:bg-emerald-500/20 transition-colors duration-150"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between group">
          <span className="font-medium">{children}</span>
          <div className="flex items-center ml-2">{getSortIcon()}</div>
        </div>
      </th>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary componentName="AdminAuditLogsContent">
      <div className="container mx-auto p-6 h-full flex flex-col">
        <div className="space-y-2 flex-shrink-0">
          <h1 className="text-2xl font-bold">Admin Audit Logs</h1>
          <p className="text-muted-foreground">
            View and manage system audit logs. Monitor security events, user actions, and system
            activities.
          </p>
        </div>

        <div className="flex-1 flex flex-col min-h-0 space-y-6">
          {/* Filters Section */}
          <div className="bg-card dark:bg-card rounded-xl shadow-sm border border-border dark:border-border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-200 to-gray-200 dark:from-neutral-700 dark:to-neutral-700 border-b border-gray-300 dark:border-neutral-600">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-800 dark:text-neutral-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filter Audit Logs
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-input dark:border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:border-ring dark:focus:border-ring transition-colors bg-background dark:bg-background text-foreground dark:text-foreground"
                    onChange={e => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="authentication">Authentication</option>
                    <option value="authorization">Authorization</option>
                    <option value="data_access">Data Access</option>
                    <option value="encryption">Encryption</option>
                    <option value="key_management">Key Management</option>
                    <option value="rls_access">RLS Access</option>
                    <option value="security">Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                    Severity
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-input dark:border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:border-ring dark:focus:border-ring transition-colors bg-background dark:bg-background text-foreground dark:text-foreground"
                    onChange={e => handleFilterChange('severity', e.target.value)}
                  >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input dark:border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:border-ring dark:focus:border-ring transition-colors bg-background dark:bg-background text-foreground dark:text-foreground placeholder-muted-foreground dark:placeholder-muted-foreground"
                    placeholder="Filter by user ID"
                    onChange={e => handleFilterChange('userId', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-input dark:border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:border-ring dark:focus:border-ring transition-colors bg-background dark:bg-background text-foreground dark:text-foreground"
                    onChange={e => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-input dark:border-input rounded-lg shadow-sm focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:border-ring dark:focus:border-ring transition-colors bg-background dark:bg-background text-foreground dark:text-foreground"
                    onChange={e => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => void handleExport()}
                    disabled={exporting}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
                  >
                    {exporting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Exporting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Export CSV
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <TableSearch />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400 dark:text-red-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pagination Info */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {startItem}-{endItem} of {totalCount} total audit logs
              </div>
              <div className="text-sm text-muted-foreground">
                Page{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {currentPage}
                </span>{' '}
                of {totalPages}
              </div>
            </div>
          )}

          {/* Logs Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full transition-all duration-200 ease-in-out">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wide border-r border-emerald-500/30">
                      #
                    </th>
                    <SortableHeader
                      sortKey="timestamp"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Timestamp
                    </SortableHeader>
                    <SortableHeader
                      sortKey="category"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Category
                    </SortableHeader>
                    <SortableHeader
                      sortKey="action"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Action
                    </SortableHeader>
                    <SortableHeader
                      sortKey="severity"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Severity
                    </SortableHeader>
                    <SortableHeader
                      sortKey="user_id"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      User
                    </SortableHeader>
                    <SortableHeader
                      sortKey="success"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      Status
                    </SortableHeader>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wide border-r border-emerald-500/30">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="text-muted-foreground dark:text-muted-foreground">
                          <svg
                            className="mx-auto h-12 w-12 text-muted-foreground dark:text-muted-foreground mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-lg font-medium">No audit logs found</p>
                          <p className="text-sm">Try adjusting your filters or search terms.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => {
                      const rowNumber =
                        (currentPage - 1) * API_CONFIG.pagination.DEFAULT_PAGE_SIZE + index + 1;
                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-muted/50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-medium text-center">
                            {rowNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(log.category)}`}
                            >
                              {log.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                            {log.action.replace(/_/g, ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}
                            >
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                            {truncateUserId(log.userId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                log.success
                                  ? resolvedTheme === 'dark'
                                    ? 'bg-green-900/20 text-green-300 border-green-700'
                                    : 'bg-green-100 text-green-800 border-green-300'
                                  : resolvedTheme === 'dark'
                                    ? 'bg-red-900/20 text-red-300 border-red-700'
                                    : 'bg-red-100 text-red-800 border-red-300'
                              }`}
                            >
                              {log.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            <div
                              className="max-w-xs truncate"
                              title={log.description ?? 'No description'}
                            >
                              {log.description ?? 'No description'}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <PaginationControls
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={currentPage}
            pageInfo={{
              hasPreviousPage: currentPage > 1,
              hasNextPage: currentPage < totalPages,
              startCursor: null,
              endCursor: null,
            }}
            loading={loading}
            onPageChange={(page: number) => setCurrentPage(page)}
            onFirst={handleFirst}
            onPrev={handlePrev}
            onNext={handleNext}
            onLast={handleLast}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
