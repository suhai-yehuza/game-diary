import dynamic from 'next/dynamic';

// Lazy loading components for protected pages
export const LazyUserPage = dynamic(() => import('@/app/protected/user/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading user dashboard...</p>
      </div>
    </div>
  ),
  ssr: true,
});

export const LazyClientPage = dynamic(() => import('@/app/protected/client/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading client dashboard...</p>
      </div>
    </div>
  ),
  ssr: true,
});

export const LazyAdminDatabasePage = dynamic(() => import('@/app/protected/admin/database/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading admin database...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export const LazyDashboardPage = dynamic(() => import('@/app/dashboard/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
      </div>
    </div>
  ),
  ssr: true,
});
